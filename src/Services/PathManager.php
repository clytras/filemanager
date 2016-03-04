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
    private $sys_dir;
    /**
     * @var string
     */
    private $sys_path;
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
        $this->setSysPath();
    }

    /**
     * Change
     * @param string $path
     *
     * @return PathManager
     */
    public function goToPath($path)
    {
        $this->updateSysPath($path);

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
        if (!FileSystem::exists($this->sys_path)) {
            throw new FileManagerException($this, 'err_path_not_exist', ['path' => $this->path]);
        }
        if (FileSystem::type($this->sys_path) !== 'dir') {
            throw new FileManagerException($this, 'err_path_not_dir', ['path' => $this->path]);
        }

        return $this;
    }

    /**
     * @param File $file
     * @return string
     */
    public function sysPath(File $file = null)
    {
        if ($file) {
            return FileSystem::join([$this->sys_path, $file->full_name]);
        }

        return $this->sys_path;
    }

    /**
     * @param $size_key
     * @param File $file
     * @return string
     */
    public function getThumbSysPath($size_key, File $file = null)
    {
        $path = [
            $this->sys_path,
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
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @return string
     */
    public function getThumbDir()
    {
        return $this->thumb_dir;
    }

    /**
     * Update full path &| set path
     *
     * @param string $path
     *
     * @throws FileManagerException
     */
    private function updateSysPath($path = null)
    {
        if ($path !== null) {
            $this->setPath($path);
        }

        $this->sys_path = FileSystem::canonical(FileSystem::join([$this->sys_dir, $this->path]));
    }

    /**
     * Sets base path of object
     */
    private function setSysPath()
    {
        if (!$this->sys_dir) {
            $path = FileSystem::canonical($this->pck->config('target_dir'));
            $this->sys_dir = base_path($path);
            FileSystem::mkdir($this->sys_dir, 777, true);
        }

        $this->updateSysPath();
    }

    /**
     * Determines is path of root upload path
     *
     * @param string $sys_path
     *
     * @return bool
     */
    public function isRoot($sys_path)
    {
        return $sys_path === $this->sys_dir;
    }
}