<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\IArrayObject;
use Crip\Core\Contracts\ICripObject;
use Crip\Core\Contracts\IFileSystemObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Services\FileService;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\ThumbManager;
use Crip\FileManager\Services\UrlManager;
use File as LaravelFile;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class File
 * @package Crip\FileManager\Data
 */
class File implements ICripObject, IArrayObject, IFileSystemObject, IManagerPath
{
    /**
     * @var LaravelFile
     */
    public $file;

    /**
     * @var Mime
     */
    public $mime;

    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $ext;

    /**
     * @var string
     */
    public $full_name;

    /**
     * @var string
     */
    public $size;

    /**
     * @var string
     */
    public $path;

    /**
     * @var FileService
     */
    public $service;

    /**
     * @var UrlManager
     */
    private $url;

    /**
     * @var PathManager
     */
    private $path_manager;

    /**
     * @var ThumbManager
     */
    private $thumb;

    /**
     * @param Mime $mime
     * @param FileService $service
     * @param UrlManager $url
     * @param ThumbManager $thumb
     */
    public function __construct(Mime $mime, FileService $service, UrlManager $url, ThumbManager $thumb)
    {
        $this->mime = $mime;
        $this->service = $service;
        $this->url = $url;
        $this->thumb = $thumb;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'dir' => $this->url->pathToUrl($this->path),
            'mime' => $this->mime->type,
            'type' => $this->mime->service->getMediaType(),
            'name' => $this->name,
            'ext' => $this->ext,
            'size' => $this->size,
            'full_name' => $this->full_name,
            'date' => $this->service->getDate(),
            'url' => $this->url->getFileUrl($this),
            'thumb' => $this->service->getThumb(),
            'thumbs' => $this->getThumbs()
        ];
    }

    /**
     * @param string $path Path to the file
     * @return File
     */
    public function set($path)
    {
        $this->file = LaravelFile::get($path);
        list($dir, $name) = FileSystem::splitNameFromPath($path);
        $this->setFromString($name, $dir);

        return $this;
    }

    /**
     * @param $name
     *
     * @return File
     */
    public function setName($name)
    {
        $this->service->setName($name);
        $this->serviceFileNameUpdated();

        return $this;
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
     * @param UploadedFile $file
     *
     * @return File
     */
    public function setFromUpload(UploadedFile $file)
    {
        $this->service->setFromUpload($file);
        $this->serviceFileUpdated();

        return $this;
    }

    /**
     * @param string $file_name
     * @param string $path_to_file_dir
     *
     * @return File
     */
    public function setFromString($file_name, $path_to_file_dir = null)
    {
        $this->service->setFromName($file_name, $path_to_file_dir);
        $this->serviceFileUpdated();

        return $this;
    }

    /**
     * Set path for file
     *
     * @param PathManager $path
     *
     * @return File
     */
    public function setPath(PathManager $path)
    {
        $this->path = $this->service
            ->setPathManager($path)
            ->relativePath();

        $this->path_manager = $path;

        return $this;
    }

    /**
     * @return string File path in system
     *
     * @throws FileManagerException
     */
    public function getSysPath()
    {
        if ($this->path_manager) {
            return $this->path_manager->sysPath($this);
        }

        throw new FileManagerException($this, 'err_file_path_is_not_set');
    }

    /**
     * @param $old_file
     *
     * @return File
     */
    public function clonePath(File $old_file)
    {
        $this->setPath($old_file->getPathManager());

        return $this;
    }

    /**
     * Update all properties with service values
     */
    private function serviceFileUpdated()
    {
        $this->serviceFileNameUpdated();
        $this->ext = $this->service->getExtension();
        $this->mime = $this->service->getMime();
        $this->size = $this->service->getSize();
        $this->path = $this->service->relativePath();
    }

    /**
     * Update name properties
     */
    private function serviceFileNameUpdated()
    {
        $this->name = $this->service->getName();
        $this->full_name = $this->service->getFullName();
    }

    /**
     * Get image thumbs if they are presented
     *
     * @return array
     * @throws FileManagerException
     */
    private function getThumbs()
    {
        if ($this->mime->service->isImage()) {
            return $this->thumb->get($this);
        }

        return [];
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
        $this->service->setPathManager($manager);
        $this->url->setPathManager($manager);
        $this->thumb->setPathManager($manager);

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