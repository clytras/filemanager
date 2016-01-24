<?php namespace Crip\Filemanager\App\Facades;

use Illuminate\Support\Facades\Facade;
use Crip\Filemanager\App\Package;

/**
 * Class FileManager
 * @package Crip\Filemanager\App\Facades
 */
class FileManager extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return Package::NAME;
    }
}