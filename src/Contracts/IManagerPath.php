<?php namespace Crip\FileManager\Contracts;

use Crip\FileManager\Services\PathManager;

/**
 * Interface IManagerPath
 * @package Crip\FileManager\Contracts
 */
interface IManagerPath
{
    /**
     * Set path manager
     *
     * @param PathManager $manager
     * @return $this
     */
    public function setPathManager(PathManager $manager);

    /**
     * Get current path manager
     *
     * @return PathManager
     */
    public function getPathManager();
}