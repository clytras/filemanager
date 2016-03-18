<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Data\File;
use Crip\FileManager\FileManager;
use Intervention\Image\ImageManager;

/**
 * Class ThumbManager
 * @package Crip\FileManager\Services
 */
class ThumbManager implements ICripObject, IManagerPath
{
    /**
     * @var array
     */
    private $thumb_sizes = [
        'thumb' => [
            205,
            205,
            'resize',
        ]
    ];

    /**
     * @var UrlManager
     */
    private $url;

    /**
     * @var array
     */
    protected $thumbs = [];

    /**
     * @var PathManager
     */
    private $path_manager;

    /**
     * @param UrlManager $url
     */
    public function __construct(UrlManager $url)
    {
        $this->url = $url;
        FileManager::package()->mergeWithConfig($this->thumb_sizes, 'thumbs');
    }

    /**
     * @param File $file
     * @return array|null
     */
    public function get(File $file)
    {
        if ($file->mime->service->isImage()) {
            $thumbs = [];
            foreach ($this->thumb_sizes as $size_key => $sizes) {
                $thumbs[] = [
                    'size_key' => $size_key,
                    'url' => $this->url->getFileUrl($file, $size_key),
                    'dimensions' => getimagesize($file->getPathManager()->thumbSysPath($size_key, $file))
                ];
            }

            return $thumbs;
        }

        return null;
    }

    /**
     * Create thumbs for image
     *
     * @param File $file
     * @return array
     */
    public function create(File $file)
    {
        foreach ($this->thumb_sizes as $size_key => $sizes) {
            $img = app(ImageManager::class)->make($file->getPathManager()->sysPath($file));
            $new_path = $file->getPathManager()->thumbSysPath($size_key);
            FileSystem::mkdir($new_path, 777, true);
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
            $img->save($file->getPathManager()->thumbSysPath($size_key, $file));
            $this->thumbs[$size_key] = $this->url->getFileUrl($file, $size_key);
        }

        return $this->thumbs;
    }

    /**
     * Rename thumbs of file
     *
     * @param File $old_file
     * @param File $new_file
     */
    public function rename(File $old_file, File $new_file)
    {
        foreach (array_keys($this->thumb_sizes) as $size) {
            $new_path = $new_file->getPathManager()->thumbSysPath($size, $new_file);
            $old_path = $old_file->getPathManager()->thumbSysPath($size, $old_file);
            if (FileSystem::exists($old_path)) {
                rename($old_path, $new_path);
            }
        }
    }

    /**
     * Delete file thumbs from filesystem
     *
     * @param File $file
     */
    public function delete(File $file)
    {
        foreach (array_keys($this->thumb_sizes) as $size) {
            $path = $file->getPathManager()->thumbSysPath($size, $file);
            if (FileSystem::exists($path)) {
                FileSystem::delete($path);
            }
        }
    }

    /**
     * Get all sizes of thumbs
     *
     * @return array
     */
    public function getSizes()
    {
        return $this->thumb_sizes;
    }

    /**
     * Set path manager
     *
     * @param PathManager $manager
     * @return $this
     */
    public function setPathManager(PathManager $manager)
    {
        $this->path_manager = $manager;
        $this->url->setPathManager($manager);

        return $this;
    }

    /**
     * Get current path manager
     *
     * @return PathManager
     */
    public function getPathManager()
    {
        return $this->path_manager;
    }
}