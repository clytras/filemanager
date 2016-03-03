<?php

return [
    'base_url' => 'filemanager',
    'target_dir' => 'storage/uploads',
    'thumbs_dir' => 'thumbs',
    'thumbs' => [
        'thumb' => [
            205,
            205,
            'resize',
        ],
        'xs' => [
            24,
            24,
            'resize',
        ],
        'sm' => [
            200,
            200,
            'resize',
        ],
        'md' => [
            512,
            1000,
            'width',
        ],
        'lg' => [
            1024,
            2000,
            'width',
        ],
    ],
    'icons' => [
        'path' => '/vendor/crip/filemanager/',
        'files' => [
            'js' => 'js.png',
            'dir' => 'dir.png',
            'css' => 'css.png',
            'txt' => 'txt.png',
            'any' => 'file.png',
            'img' => 'image.png',
            'zip' => 'archive.png',
            'pwp' => 'powerpoint.png',
            'html' => 'html.png',
            'word' => 'word.png',
            'audio' => 'audio.png',
            'video' => 'video.png',
            'excel' => 'excel.png',
        ]
    ],
    'mime' => [
        'types' => [
            'js' => [
                "/^text\/x\-jquery\-tmpl/",
            ]
        ]
    ],
    'actions' => [
        'dir' => '\\Crip\\FileManager\\App\\Controllers\\DirectoryController@dir',
        'file' => '\\Crip\\FileManager\\App\\Controllers\\FileController@file'
    ]
];