<?php namespace Crip\FileManager;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Data\File;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\ThumbManager;

/**
 * Class FileManager
 * @package Crip\FileManager
 */
class FileManager implements ICripObject
{
    /**
     * @var PackageBase
     */
    private static $package;

    /**
     * @var ThumbManager
     */
    private $thumb;

    /**
     * @var PathManager
     */
    private $path;

    /**
     * @var File
     */
    private $file;

    /**
     * @param ThumbManager $thumb
     * @param PathManager $path
     */
    public function __construct(ThumbManager $thumb, PathManager $path, File $file)
    {
        static::package();

        $this->thumb = $thumb;
        $this->path = $path;
        $this->file = $file;
    }

    /**
     * @return PackageBase
     */
    public static function package()
    {
        if (!self::$package) {
            self::$package = new PackageBase('cripfilemanager', __DIR__);
        }

        return self::$package;
    }

    /**
     * @param PathManager $path
     * @param $file_name
     * @param $thumb
     *
     * @return File
     *
     * @throws FileManagerException
     */
    public function get(PathManager $path, $file_name, $thumb)
    {
        $file_path = FileSystem::join([$path->fullPath(), $file_name]);
        if ($thumb AND array_key_exists($thumb, $this->thumb->getSizes())) {
            $thumb_path = FileSystem::join([$this->path->thumbPath($thumb), $file_name]);
            if (FileSystem::exists($thumb_path)) {
                $file_path = $thumb_path;
            }
        }

        if (FileSystem::exists($file_path)) {
            return $this->file->set($file_path);
        }

        throw new FileManagerException($this, 'err_file_not_found');
    }
}