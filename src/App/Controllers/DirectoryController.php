<?php namespace Crip\Filemanager\App\Controllers;

use Illuminate\Foundation\Application;
use Input;
use Crip\Filemanager\App\Filemanager;
use Crip\Filemanager\App\Package;
use Crip\Filemanager\App\Services\ValidateConfig;

/**
 * Class DirectoryController
 * @package Crip\Filemanager\App\Controllers
 */
class DirectoryController extends BaseFileManagerController
{
    /**
     * @var Filemanager
     */
    private $manager;

    /**
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        $this->manager = $app[Package::NAME];
    }

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
            return $this->manager->changePath($path)
                ->create(Input::get('name'));
        });
    }

    /**
     * @param string $path
     * @return bool
     */
    public function rename($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->manager->changePath($path)
                ->rename(Input::get('old'), Input::get('new'));
        });
    }

    /**
     * @param null $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->manager->changePath($path)
                ->delete(Input::get('name'));
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