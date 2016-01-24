<?php

/**
 * Package custom router
 */
use Crip\Filemanager\App\Package;

Route::group(
    [
        // Prefix comes from configuration (default: "filemanager")
        'prefix' => LaravelLocalization::setLocale() . '/' . Package::config('base_url'),
        'namespace' => 'Crip\Filemanager\App\Controllers'
    ],
    function (\Illuminate\Routing\Router $router) {
        $router->get('/', 'DirectoryController@index');

        $router->post('dir/create/{path?}', 'DirectoryController@create')->where('path', Package::URL_REGEXP);
        $router->post('dir/rename/{path?}', 'DirectoryController@rename')->where('path', Package::URL_REGEXP);
        $router->post('dir/delete/{path?}', 'DirectoryController@delete')->where('path', Package::URL_REGEXP);

        $router->get('dir/{path?}', 'DirectoryController@dir')->where('path', Package::URL_REGEXP);

        $router->post('file/upload/{path?}', 'FileController@upload')->where('path', Package::URL_REGEXP);
        $router->post('file/rename/{path?}', 'FileController@rename')->where('path', Package::URL_REGEXP);
        $router->post('file/delete/{path?}', 'FileController@delete')->where('path', Package::URL_REGEXP);

        $router->get('file/{path?}', 'FileController@get')->where('path', Package::URL_REGEXP);
    });