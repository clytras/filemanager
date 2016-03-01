<?php namespace Crip\FileManager;

use Crip\Core\Support\PackageBase;

/**
 * Class FileManager
 * @package Crip\FileManager
 */
class FileManager
{
    /**
     * @var PackageBase
     */
    private static $package;

    /**
     * @return PackageBase
     */
    public static function package()
    {
        if (!self::$package) {
            self::$package = new PackageBase('cripfilemanager', __DIR__);
        }

        return self::$package;
    }
}