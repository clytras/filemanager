<?php namespace Crip\FileManager\Contracts;

use Crip\Core\Exceptions\BaseCripException;
use Crip\FileManager\Services\Path;

/**
 * Interface IUsePathService
 * @package Crip\FileManager\Contracts
 */
interface IUsePathService
{
    /**
     * Set up current path
     *
     * @param Path $service
     * @return $this
     */
    public function setPath(Path $service);

    /**
     * Get current path
     *
     * @return Path
     * @throws BaseCripException
     */
    public function getPath();
}