<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Illuminate\Contracts\Support\Arrayable;

/**
 * Class File
 * @package Crip\FileManager\Data
 */
class File implements ICripObject, Arrayable
{
    public $name = '';
    public $extension = '';
    public $mime = '';
    public $type = '';
    public $mimetype = '';
    public $bytes = '';
    public $updated_at = '';
    public $thumb = '';
    public $dir = '';
    public $full_name = '';
    public $url = '';
    public $size = [];
    public $thumbs = [];

    /**
     * Get the instance as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return (array)$this;
    }
}