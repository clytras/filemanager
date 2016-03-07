<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\IArrayObject;
use Crip\Core\Contracts\ICripObject;
use Crip\Core\Contracts\IFileSystemObject;
use Crip\FileManager\Services\FolderService;
use Crip\FileManager\Services\IconService;
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
     * @var IconService
     */
    private $icon;
    /**
     * @var Mime
     */
    private $mime;

    /**
     * @param FolderService $service
     * @param UrlManager $url
     * @param IconService $icon
     * @param Mime $mime
     */
    public function __construct(FolderService $service, UrlManager $url, IconService $icon, Mime $mime)
    {
        $this->service = $service;
        $this->url = $url;
        $this->icon = $icon;
        $this->mime = $mime;
    }

    /**
     * Convert object to array
     *
     * @return array
     */
    public function toArray()
    {
        $path = $this->service->getSysPath($this->path_manager);
        $mime = $this->mime->setByPath($path);
        $name = $this->name === null ? '..' : $this->name;

        return [
            'dir' => $this->url->pathToUrl($this->dir),
            'mime' => 'dir',
            'type' => 'dir',
            'name' => '',
            'ext' => '',
            'size' => $this->service->getSize($this->path_manager),
            'full_name' => $name,
            'date' => $this->service->getDate($this->path_manager),
            'url' => $this->url->getFolderUrl($this),
            'thumb' => $this->icon->get($mime),
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