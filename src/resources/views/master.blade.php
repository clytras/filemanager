<!DOCTYPE html>
<html lang="{!! App::getLocale() !!}" ng-app="crip.file-manager">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta id="settings"
          data-sizes="{!! str_replace('"', '\'', json_encode(config('cripfilemanager.thumbs'))) !!}"
          data-params="{!! str_replace('"', '\'', json_encode(Input::all())) !!}"
          data-base-url="/{!! trim(config('cripfilemanager.base_url'), '/\\') !!}/">
    <title>{!! trans('cripfilemanager::app.title') !!}</title>

    <link href="{!! config('cripfilemanager.public_href') !!}/css/file-manager.css">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>

<div ng-controller="RootController" ng-cloak class="row">
    <div class="col-xs-12">
        Hello world from filemanager
    </div>
</div>

<script src="{!! config('cripfilemanager.public_href') !!}/js/vendor.js"></script>
<script src="{!! config('cripfilemanager.public_href') !!}/js/file-manager.js"></script>
</body>
</html>