<?php namespace Crip\Filemanager\App\Contracts;

use Crip\Filemanager\App\Exceptions\FilemanagerException;

/**
 * Interface IMime
 * @package Crip\Filemanager\App\Contracts
 */
interface IMime
{
    /**
     * Sets default icon path for icons
     *
     * @param $path
     */
    public function setIconPath($path);

    /**
     * Determines is passed string image mime type
     *
     * @param string $mime
     * @return boolean
     * @throws FilemanagerException
     */
    function isImage($mime);

    /**
     * Depending on $mime returns icon path
     *
     * @param string $mime
     * @return string
     */
    function getIcon($mime = null);

    /**
     * Determines file type from $mime
     *
     * @param $mime
     * @return string
     */
    function filetype($mime);

    function get($path);
}