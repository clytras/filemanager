<?php
/**
 * Created by PhpStorm.
 * User: IGO-PC
 * Date: 10/13/2015
 * Time: 8:07 PM
 */

namespace Tahq69\ScriptFileManager\Script\Controllers;

use Illuminate\Routing\Controller;
use Response;
use Tahq69\ScriptFileManager\Script\Exceptions\FileManagerException;
use Tahq69\ScriptFileManager\Script\Package;

/**
 * Class BaseFileManagerController
 * @package Tahq69\ScriptFileManager\Script\Controllers
 */
class BaseFileManagerController extends Controller
{
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
        } catch (FileManagerException $exc) {
            return $this->error($exc->getMessage(), false);
        }
    }
}