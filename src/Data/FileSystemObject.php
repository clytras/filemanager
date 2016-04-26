<?php namespace Crip\FileManager\Data;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Services\Perms;
use Illuminate\Contracts\Support\Arrayable;

/**
 * Class FileSystemObject
 * @package Crip\FileManager\Data
 */
class FileSystemObject implements ICripObject, Arrayable
{

    /**
     * Default permission set for filesystem object
     *
     * @var array
     */
    public $perms = [
        'auth_can_read' => true,
        'auth_can_write' => true,
        'auth_can_delete' => true,
        'any_can_read' => true,
        'any_can_write' => false,
        'any_can_delete' => false,
    ];

    public function updatePerms($path)
    {
        $this->perms = Perms::getFilePerms($path);
    }

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