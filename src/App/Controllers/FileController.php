<?php namespace Crip\FileManager\App\Controllers;

use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;
use Input;

/**
 * Class FileController
 * @package Crip\Filemanager\App\Controllers
 */
class FileController extends BaseFileManagerController
{

    /**
     * @var FileManager
     */
    private $fileManager;

    /**
     * @param FileManager $manager
     */
    public function __construct(FileManager $manager)
    {
        $this->fileManager = $manager;
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
            return $this->fileManager
                ->in($path)
                ->upload(Input::file('file'));
        });
    }

    /**
     * @param $path
     * @return \Response
     *
     * @throws \Crip\FileManager\Exceptions\FileManagerException
     */
    public function file($path)
    {
        list($dir, $name) = FileSystem::splitNameFromPath($path);
        $thumb = Input::get('thumb', null);

        $file = $this->fileManager
            ->in($dir)
            ->get($name, $thumb);

        return \Response::make($file->file)
            ->header('Content-Type', $file->mime->type);
    }

    /**
     * @param string $path
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function rename($path = '')
    {
        return $this->tryReturn(function () use ($path) {

            return $this->fileManager
                ->in($path)
                ->renameFile(Input::get('old'), Input::get('new'))
                ->toArray();
        });
    }

    /**
     * @param $path
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($path)
    {
        return $this->tryReturn(function () use ($path) {
            list($dir, $name) = FileSystem::splitNameFromPath($path);

            return $this->fileManager
                ->in($dir)
                ->deleteFile($name);
        });
    }
}