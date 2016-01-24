<?php namespace Tahq69\ScriptFileManager\Script\Controllers;

use Input;
use Response;
use Tahq69\ScriptFileManager\Script\FileManager;
use Illuminate\Foundation\Application;
use Tahq69\ScriptFileManager\Script\Package;

/**
 * Class FileController
 * @package Tahq69\ScriptFileManager\Script\Controllers
 */
class FileController extends BaseFileManagerController
{
    /**
     * @var FileManager
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
     * @param $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload($path = '')
    {
        /** TODO: validate server max size
         * $post_max = ini_get( 'post_max_size' );
         * $file_max = ini_get( 'upload_max_filesize' );
         */

        return $this->tryReturn(function () use ($path) {
            return $this->manager->changePath($path)
                ->upload(Input::file('file'));
        });
    }

    /**
     * @param $path
     * @return \Illuminate\Http\JsonResponse
     */
    public function rename($path = '')
    {
        return $this->tryReturn(function () use ($path) {
            return $this->manager->changePath($path)
                ->rename(Input::get('old'), Input::get('new'));
        });
    }

    /**
     * @param $path
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
     * @param $path
     * @param $name
     * @return \Illuminate\Http\JsonResponse
     * @throws \Tahq69\ScriptFileManager\Script\Exceptions\FileManagerException
     */
    public function get($path)
    {
        $name = basename($path);
        $path = substr($path, 0, strlen($path) - strlen($name));

        // TODO: wrap into try
        $file = $this->manager->changePath($path)
            ->file($name, Input::get('thumb', null));

        return Response::make($file->file)
            ->header('Content-Type', $file->mime);
    }
}