<!DOCTYPE html>
<html lang="{!! App::getLocale() !!}" ng-app="app">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta id="settings"
          data-sizes="{!! str_replace('"', '\'', json_encode(FileManager::config('thumbs'))) !!}"
          data-params="{!! str_replace('"', '\'', json_encode(Input::all())) !!}"
          data-base-url="{!! '/' . trim(FileManager::config('base_url'), '/\\') . '/' !!}">
    <title>{!! FileManager::trans('title') !!}</title>
    <link href="{!! FileManager::assets('css/app.css') !!}" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <script src="{!! FileManager::assets('js/core.js') !!}"></script>
</head>
<body>
<div ng-controller="BaseController" ng-cloak>
    <div class="col-md-12">
        <div class="col-xs-12 uploader-container">
            @include(FileManager::incView('partials.uploader'))
        </div>
    </div>
    <div class="">
        <div class="col-xs-4 col-md-3 col-lg-2">
            @include(FileManager::incView('partials.tree'))
        </div>
        <div class="col-xs-8 col-md-9 col-lg-10">
            @include(FileManager::incView('partials.folder'))
        </div>
    </div>
</div>

<script src="{!! FileManager::assets('js/string.js') !!}"></script>
<script src="{!! FileManager::assets('js/app.js') !!}"></script>

</body>
</html>