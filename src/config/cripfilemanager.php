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
];