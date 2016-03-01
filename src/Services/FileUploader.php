<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\FileManager;
use Intervention\Image\ImageManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileUploader
 * @package Crip\FileManager\Services
 */
class FileUploader implements ICripObject
{
    /**
     * Default thumb size array
     *
     * @var array
     */
    protected $thumbs = [
        'thumb' => [
            205,
            205,
            'resize',
        ]
    ];

    /**
     * @param UploadedFile $file
     * @param PathManager $path
     *
     * @return string Uploaded file name
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $file, PathManager $path)
    {
        if ($file->isValid()) {
            $crip_file = $this->getUniqueName($path, (new CripFile)->readFromFile($file));
            $file->move($path->fullPath(), $crip_file->fullName());
            if ($crip_file->mime->isImage()) {
                $this->createThumbs($path, $crip_file);
            }

            return $crip_file->fullName();
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * @param PathManager $path
     * @param CripFile $file
     *
     * @return CripFile
     */
    private function getUniqueName(PathManager $path, CripFile $file)
    {
        if (CripFile::exists($path->fullPath($file))) {
            $original_name = $file->name;
            $file->setName($file->name . '-1');
            for ($i = 2; CripFile::exists($path->fullPath($file)); $i++) {
                $file->setName($original_name . '-' . $i);
            }
        }

        return $file;
    }

    /**
     * @param PathManager $path
     * @param CripFile $file
     *
     * @return array
     */
    private function createThumbs(PathManager $path, CripFile $file)
    {
        $thumb_sizes = array_merge($this->thumbs, FileManager::package()->config('thumbs', []));
        $thumbs = [];
        foreach ($thumb_sizes as $size_key => $sizes) {
            $img = app(ImageManager::class)->make($path->fullPath($file));
            $new_path = $path->thumbPath($size_key);
            CripFile::mkdir($new_path, 777, true);
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
            $img->save(CripFile::join([$new_path, $file->fullName()]));
            $thumbs[] = UrlManager::get($path, $file, $size_key);
        }

        return $thumbs;
    }
}