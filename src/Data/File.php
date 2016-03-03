<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Services\Mime;
use File as LaravelFile;

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
     * @param string $path Path to the file
     */
    public function __construct($path)
    {
        $this->file = LaravelFile::get($path);
        $this->mime = new Mime($path);
    }

}