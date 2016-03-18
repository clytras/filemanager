<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;
use Crip\FileManager\FileManager;

/**
 * Class UrlManager
 * @package Crip\FileManager\Services
 */
class UrlManager implements ICripObject, IManagerPath
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
     * @var PathManager
     */
    private $path_manager;

    /**
     * Initialise new instance of UrlManager
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
     * @param File $file
     * @param string $size_key
     * @return string
     */
    public function getFileUrl(File $file, $size_key = null)
    {
        $pos = '';
        if ($size_key) {
            $pos = '?thumb=' . $size_key;
        }

        $file_path = FileSystem::join([$file->getPathManager()->getPath(), $file->full_name]);
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

    /**
     * Set path manager
     *
     * @param PathManager $manager
     * @return $this
     */
    public function setPathManager(PathManager $manager)
    {
        $this->path_manager = $manager;

        return $this;
    }

    /**
     * Get current path manager
     *
     * @return PathManager
     */
    public function getPathManager()
    {
        return $this->path_manager;
    }
}