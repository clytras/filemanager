<?php namespace Crip\FileManager\App\Controllers;

use Crip\FileManager\FileManager;
use Crip\FileManager\Services\FileSystemManager;
use Input;
use Crip\FileManager\App\Package;
use Crip\FileManager\App\Services\ValidateConfig;

/**
 * Class DirectoryController
 * @package Crip\Filemanager\App\Controllers
 */
class DirectoryController extends BaseFileManagerController
{

    /**
     * @var FileSystemManager
     */
    private $fileSystem;

    /**
     * @param FileManager $manager
     * @param FileSystemManager $fileSystem
     */
    public function __construct(FileManager $manager, FileSystemManager $fileSystem)
    {
        parent::__construct($manager);
        $this->fileSystem = $fileSystem;
    }

    /**
     * FileManager general view
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return $this->fileManager->package()->view('master');
    }

    /**
     * @param string $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function create($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->fileManager
                ->in($path)
                ->createFolder(Input::get('name'))
                ->toArray();
        });
    }

    /**
     * @param string $path
     * @return bool
     */
    public function rename($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->fileManager
                ->in($path)
                ->renameFolder(Input::get('old'), Input::get('new'))
                ->toArray();
        });
    }

    /**
     * @param null $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->fileManager
                ->in($path)
                ->deleteFolder(Input::get('name'));
        });
    }

    /**
     * @param string $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function dir($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            $path_manager = $this->fileManager->in($path)->getPathManager();
            return $this->fileSystem->setPathManager($path_manager)->folder->get($path);
        });
    }
}