<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;

/**
 * Class Url
 * @package Crip\FileManager\Services
 */
class Url implements ICripObject
{
    /**
     * @var string
     */
    protected $dir_action;

    /**
     * @var string
     */
    protected $file_action;

    /**
     * Initialise new instance of Url service
     */
    public function __construct()
    {
        $pck = FileManager::package();

        $this->dir_action = $pck->config('actions.dir',
            '\\Crip\\FileManager\\App\\Controllers\\DirectoryController@dir');
        $this->file_action = $pck->config('actions.file',
            '\\Crip\\FileManager\\App\\Controllers\\FileController@file');
    }

    /**
     * Generate url from file name
     *
     * @param Path $path
     * @param string $name
     * @param null|string $size
     * @return string
     */
    public function forName(Path $path, $name, $size = null)
    {
        if (!is_null($size)) {
            $name .= '?thumb=' . $size;
        }
        $file_path = FileSystem::join($path->relativePath(), $name);

        return action($this->file_action, $this->pathToUrl($file_path));
    }

    /**
     * Convert path string to url string
     *
     * @param string $path
     * @return string
     */
    public function pathToUrl($path)
    {
        return trim(join('/', FileSystem::split($path)), '/');
    }

    /**
     * Get url to folder content
     *
     * @param Path $path
     * @param null|string $name
     * @return string
     */
    public function forFolder(Path $path, $name = null)
    {
        $folder_path = FileSystem::join($path->relativePath(), $name);

        return action($this->dir_action, $this->pathToUrl($folder_path));
    }
}