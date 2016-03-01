<?php namespace Crip\FileManager\App;

use File;

/**
 * Class FileManagerFile
 * @package Tahq69\ScriptFileManager\Script
 */
class FileManagerFile
{
    /**
     * @var string
     */
    public $file;

    /**
     * @var string
     */
    public $mime;

    /**
     * @param $path
     */
    public function __construct($path)
    {
        $this->file = File::get($path);
        $this->mime = mime_content_type($path);
    }
}