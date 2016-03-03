<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;
use Crip\FileManager\FileManager;

/**
 * Class UrlManager
 * @package Crip\FileManager\Services
 */
class UrlManager implements ICripObject
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
     * @var PackageBase
     */
    protected $pck;

    public function __construct()
    {
        $this->pck = FileManager::package();

        $this->dir_action = $this->pck->config('actions.dir',
            '\\Crip\\FileManager\\App\\Controllers\\DirectoryController@dir');
        $this->file_action = $this->pck->config('actions.file',
            '\\Crip\\FileManager\\App\\Controllers\\FileController@file');
    }

    /**
     * @param PathManager $path
     * @param File $file
     * @param string $size_key
     * @return string
     */
    public function getFileUrl(PathManager $path, File $file, $size_key = null)
    {
        $pos = '';
        if ($size_key) {
            $pos = '?thumb=' . $size_key;
        }

        $dir = $path->getPath();
        $file_path = $file->full_name;
        if ($dir) {
            $file_path = FileSystem::join([$path->getPath(), $file->full_name]);
        }

        $url = action($this->file_action, $this->pathToUrl($file_path));

        return $url . $pos;
    }

    /**
     * @param Folder $folder
     *
     * @return string
     */
    public function getFolderUrl(Folder $folder)
    {
        $dir = $folder->getPath();
        $url = action($this->dir_action, $this->pathToUrl($dir));

        return $url;
    }

    /**
     * @param string $path
     *
     * @return string
     */
    public function pathToUrl($path)
    {
        return trim(join('/', FileSystem::split($path)), '/');
    }
}