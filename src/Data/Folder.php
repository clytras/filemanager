<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\IArrayObject;
use Crip\Core\Contracts\ICripObject;
use Crip\Core\Contracts\IFileSystemObject;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Services\FolderService;
use Crip\FileManager\Services\IconService;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\UrlManager;

/**
 * Class Folder
 * @package Crip\FileManager\Data
 */
class Folder implements ICripObject, IArrayObject, IFileSystemObject, IManagerPath
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
        $path = $this->service->sysPath();
        $mime = $this->mime->setByPath($path);

        return [
            'dir' => $this->url->pathToUrl($this->dir),
            'mime' => 'dir',
            'type' => 'dir',
            'name' => $this->name,
            'ext' => '',
            'size' => $this->service->getSize(),
            'full_name' => $this->name === null ? '..' : $this->name,
            'date' => $this->service->getDate(),
            'url' => $this->url->getFolderUrl($this),
            'thumb' => $this->icon->get($mime),
        ];
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
     * Get system path
     *
     * @return string
     */
    public function getSysPath()
    {
        return $this->service->sysPath();
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
        $this->setPathManager($other->getPathManager());

        return $this;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->service->path();
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
        $this->dir = $manager->getPath();
        $this->service->setPathManager($manager);
        $this->url->setPathManager($manager);

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