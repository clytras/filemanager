<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\IArrayObject;
use Crip\Core\Contracts\ICripObject;
use Crip\Core\Contracts\IFileSystemObject;
use Crip\FileManager\Services\FolderService;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\UrlManager;

/**
 * Class Folder
 * @package Crip\FileManager\Data
 */
class Folder implements ICripObject, IArrayObject, IFileSystemObject
{
    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $dir;

    /**
     * @var string
     */
    public $path;

    /**
     * @var FolderService
     */
    private $service;

    /**
     * @var PathManager
     */
    private $path_manager;

    /**
     * @var UrlManager
     */
    private $url;

    /**
     * @param FolderService $service
     * @param UrlManager $url
     */
    public function __construct(FolderService $service, UrlManager $url)
    {
        $this->service = $service;
        $this->url = $url;
    }

    /**
     * Convert object to array
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'dir' => $this->url->pathToUrl($this->dir),
            'name' => $this->name,
            'url' => $this->url->getFolderUrl($this)
        ];
    }

    /**
     * @param PathManager $path
     *
     * @return Folder
     */
    public function setPath(PathManager $path)
    {
        $this->path_manager = $path;
        $this->dir = $path->getPath();

        return $this;
    }

    /**
     * @param $name
     *
     * @return Folder
     */
    public function setName($name)
    {
        $this->service->setName($name);
        $this->name = $this->service->getName();

        return $this;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->service->getPath($this->path_manager);
    }

    /**
     * Get system path
     *
     * @return string
     */
    public function getSysPath()
    {
        return $this->service->getSysPath($this->path_manager);
    }

    /**
     * Get system object name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param Folder $other
     *
     * @return Folder
     */
    public function setPathFrom(Folder $other)
    {
        $this->setPath($other->getPathManager());

        return $this;
    }

    /**
     * @return PathManager
     */
    private function getPathManager()
    {
        return $this->path_manager;
    }
}