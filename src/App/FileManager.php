<?php namespace Crip\FileManager\App;

use File;
use Illuminate\Foundation\Application;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Crip\FileManager\App\Contracts\IMime;
use Crip\FileManager\App\Exceptions\FilemanagerException;
use URL;

/**
 * Class FileManager
 * @package Crip\Filemanager\App
 */
class FileManager
{
    /**
     * @var Application
     */
    private $app;

    private $path = '';

    private $base_path = '';

    private $full_path = '';

    /**
     * @var FileManagerInfo
     */
    private $info;

    /**
     * @var string
     */
    protected $dir_action = '\Crip\Filemanager\App\Controllers\DirectoryController@dir';

    /**
     * @var string
     */
    protected $file_action = '\Crip\Filemanager\App\Controllers\FileController@get';

    /**
     * @param Application $app
     * @param IMime $mime
     */
    public function __construct(Application $app, IMime $mime)
    {
        $this->app = $app;
        $this->mime = $mime;
        $this->mime->setIconPath($this->getDefaultIconPath());
        $this->info = new FileManagerInfo();
        $this->setBasePath();
    }

    public static function icon($name)
    {
        // TODO: clear config path and check existence
        $path = str_replace(public_path(), '', Package::public_path());
        $icons = Package::config('icon_dir_url', '/' . trim(trim(str_replace('\\', '/', $path)), '/\\')) . '/';
        return $icons . trim(trim($name), '/\\');
    }

    public function changePath($path)
    {
        $this->path = $this->trimPath($path);
        $this->full_path = $this->trimPath($this->base_path . $this->path) . '/';

        if (!File::exists($this->full_path)) {
            throw new FilemanagerException(
                Package::trans('err_path_not_exist', ['path' => $this->path])
            );
        }
        if (File::type($this->full_path) !== 'dir') {
            throw new FilemanagerException(
                Package::trans('err_path_not_dir', ['path' => $this->path])
            );
        }
        if (strpos($this->path, '..') !== false || strpos($this->path, '.\\') || strpos($this->path, './')) {
            throw new FilemanagerException(
                Package::trans('err_incorrect_path', ['path' => $this->path])
            );
        }

        return $this;
    }

    public function upload(UploadedFile $file)
    {
        if ($file->isValid()) {
            $file_info = $this->info->readFromFile($file);
            $name = $this->getFileName($file_info->name, $file_info->extension);
            $file->move($this->full_path, $name);
            if ($this->mime->isImage($file_info->mime)) {
                $this->createThumbs($name);
            }

            return $this->existingFileResponse($name, Package::trans('success_file_uploaded_to', [
                'file' => $name,
                'path' => $this->relativePath() ?: '/'
            ]));
        }

        throw new FilemanagerException(Package::trans('err_uploading_invalid_file'));
    }

    public function create($name)
    {
        $name = $this->trimPath($name);
        $info = $this->info->readFromString($name, null, 'folder');
        $name = $this->getFolderName($info->name);
        $new_path = $this->full_path . $name;
        if (File::exists($new_path)) {
            throw new FilemanagerException(Package::trans('err_create_dir_exists'));
        }
        $this->mkdir($new_path);
        return $this->folderResponse($name, false, Package::trans('success_folder_created', [
            'name' => $name,
            'path' => $this->relativePath()
        ]));
    }

    public function rename($old, $new)
    {
        $old_info = $this->info->readFromString($old);
        $new_info = $this->info->readFromString($new);
        if ($old_info->is_file) {
            return $this->renameFile($old_info, $new_info);
        }
        return $this->renameFolder($old_info, $new_info);
    }

    public function delete($name)
    {
        $name = $this->trimPath($name);
        $info = $this->info->readFromString($name, $this->full_path);
        if ($info->is_file) {
            return $this->deleteFile($info, $name);
        }

        return $this->deleteFolder($info);
    }

    public function all()
    {
        return array_merge($this->allFolders(), $this->allFiles());
    }

    public function file($name, $thumb = null)
    {
        $file_path = $this->full_path . $name;

        if ($thumb AND in_array($thumb, array_keys(Package::config('thumbs')))) {
            $thumb_path = $this->thumbPath($thumb) . $name;
            if (File::exists($thumb_path)) {
                $file_path = $thumb_path;
            }
        }

        if (File::exists($file_path)) {
            return new FileManagerFile($file_path);
        }
        throw new FilemanagerException(Package::trans('err_file_does_not_exist_in',
            ['path' => $this->relativePath() . $name]));
    }

    /**
     * Get package assets url for specific file
     *
     * @param string $path
     * @return string
     */
    public static function assets($path = 'css/app.css')
    {
        return Package::public_url() . $path;
    }

    /**
     * Translate the given package message.
     *
     * @param  string $id
     * @param  array $parameters
     * @param  string $domain
     * @param  string $locale
     * @return string
     */
    public static function trans($id, $parameters = [], $domain = 'messages', $locale = null)
    {
        return Package::trans($id, $parameters, $domain, $locale);
    }

    /**
     * Get / set the specified configuration value.
     *
     * If an array is passed as the key, we will assume you want to set an array of values.
     *
     * @param  array|string $key
     * @param  mixed $default
     * @return mixed
     */
    public static function config($key, $default = null)
    {
        return Package::config($key, $default);
    }

    /**
     * Get path for view include from filemanager
     * @param $key
     * @return string
     */
    public static function incView($key)
    {
        return Package::incView($key);
    }

    /**
     * Create thumb for uploaded image
     */
    private function createThumbs($name)
    {
        // and add one default size for filemanager
        $thumbs = [];
        foreach (Package::config('thumbs') as $size_key => $sizes) {
            // create instance
            $img = $this->app->make('Intervention\Image\ImageManager')->make($this->full_path . $name);
            // target file path
            $target_path = $this->thumbPath($size_key);
            switch ($sizes[2]) {
                case 'width':
                    // resize the image to a width of $sizes[ 0 ] and constrain aspect ratio (auto height)
                    $img->resize($sizes[0], null, function ($constraint) {
                        $constraint->aspectRatio();
                    });
                    break;
                case 'height':
                    // resize the image to a height of $sizes[ 1 ] and constrain aspect ratio (auto width)
                    $img->resize(null, $sizes[1], function ($constraint) {
                        $constraint->aspectRatio();
                    });
                    break;
                // 'resize'
                default:
                    $img->fit($sizes[0], $sizes[1]);
                    break;
            }
            $img->save($target_path . $name);
            $thumbs[] = $this->fileUrl($name, $size_key);
        }

        return $thumbs;
    }

    private function deleteThumbs($name)
    {
        foreach (Package::config('thumbs') as $size_key => $sizes) {
            $path = $this->thumbPath($size_key);
            $file = $path . $name;
            if (File::exists($file)) {
                File::delete($file);
            }
        }
    }

    private function deleteFolder(FileManagerInfo $info)
    {
        $path = $this->full_path . $info->name;
        $relative_path = $this->relativePath() . $info->name;
        if (File::exists($path) && $path !== $this->base_path) {
            foreach (Package::config('thumbs') as $thumb_name => $sizes) {
                $thumb_path = $this->thumbPath($thumb_name) . $info->name;
                if (File::exists($thumb_path)) {
                    File::deleteDirectory($thumb_path);
                }
            }
            File::deleteDirectory($path);

            return [
                'notification' => Package::trans('success_delete_folder', ['path' => $relative_path]),
                'path' => $relative_path,
            ];
        }
        throw new FilemanagerException(Package::trans('err_cant_delete',
            ['path' => $relative_path]));
    }

    private function deleteFile(FileManagerInfo $info, $name)
    {
        $file = $this->full_path . $name;
        $relative_path = $this->relativePath() . $name;
        if (File::exists($file)) {
            $is_image = $this->mime->isImage($info->mime);
            if (File::delete($file)) {
                if ($is_image) {
                    $this->deleteThumbs($name);
                }
                return [
                    'notification' => Package::trans('success_delete_file', [
                        'file' => $name
                    ]),
                    'path' => $this->relativePath() . $name,
                ];
            }
            throw new FilemanagerException(Package::trans('err_cant_delete_file_in',
                ['path' => $relative_path]));
        }
        throw new FilemanagerException(Package::trans('err_file_does_not_exist_in',
            ['path' => $relative_path]));
    }

    private function renameFolder(FileManagerInfo $old, FileManagerInfo $new)
    {
        $old_path = $this->full_path . $old->name;
        $new_path = $this->full_path . $new->name;
        if ($old_path == $new_path) {
            return $this->folderResponse($new->name, false, Package::trans('warn_rename_not_required'));
        }

        if (File::exists($old_path)) {
            $name = $new->name;
            if (File::exists($new_path)) {
                $name = $this->getFolderName($new->name);
                $new_path = $this->full_path . $name;
            }

            if (rename($old_path, $new_path)) {
                return $this->folderResponse($name, false, Package::trans('success_folder_renamed_to', [
                    'old' => $old->name,
                    'new' => $name
                ]));
            }
            throw new FilemanagerException(Package::trans('err_cant_rename_error'));
        }
        throw new FilemanagerException(Package::trans('err_cant_rename_source_not_found', ['name' => $old->name]));
    }

    private function renameFile(FileManagerInfo $old, FileManagerInfo $new)
    {
        $old_file = $this->full_path . $old->fullName();
        $new_name = $new->fullName();
        $new_file = $this->full_path . $new_name;

        if ($old_file == $new_file) {
            return $this->existingFileResponse($new->fullName(), Package::trans('warn_file_rename_not_required'));
        }

        if (File::exists($old_file)) {
            if (File::exists($new_file)) {
                $new_name = $this->getFileName($new->name, $new->extension);
                $new_file = $this->full_path . $new_name;
            }

            if (rename($old_file, $new_file)) {

                if ($this->mime->isImage($this->mime->get($new_file))) {
                    foreach (array_keys(Package::config('thumbs')) as $size) {
                        $thumb_path = $this->thumbPath($size);
                        $old_thumb_path = $thumb_path . $old->fullName();
                        if (File::exists($old_thumb_path)) {
                            rename($old_thumb_path, $thumb_path . $new_name);
                        }
                    }
                }

                return $this->existingFileResponse($new_name, Package::trans('success_file_renamed_to', [
                    'old' => $old->fullName(),
                    'new' => $new_name
                ]));
            }
            throw new FilemanagerException(Package::trans('err_cant_rename_file'));
        }
        throw new FilemanagerException(Package::trans('err_cant_rename_source_file_not_found'));
    }

    /**
     * Trim slashes/spaces from path
     *
     * @param $path
     * @return string
     */
    private function trimPath($path)
    {
        return trim(trim($path), '/\\');
    }

    private function setBasePath()
    {
        if (!$this->base_path) {
            $path = $this->trimPath(Package::config('target_dir'));
            $this->base_path = base_path($path) . '/';
            if (!File::exists($this->base_path)) {
                $this->mkdir($this->base_path);
            }
        }

        $this->full_path = $this->base_path . '/';
        return $this->base_path;
    }

    private function relativePath()
    {
        return str_replace($this->base_path, '', $this->full_path);
    }

    private function urlify($string)
    {
        return '/' . $this->trimPath(str_replace('\\', '/', $string));
    }

    private function pathUrl($name, $relative_path = null)
    {
        $path = $this->trimPath($relative_path !== null ? $relative_path : $this->relativePath());
        $url = str_replace(URL::to('/'), '', action($this->dir_action, $path . '/' . $name));

        return $this->urlify($url);
    }

    private function fileUrl($file, $thumb_size = null)
    {
        $path = $this->relativePath() . $file;
        $url = str_replace(URL::to('/'), '', action($this->file_action, $path));
        if ($thumb_size) {
            $url .= '?thumb=' . $thumb_size;
        }

        return $this->urlify($url);
    }

    private function thumbPath($size)
    {
        $target_path = $this->base_path . $this->trimPath(Package::config('thumbs_dir')) .
            '/' . $size . '/' . $this->relativePath();

        if (!File::exists($target_path)) {
            $this->mkdir($target_path);
        }

        return $target_path;
    }

    private function getFileThumbs($name)
    {
        $mime = $this->mime->get($this->full_path . $name);

        $thumbs = [
            'thumb' => $this->mime->getIcon($mime)
        ];

        if ($this->mime->isImage($mime)) {
            foreach (array_keys(Package::config('thumbs')) as $thumb_name) {
                $thumbs[$thumb_name] = $this->fileUrl($name, $thumb_name);
            }
        }

        return $thumbs;
    }

    /**
     * Create directory recursively, if it dos not exist
     *
     * @param $path
     * @return bool
     */
    private function mkdir($path)
    {
        if (!File::exists($path)) {
            return File::makeDirectory($path, 777, true);
        }

        return true;
    }

    private function getFileName($name, $extension)
    {
        $ext = '.' . $extension;
        $result_name = $name . $ext;
        if (File::exists($this->full_path . $result_name)) {
            $result_name = $name . '-1' . $ext;
            for ($i = 2; File::exists($this->full_path . $result_name); $i++) {
                $result_name = $name . '-' . $i . $ext;
            }
        }

        return $result_name;
    }

    private function getFolderName($name)
    {
        $result_name = $name;
        if (File::exists($this->full_path . $name)) {
            $result_name = $name . '-1';
            for ($i = 2; File::exists($this->full_path . $result_name); $i++) {
                $result_name = $name . '-' . $i;
            }
        }

        return $result_name;
    }

    /**
     * Get default icon path
     *
     * @return string
     */
    private function getDefaultIconPath()
    {
        $path = str_replace(public_path(), '', Package::public_path());

        return $this->urlify($path);
    }

    private function existingFileResponse($name, $notification = null)
    {
        $file = $this->full_path . $name;
        $merge = [
            'notification' => $notification,
            'size' => filesize($file),
            'date' => date('Y-m-d H:i:s', filemtime($file)),
        ];
        $thumbs = $this->getFileThumbs($name);
        $type = $this->mime->filetype($this->mime->get($file));

        return $this->response($name, $type, $thumbs, $merge);
    }

    private function folderResponse($name, $is_dir_up = false, $notification = null, $name_is_relative_path = false)
    {
        $merge = $notification ? ['notification' => $notification] : [];

        $full_path = ($name_is_relative_path ? $this->base_path : $this->full_path) . $name;
        $stat = stat($full_path);
        $merge['date'] = date('Y-m-d H:i:s', $stat['mtime']);
        $merge['size'] = $this->folderSize($full_path);

        if ($name_is_relative_path) {
            $merge['path'] = $name;
            $merge['url'] = $this->pathUrl(false, $name);
            $merge['name'] = basename($name);
        }

        if ($is_dir_up) {
            $merge['name'] = Package::trans('dir_up_text');
        }

        return $this->response($name, 'dir', ['thumb' => $this->mime->getIcon()], $merge);
    }

    private function folderSize($dir)
    {
        $size = 0;
        foreach (glob(rtrim($dir, '/') . '/*', GLOB_NOSORT) as $each) {
            $size += is_file($each) ? filesize($each) : $this->folderSize($each);
        }
        return $size;
    }

    private function response($name, $type, array $thumbs, array $merge = [])
    {
        $relative_path = $this->relativePath() . $name;
        $url = $type == 'dir' ? $this->pathUrl($name) : $this->fileUrl($name);

        $result = array_merge([
            'name' => $name,
            'path' => $relative_path,
            'type' => $type,
            'url' => $url,
            'thumbs' => $thumbs
        ], $merge);

        $this->appendImageSizeToResponse($result);

        return $result;
    }

    private function allFolders()
    {
        $directories = File::directories($this->full_path);

        // remove server path to dir
        $directories = array_map(function ($dir) {
            return basename($dir);
        }, $directories);

        // if it is root dir, remove thumbs dir from list
        if ($this->base_path == $this->full_path) {
            $directories = array_diff($directories, [Package::config('thumbs_dir')]);
        } else {
            // if it is not root dir, add possibility go back
            $directories = array_merge(['..'], $directories);
        }

        // add additional data for dirs
        return array_map(function ($directory) {
            $path = $this->relativePath() . $directory;
            if ($directory === '..') {
                $path = dirname($this->relativePath());
                if ($path === '.') {
                    $path = '';
                }
            }

            return $this->folderResponse($path, $directory === '..', null, true);
        }, $directories);
    }

    private function allFiles()
    {
        return array_map(function ($file) {
            $name = basename($file);
            return $this->existingFileResponse($name);
        }, File::files($this->full_path));
    }

    private function appendImageSizeToResponse(&$result)
    {
        if ($result['type'] == 'image') {
            list($width, $height) = getimagesize($this->base_path . $result['path']);
            $result['image'] = compact('width', 'height');
        }
    }
}