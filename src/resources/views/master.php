<!DOCTYPE html>
<html lang="<?php echo App::getLocale() ?>" ng-app="crip.file-manager">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta id="settings"
          data-sizes="<?php echo str_replace('"', '\'', json_encode(config('cripfilemanager.thumbs'))) ?>"
          data-params="<?php echo str_replace('"', '\'', json_encode(Input::all())) ?>"
          data-public-url="<?php echo config('cripfilemanager.public_href') ?>"
          data-base-url="/<?php echo App::getLocale() ?>/<?php echo trim(config('cripfilemanager.base_url'),
              '/\\') ?>/">
    <title><?php echo trans('cripfilemanager::app.title') ?></title>

    <link href="<?php echo config('cripfilemanager.public_href') ?>/css/file-manager.css" rel="stylesheet">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>

<div ng-cloak class="container-fluid" ng-controller="RootController" ng-click="deselect()">
    <div class="row folder-actions" ng-controller="ActionsController">
        <div class="col-xs-12">

            <!-- Manager actions section -->
            <ul class="list" ng-include="templatePath('actions')"></ul>
            <!-- // Manager actions section -->

        </div>
    </div>

    <!-- Manager breadcrumb section -->
    <div class="row breadcrumb-row" ng-include="templatePath('breadcrumb')"></div>
    <!-- -- Manager breadcrumb section -->

    <!-- Manager file upload queue section -->
    <div ng-controller="FileUploadController" ng-show="hasUploads()" ng-include="templatePath('uploads')"></div>
    <!-- // Manager file upload queue section -->

    <div class="row">
        <div class="col-xs-12">
            <div class="row">

                <!-- Manager directory tree section -->
                <div class="col-xs-4 col-md-3 col-lg-2" ng-include="templatePath('tree')"></div>
                <!-- // Manager directory tree section -->

                <!-- Manager content section -->
                <div class="col-xs-8 col-md-9 col-lg-10"
                     ng-controller="DirContentController"
                     ng-include="templatePath('content')"></div>
                <!-- // Manager content section -->

            </div>
        </div>
    </div>
</div>

<script src="<?php echo config('cripfilemanager.public_href') ?>/js/vendor.js"></script>
<script src="<?php echo config('cripfilemanager.public_href') ?>/js/file-manager.js"></script>
</body>
</html>