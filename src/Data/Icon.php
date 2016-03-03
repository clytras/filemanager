<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Services\IconService;

/**
 * Class Icon
 * @package Crip\FileManager\Data
 */
class Icon implements ICripObject
{

    /**
     * @var IconService
     */
    public $service;

    /**
     * @param IconService $service
     */
    public function __construct(IconService $service)
    {
        $this->service = $service;
    }

    /**
     * @param Mime $mime
     *
     * @return string
     */
    public function get(Mime $mime)
    {
        return $this->service->get($mime);
    }

}