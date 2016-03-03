<?php namespace Crip\FileManager\App\Controllers;

use Crip\FileManager\FileManager;
use Illuminate\Routing\Controller;
use Response;
use Crip\FileManager\App\Exceptions\FilemanagerException;
use Crip\FileManager\App\Package;

/**
 * Class BaseFileManagerController
 * @package Crip\Filemanager\App\Controllers
 */
class BaseFileManagerController extends Controller
{
    /**
     * @var FileManager
     */
    protected $fileManager;

    /**
     * @param FileManager $manager
     */
    public function __construct(FileManager $manager)
    {
        $this->fileManager = $manager;
    }

    /**
     * @param $key
     * @param bool|true $as_key
     * @return \Illuminate\Http\JsonResponse
     */
    protected function error($key, $as_key = true)
    {
        $notification = $as_key ? Package::trans($key) : $key;

        return Response::json(['notification' => $notification], 422);
    }

    /**
     * Try return action result or json format FileManagerException content
     * @param callable $action
     * @return \Illuminate\Http\JsonResponse
     */
    protected function tryReturn(callable $action)
    {
        try {
            return Response::json($action());
        } catch (FilemanagerException $exc) {
            return $this->error($exc->getMessage(), false);
        }
    }
}