<?php namespace Crip\FileManager\App\Controllers;

use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;
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
     * @var PathManager
     */
    private $pathManager;

    /**
     * @var FileManager
     */
    private $fileManager;

    /**
     * @param PathManager $path
     * @param FileManager $manager
     */
    public function __construct(PathManager $path, FileManager $manager)
    {
        $this->pathManager = $path;
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
            return $this->fileManager->upload(
                Input::file('file'),
                $this->pathManager->goToPath($path)
            );
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
        $file_path = $this->pathManager->goToPath($dir);
        $thumb = Input::get('thumb', null);

        $file = $this->fileManager->get($file_path, $name, $thumb);

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
            $dir = $this->pathManager->goToPath($path);

            return $this->fileManager->renameFile(
                $dir,
                Input::get('old'),
                Input::get('new')
            )->toArray();
        });
    }

    public function delete($path)
    {
        return $this->tryReturn(function () use ($path) {
            list($folder, $name) = FileSystem::splitNameFromPath($path);
            $dir = $this->pathManager->goToPath($folder);

            return $this->fileManager->deleteFile($dir, $name);
        });
    }
}