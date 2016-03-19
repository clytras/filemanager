<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\FileManager;

/**
 * Class Path
 * @package Crip\FileManager\Services
 */
class Path implements ICripObject
{

    /**
     * @var string Relative path to current location
     */
    private $relative_path = '';

    /**
     * @var string System root directory location
     */
    private $sys_root_dir = '';

    /**
     * @var string Current system directory location
     */
    private $sys_path = '';

    /**
     * @var string Thumb directory name
     */
    private $thumb_dir = '';

    /**
     * Initialise new instance of Path service
     */
    public function __construct()
    {
        $this->thumb_dir = FileManager::package()->config('thumbs_dir', 'thumbs');
        $root_dir = FileSystem::canonical(FileManager::package()->config('target_dir', 'storage/uploads'));
        $this->sys_root_dir = base_path($root_dir);
        if (!FileSystem::exists($this->sys_root_dir)) {
            FileSystem::mkdir($this->sys_root_dir, 777);
        }

        $this->updatePath();
    }

    /**
     * Update system_path &| relative_path
     *
     * @param null|string $path
     * @return $this
     */
    public function updatePath($path = null)
    {
        if (!is_null($path)) {
            $this->change($path);
        }
        $this->sys_path = FileSystem::canonical(FileSystem::join($this->sys_root_dir, $this->relative_path));

        return $this;
    }

    /**
     * Change path
     *
     * @param string $path
     * @return $this
     * @throws FileManagerException
     */
    public function change($path)
    {
        $this->relative_path = trim(FileSystem::canonical($path), '/');
        if (!FileSystem::exists($this->sys_path)) {
            throw new FileManagerException($this, 'err_path_not_exist', ['path' => $this->relative_path]);
        }
        if (FileSystem::type($this->sys_path) !== 'dir') {
            throw new FileManagerException($this, 'err_path_not_dir', ['path' => $this->relative_path]);
        }

        return $this;
    }

    /**
     * Get current relative path
     *
     * @return string
     */
    public function relativePath()
    {
        return $this->relative_path;
    }

    /**
     * Get File or folder full system path
     *
     * @param File|null $file
     * @return string
     */
    public function path(File $file = null)
    {
        if (!is_null($file)) {
            return FileSystem::join($this->sys_path, $file->fullName());
        }

        return $this->sys_path;
    }

    /**
     * Get thumb directory name
     *
     * @return string
     */
    public function thumbDirName()
    {
        return $this->thumb_dir;
    }

    /**
     * Get thumb File or folder full system path
     *
     * @param $size
     * @param File|null $file
     * @return string
     */
    public function thumbPath($size, File $file = null)
    {
        $thumb_path = [
            $this->sys_path,
            $this->thumbDirName(),
            Str::slug($size)
        ];

        if (!is_null($file)) {
            $thumb_path[] = $file->fullName();
        }

        return FileSystem::join($thumb_path);
    }

    /**
     * Determines is path of root upload path
     *
     * @param string $path
     * @return bool
     */
    public function isRoot($path) {
        return $path === $this->sys_root_dir;
    }
}