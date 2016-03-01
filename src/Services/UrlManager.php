<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;

/**
 * Class UrlManager
 * @package Crip\FileManager\Services
 */
class UrlManager implements ICripObject
{
    /**
     * @var string
     */
    protected static $dir_action = '\\Crip\\FileManager\\App\\Controllers\\DirectoryController@dir';

    /**
     * @var string
     */
    protected static $file_action = '\\Crip\\FileManager\\App\\Controllers\\FileController@file';

    /**
     * @param PathManager $path
     * @param CripFile $file
     * @param string $size_key
     * @return string
     */
    public static function get(PathManager $path, CripFile $file, $size_key = null)
    {
        $pos = '';
        if ($size_key) {
            $pos = '?thumb=' . $size_key;
        }

        $file_path = CripFile::join([$path->relativePath(), $file->fullName()]);
        $url = action(static::$file_action, $file_path);

        return $url . $pos;
    }
}