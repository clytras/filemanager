<?php
/**
 * Created by PhpStorm.
 * User: IGO-PC
 * Date: 9/29/2015
 * Time: 8:00 AM
 */

namespace Tahq69\ScriptFileManager\Script\Facades;

use Illuminate\Support\Facades\Facade;
use Tahq69\ScriptFileManager\Script\Package;

/**
 * Class FileManager
 * @package Tahq69\ScriptFileManager\Script\Facades
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