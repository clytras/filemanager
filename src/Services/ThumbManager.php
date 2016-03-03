<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;
use Intervention\Image\ImageManager;

/**
 * Class ThumbManager
 * @package Crip\FileManager\Services
 */
class ThumbManager implements ICripObject
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
     * @param UrlManager $url
     */
    public function __construct(UrlManager $url)
    {
        $this->thumb_sizes = array_merge_recursive($this->thumb_sizes, FileManager::package()->config('thumbs', []));
        $this->url = $url;
    }

    /**
     * @param PathManager $path
     * @param CripFile $file
     *
     * @return array
     */
    public function create(PathManager $path, CripFile $file)
    {
        foreach ($this->thumb_sizes as $size_key => $sizes) {
            $img = app(ImageManager::class)->make($path->fullPath($file));
            $new_path = $path->thumbPath($size_key);
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
            $img->save($path->thumbPath($size_key, $file));
            $this->thumbs[] = $this->url->getFileUrl($path, $file, $size_key);
        }

        return $this->thumbs;
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
}