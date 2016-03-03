<?php namespace Crip\FileManager\App\Controllers;

use Crip\FileManager\FileManager;
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
     * FileManager general view
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        if (!ValidateConfig::isValid()) {
            return Package::view('error')->with('errors', ValidateConfig::$errors);
        }
        return Package::view('index');
    }

    /**
     * @param null $path
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
            return $this->manager->changePath($path)
                ->all();
        });
    }
}