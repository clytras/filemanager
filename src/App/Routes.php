<?php

/**
 * Package custom router
 */
use Mcamara\LaravelLocalization\LaravelLocalization;

Route::group(
    [
        // Prefix comes from configuration (default: "filemanager")
        'prefix' => app(LaravelLocalization::class)->setLocale() . '/' . config('cripfilemanager.base_url'),
        'namespace' => 'Crip\FileManager\App\Controllers'
    ],
    function (\Illuminate\Routing\Router $router) {

        $url_regex = '[a-zA-Z0-9.\-\/\(\)\_ ]+';

        $router->get('/', 'DirectoryController@index');

        $router->any('dir/create/{path?}', 'DirectoryController@create')->where('path', $url_regex);
        $router->any('dir/rename/{path?}', 'DirectoryController@rename')->where('path', $url_regex);
        $router->any('dir/delete/{path?}', 'DirectoryController@delete')->where('path', $url_regex);

        $router->get('dir/{path?}', 'DirectoryController@dir')->where('path', $url_regex);

        $router->post('file/upload/{path?}', 'FileController@upload')->where('path', $url_regex);
        $router->any('file/rename/{path?}', 'FileController@rename')->where('path', $url_regex);
        $router->any('file/delete/{path?}', 'FileController@delete')->where('path', $url_regex);

        $router->get('file/{path?}', 'FileController@file')->where('path', $url_regex);
    });