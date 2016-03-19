<?php namespace Crip\FileManager\Traits;

use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Services\Path;

/**
 * Class UsePath
 * @package Crip\FileManager\Traits
 */
trait UsePath
{

    /**
     * @var \Crip\FileManager\Services\Path
     */
    protected $pathService;

    /**
     * Set up current path
     *
     * @param Path $service
     * @return $this
     */
    public function setPath(Path $service)
    {
        $this->pathService = $service;
        if (method_exists($this, 'onPathUpdate')) {
            $this->onPathUpdate($service);
        }

        return $this;
    }

    /**
     * Get current path
     *
     * @return Path
     * @throws FileManagerException
     */
    public function getPath()
    {
        if (!$this->pathService) {
            throw new FileManagerException($this, 'Before use path, it should be set up through `setPath` method');
        }

        return $this->pathService;
    }

}