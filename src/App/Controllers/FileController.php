<?php namespace Crip\FileManager\App\Controllers;

use Crip\FileManager\App\FileManager;
use Crip\Filemanager\App\Package;
use Crip\FileManager\Services\FileUploader;
use Crip\FileManager\Services\PathManager;
use Input;

/**
 * Class FileController
 * @package Crip\Filemanager\App\Controllers
 */
class FileController extends BaseFileManagerController
{

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
            return app(FileUploader::class)
                ->upload(
                    Input::file('file'),
                    (new PathManager)->goToPath($path)
                );
        });
    }

    public function file($path) {
        $name = basename($path);
        $path = substr($path, 0, strlen($path) - strlen($name));
        // TODO: wrap into try
        $manager = app(Package::NAME);
        $file = $manager->changePath($path)
            ->file($name, Input::get('thumb', null));
        return \Response::make($file->file)
            ->header('Content-Type', $file->mime);
    }
}