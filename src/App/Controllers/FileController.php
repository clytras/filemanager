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
    private $path;
    /**
     * @var FileManager
     */
    private $manager;
    /**
     * @var FileUploader
     */
    private $uploader;

    /**
     * @param PathManager $path
     * @param FileManager $manager
     * @param FileUploader $uploader
     */
    public function __construct(PathManager $path, FileManager $manager, FileUploader $uploader)
    {
        $this->path = $path;
        $this->manager = $manager;
        $this->uploader = $uploader;
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
            return $this->uploader->upload(
                Input::file('file'),
                $this->path->goToPath($path)
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
        list($path, $name) = FileSystem::splitNameFromPath($path);

        // TODO: wrap into try
        $file = $this->manager->get(
            $this->path->goToPath($path),
            $name,
            Input::get('thumb', null)
        );

        return \Response::make($file->file)
            ->header('Content-Type', $file->mime->__toString());
    }
}