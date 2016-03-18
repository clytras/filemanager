<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Contracts\IManagerPath;

/**
 * Class FolderService
 * @package Crip\FileManager\Services
 */
class FolderService implements ICripObject, IManagerPath
{
    /**
     * @var string
     */
    private $name;

    /**
     * @var PathManager
     */
    private $path_manager;

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return FolderService
     */
    public function setName($name)
    {
        if ($name !== '..') {
            $this->name = Str::slug($name);
        } else {
            $this->name = null;
        }

        return $this;
    }

    /**
     * @return string
     */
    public function path()
    {
        return FileSystem::join($this->getPathManager()->getPath(), $this->name);
    }

    /**
     * @return string
     */
    public function sysPath()
    {
        return FileSystem::join($this->getPathManager()->sysPath(), $this->name);
    }

    /**
     * @return string
     */
    public function getDate()
    {
        $stat = stat($this->sysPath());

        return date('Y-m-d H:i:s', $stat['mtime']);
    }

    /**
     * Calculate folder size in bytes
     *
     * @return int
     */
    public function getSize()
    {
        return FileSystem::dirSize($this->sysPath(), [$this->getPathManager()->getThumbDir()]);
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