<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Services\MimeService;

/**
 * Class Mime
 * @package Crip\FileManager\Data
 */
class Mime implements ICripObject
{

    /**
     * @var string
     */
    public $type;

    /**
     * @var MimeService
     */
    public $service;

    /**
     * @param MimeService $service
     */
    public function __construct(MimeService $service)
    {
        $this->service = $service;
    }

    /**
     * @param $mime
     *
     * @return Mime
     */
    public function set($mime)
    {
        $this->service->setMime($mime);
        $this->type = $this->service->getMimeType();

        return $this;
    }

    /**
     * @param $path
     *
     * @return Mime
     */
    public function setByPath($path) {
        $this->service->setMimeByPath($path);
        $this->type = $this->service->getMimeType();

        return $this;
    }

}