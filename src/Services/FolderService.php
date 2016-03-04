<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;

/**
 * Class FolderService
 * @package Crip\FileManager\Services
 */
class FolderService
{
    /**
     * @var string
     */
    private $name;

    /**
     * @var UniqueNameService
     */
    private $uniqueName;

    /**
     * @param UniqueNameService $uniqueName
     */
    public function __construct(UniqueNameService $uniqueName)
    {
        $this->uniqueName = $uniqueName;
    }

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
     * @param PathManager $path_manager
     *
     * @return string
     */
    public function getPath(PathManager $path_manager)
    {
        return FileSystem::join($path_manager->getPath(), $this->name);
    }

    /**
     * @param PathManager $path_manager
     *
     * @return string
     */
    public function getSysPath(PathManager $path_manager)
    {
        return FileSystem::join($path_manager->sysPath(), $this->name);
    }

    /**
     * @param PathManager $path_manager
     * @return string
     */
    public function getDate(PathManager $path_manager)
    {
        $full_path = $this->getSysPath($path_manager);
        $stat = stat($full_path);

        return date('Y-m-d H:i:s', $stat['mtime']);
    }

    /**
     * Calculate folder size in bytes
     *
     * @param PathManager $path_manager
     *
     * @return int
     */
    public function getSize(PathManager $path_manager)
    {
        return FileSystem::dirSize($this->getSysPath($path_manager), [$path_manager->getThumbDir()]);
    }

}