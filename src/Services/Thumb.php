<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\FileManager;
use Crip\FileManager\Traits\UsePath;
use Intervention\Image\ImageManager;

/**
 * Class Thumb
 * @package Crip\FileManager\Services
 */
class Thumb implements ICripObject, IUsePathService
{

    use UsePath;

    /**
     * @var array
     */
    private $sizes = [
        'thumb' => [
            205,
            205,
            'resize',
        ]
    ];

    /**
     * @var array
     */
    protected $thumbs = [];

    /**
     * @var Url
     */
    private $url;

    /**
     * Initialise new instance of Thumb service
     * @param Url $url
     */
    public function __construct(Url $url)
    {
        $this->url = $url;
        FileManager::package()->mergeWithConfig($this->sizes, 'thumbs');
    }

    /**
     * Get all thumb sizes
     *
     * @return array
     */
    public function getSizes()
    {
        return $this->sizes;
    }

    /**
     * Get all thumb details
     *
     * @param File $file
     * @return array
     * @throws \Crip\FileManager\Exceptions\FileManagerException
     */
    public function details(File $file)
    {
        $thumbs = [];
        if ($file->isImage()) {
            foreach ($this->sizes as $size_key => $size) {
                $thumb = getimagesize($this->getPath()->thumbPath($size_key, $file));
                list($width, $height) = $thumb;
                $thumbs[$size_key] = [
                    'url' => $this->url->forName($this->getPath(), $file->fullName(), $size_key),
                    'size' => [$width, $height]
                ];
            }
        }

        return $thumbs;
    }

    /**
     * Create thumbs for file
     *
     * @param File $file
     * @return array
     * @throws \Crip\FileManager\Exceptions\FileManagerException
     */
    public function create(File $file)
    {
        foreach ($this->sizes as $size_key => $size) {
            $img = app(ImageManager::class)->make($file->fullPath());
            $new_path = $file->getPath()->thumbPath($size_key);
            FileSystem::mkdir($new_path, 777, true);
            switch ($size[2]) {
                case 'width':
                    // resize the image to a width of $sizes[ 0 ] and constrain aspect ratio (auto height)
                    $img->resize($size[0], null, function ($constraint) {
                        $constraint->aspectRatio();
                    });
                    break;
                case 'height':
                    // resize the image to a height of $sizes[ 1 ] and constrain aspect ratio (auto width)
                    $img->resize(null, $size[1], function ($constraint) {
                        $constraint->aspectRatio();
                    });
                    break;
                // 'resize'
                default:
                    $img->fit($size[0], $size[1]);
                    break;
            }
            $img->save($file->getPath()->thumbPath($size_key, $file));
        }

        return $this->details($file);
    }

    /**
     * Rename thumbs of file
     *
     * @param File $file
     * @param File $new_file
     */
    public function rename(File $file, File $new_file)
    {
        foreach (array_keys($this->sizes) as $size) {
            $new_path = $new_file->getPath()->thumbPath($size, $new_file);
            $old_path = $file->getPath()->thumbPath($size, $file);
            if (FileSystem::exists($old_path)) {
                rename($old_path, $new_path);
            }
        }
    }

    /**
     * Delete file thumbs from filesystem
     *
     * @param File $file
     * @throws \Crip\FileManager\Exceptions\FileManagerException
     */
    public function delete(File $file)
    {
        foreach (array_keys($this->sizes) as $size) {
            $path = $file->getPath()->thumbPath($size, $file);
            if (FileSystem::exists($path)) {
                FileSystem::delete($path);
            }
        }
    }
}