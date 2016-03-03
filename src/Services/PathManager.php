<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Data\File;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\FileManager;

/**
 * Class PathManager
 * @package Crip\FileManager\Services
 */
class PathManager implements ICripObject
{
    /**
     * @var string
     */
    private $path = '';
    /**
     * @var string
     */
    private $base_path;
    /**
     * @var string
     */
    private $full_path;
    /**
     * @var \Crip\Core\Support\PackageBase
     */
    private $pck;
    /**
     * @var string
     */
    private $thumb_dir;


    public function __construct()
    {
        $this->pck = FileManager::package();
        $this->thumb_dir = Str::slug($this->pck->config('thumbs_dir', 'thumbs'));
        $this->setBasePath();
    }

    /**
     * Change
     * @param string $path
     *
     * @return PathManager
     */
    public function goToPath($path)
    {
        $this->updateFullPath($path);

        return $this;
    }

    /**
     * @param $path
     *
     * @return PathManager
     *
     * @throws FileManagerException
     */
    private function setPath($path)
    {
        $this->path = trim(FileSystem::canonical($path), '/');
        if (!FileSystem::exists($this->full_path)) {
            throw new FileManagerException($this, 'err_path_not_exist', ['path' => $this->path]);
        }
        if (FileSystem::type($this->full_path) !== 'dir') {
            throw new FileManagerException($this, 'err_path_not_dir', ['path' => $this->path]);
        }

        return $this;
    }

    /**
     * @param File $file
     * @return string
     */
    public function fullPath(File $file = null)
    {
        if ($file) {
            return FileSystem::join([$this->full_path, $file->full_name]);
        }

        return $this->full_path;
    }

    /**
     * @param $size_key
     * @param File $file
     * @return string
     */
    public function thumbPath($size_key, File $file = null)
    {
        $path = [
            $this->full_path,
            $this->thumb_dir,
            Str::slug($size_key)
        ];

        if ($file) {
            $path[] = $file->full_name;
        }

        return FileSystem::join($path);
    }

    /**
     * @return string
     */
    public function relativePath()
    {
        return $this->path;
    }

    /**
     * Update full path &| set path
     *
     * @param string $path
     *
     * @throws FileManagerException
     */
    private function updateFullPath($path = null)
    {
        if ($path !== null) {
            $this->setPath($path);
        }

        $this->full_path = FileSystem::canonical(FileSystem::join([$this->base_path, $this->path]));
    }

    /**
     * Sets base path of object
     */
    private function setBasePath()
    {
        if (!$this->base_path) {
            $path = FileSystem::canonical($this->pck->config('target_dir'));
            $this->base_path = base_path($path);
            FileSystem::mkdir($this->base_path, 777, true);
        }

        $this->updateFullPath();
    }
}