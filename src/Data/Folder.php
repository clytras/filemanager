<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Illuminate\Contracts\Support\Arrayable;

/**
 * Class Folder
 * @package Crip\FileManager\Data
 */
class Folder extends FileSystemObject implements ICripObject, Arrayable
{
    public $name = '';
    public $dir = '';
    public $type = 'dir';
    public $bytes = '';
    public $full_name = '';
    public $updated_at = '';
    public $url = '';
    public $thumb = '';
}