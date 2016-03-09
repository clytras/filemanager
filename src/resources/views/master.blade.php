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

    <link href="{!! config('cripfilemanager.public_href') !!}/css/file-manager.css" rel="stylesheet">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>

<div ng-cloak class="container-fluid" ng-controller="RootController">
    <div class="row folder-actions" ng-controller="ActionsController">
        <div class="col-xs-12">
            <ul class="list">
                <li>
                    <a href ng-click="actions.newDir('{!! trans("cripfilemanager::app.actions_new_dir") !!}')"
                       class="action-vertical"
                       title="{!! trans('cripfilemanager::app.actions_new_dir') !!}">
                        <img class="action-large"
                             src="{!! icon('add-folder') !!}"
                             alt="{!! trans('cripfilemanager::app.actions_new_dir') !!}">
                        <span class="action-text">{!! trans('cripfilemanager::app.actions_new_dir') !!}</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="col-xs-4 col-md-3 col-lg-2">
                Here will be sidebar
            </div>
            <div class="col-xs-8 col-md-9 col-lg-10">
                <div class="row">
                    <div class="col-xs-12">
                        <ol class="breadcrumb" ng-controller="BreadcrumbController">
                            <li></li>
                            <li ng-if="breadcrumb.length < 1"></li>
                            <li ng-repeat="breadcrumbItem in breadcrumb" ng-class="{'active': breadcrumbItem.isActive}">
                                <span ng-if="breadcrumbItem.isActive"
                                      ng-bind="breadcrumbItem.name"></span>

                                <a href ng-if="!breadcrumbItem.isActive"
                                   ng-click="folder.goTo(breadcrumbItem)"
                                   ng-bind="breadcrumbItem.name"></a>
                            </li>
                        </ol>
                    </div>
                </div>
                <div class="row" ng-controller="DirContentController">
                    <div class="col-xs-12">
                        <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 text-center"
                             ng-repeat="item in folder.items|filter:folderFilter|orderBy:order.by:order.isReverse">

                            <div id="{{item.identifier}}"
                                 ng-controller="DirItemController"
                                 class="manager-item-wrapper">

                                <div ng-click="click(item)" class="img-wrapper">
                                    <img src ng-src="{{item.thumb}}" alt="{{item.full_name}}"
                                         class="img-responsive manager-img">
                                </div>

                                <div class="item-footer">
                                    <div class="text" ng-bind="item.full_name"></div>

                                    <ul class="item-actions">
                                        <li ng-if="item.isDir">
                                            <a href title="{!! trans('cripfilemanager::app.item_title_open_dir') !!}"
                                               ng-click="click(item)">
                                                <img src="{!! icon('open-folder') !!}"
                                                     alt="{!! trans('cripfilemanager::app.item_title_open_dir') !!}">
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="{!! config('cripfilemanager.public_href') !!}/js/vendor.js"></script>
<script src="{!! config('cripfilemanager.public_href') !!}/js/file-manager.js"></script>
</body>
</html>