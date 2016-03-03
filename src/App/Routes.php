<?php

/**
 * Package custom router
 */
use Crip\FileManager\App\Package;
use Mcamara\LaravelLocalization\LaravelLocalization;

Route::group(
    [
        // Prefix comes from configuration (default: "filemanager")
        'prefix' => app(LaravelLocalization::class)->setLocale() . '/' . Package::config('base_url'),
        'namespace' => 'Crip\FileManager\App\Controllers'
    ],
    function (\Illuminate\Routing\Router $router) {
        $router->get('/', 'DirectoryController@index');

        $router->any('dir/create/{path?}', 'DirectoryController@create')->where('path', Package::URL_REGEXP);
        $router->any('dir/rename/{path?}', 'DirectoryController@rename')->where('path', Package::URL_REGEXP);
        $router->any('dir/delete/{path?}', 'DirectoryController@delete')->where('path', Package::URL_REGEXP);

        $router->get('dir/{path?}', 'DirectoryController@dir')->where('path', Package::URL_REGEXP);

        $router->post('file/upload/{path?}', 'FileController@upload')->where('path', Package::URL_REGEXP);
        $router->any('file/rename/{path?}', 'FileController@rename')->where('path', Package::URL_REGEXP);
        $router->any('file/delete/{path?}', 'FileController@delete')->where('path', Package::URL_REGEXP);

        $router->get('file/{path?}', 'FileController@file')->where('path', Package::URL_REGEXP);
    });