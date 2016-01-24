<?php
/**
 * Created by PhpStorm.
 * User: IGO-PC
 * Date: 10/17/2015
 * Time: 12:37 PM
 */

namespace Tahq69\ScriptFileManager\Script\Contracts;

use Tahq69\ScriptFileManager\Script\Exceptions\FileManagerException;

/**
 * Interface IMime
 * @package Tahq69\ScriptFileManager\Script\Contracts
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
     * @throws FileManagerException
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