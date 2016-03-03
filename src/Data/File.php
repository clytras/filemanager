<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Services\FileService;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\UrlManager;
use File as LaravelFile;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class File
 * @package Crip\FileManager\Data
 */
class File implements ICripObject
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
     * @param Mime $mime
     * @param FileService $service
     * @param UrlManager $url
     */
    public function __construct(Mime $mime, FileService $service, UrlManager $url)
    {
        $this->mime = $mime;
        $this->service = $service;
        $this->url = $url;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'mime' => $this->mime->type,
            'name' => $this->name,
            'ext' => $this->ext,
            'full_name' => $this->full_name,
            'size' => $this->size,
            'path' => $this->path,
            'url' => $this->url->getFileUrl($this->path_manager, $this),
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
     * @param string $type
     *
     * @return File
     */
    public function setFromString($file_name, $path_to_file_dir = null, $type = null)
    {
        $this->service->setFromName($file_name, $path_to_file_dir, $type);
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
            ->setPath($path)
            ->relativePath();

        $this->path_manager = $path;

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

}