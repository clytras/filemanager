<!DOCTYPE html>
<html lang="{!! App::getLocale() !!}" ng-app="crip.file-manager">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta id="settings"
          data-sizes="{!! str_replace('"', '\'', json_encode(config('cripfilemanager.thumbs'))) !!}"
          data-params="{!! str_replace('"', '\'', json_encode(Input::all())) !!}"
          data-base-url="/{!! App::getLocale() !!}/{!! trim(config('cripfilemanager.base_url'), '/\\') !!}/">
    <title>{!! trans('cripfilemanager::app.title') !!}</title>

    <link href="{!! config('cripfilemanager.public_href') !!}/css/file-manager.css" rel="stylesheet">
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
            <ul class="list">
                <li>
                    <a href
                       class="action-vertical"
                       title="{!! trans('cripfilemanager::app.actions_new_dir') !!}"
                       ng-class="{'disabled': !canCreateFolder()}"
                       ng-click="createFolder('{!! trans("cripfilemanager::app.actions_new_dir") !!}')">
                        <img class="action-large"
                             src="{!! icon('add-folder') !!}"
                             alt="{!! trans('cripfilemanager::app.actions_new_dir') !!}">
                        <span class="action-text">{!! trans('cripfilemanager::app.actions_new_dir') !!}</span>
                    </a>
                </li>
                <li>
                    <a href
                       class="action-vertical"
                       title="{!! trans('cripfilemanager::app.actions_delete') !!}"
                       ng-class="{'disabled': !canDeleteSelected()}"
                       ng-click="deleteSelected($event)">
                        <img class="action-large"
                             src="{!! icon('cancel') !!}"
                             alt="{!! trans('cripfilemanager::app.actions_delete') !!}">
                        <span class="action-text">{!! trans('cripfilemanager::app.actions_delete') !!}</span>
                    </a>
                    <a href
                       class="action-vertical"
                       title="{!! trans('cripfilemanager::app.actions_rename') !!}"
                       ng-class="{'disabled': !canRenameSelected()}"
                       ng-click="enableRenameSelected($event)">
                        <img class="action-large"
                             src="{!! icon('rename') !!}"
                             alt="{!! trans('cripfilemanager::app.actions_rename') !!}">
                        <span class="action-text">{!! trans('cripfilemanager::app.actions_rename') !!}</span>
                    </a>
                </li>
                <li>
                    <a href
                       class="action-vertical"
                       title="{!! trans('cripfilemanager::app.actions_properties') !!}"
                       ng-class="{'disabled': !hasProperties()}"
                       ng-click="openProperties($event)">
                        <img class="action-large"
                             src="{!! icon('view-details') !!}"
                             alt="{!! trans('cripfilemanager::app.actions_properties') !!}">
                        <span class="action-text">{!! trans('cripfilemanager::app.actions_properties') !!}</span>
                    </a>
                    <div class="actions-horizontal">
                        <a href
                           class="action-horizontal"
                           title="{!! trans('cripfilemanager::app.actions_open') !!}"
                           ng-class="{'disabled': !canOpenSelected()}"
                           ng-click="openSelected()">
                            <img class="action-small"
                                 src="{!! icon('open-folder') !!}"
                                 alt="{!! trans('cripfilemanager::app.actions_open') !!}">
                            <span class="action-text">{!! trans('cripfilemanager::app.actions_open') !!}</span>
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="row">
        <ol class="breadcrumb" ng-controller="BreadcrumbController">
            <li>
                <a href
                   title="{!! trans('cripfilemanager::app.breadcrumb_go_to_root') !!}"
                   ng-click="goToRoot()">{!! trans('cripfilemanager::app.breadcrumb_root') !!}</a>
            </li>
            <li ng-if="!breadcrumbHasItems()"></li>
            <li ng-repeat="bdItem in getBreadcrumbItems()" ng-class="{'active': bdItem.isActive}">
                <span ng-if="bdItem.isActive"
                      ng-bind="bdItem.name"></span>

                <a href ng-if="!bdItem.isActive"
                   ng-click="goTo(bdItem)"
                   ng-bind="bdItem.name"></a>
            </li>
        </ol>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="col-xs-4 col-md-3 col-lg-2">
                Here will be sidebar
            </div>
            <div class="col-xs-8 col-md-9 col-lg-10" ng-controller="DirContentController">

                <div id="{{item.identifier}}"
                     title="{{item.full_name}}"
                     class="col-xs-6 col-sm-4 col-md-3 col-lg-2 text-center manager-item-wrapper"
                     ng-click="click($event, item)"
                     ng-dblclick="dblclick($event, item)"
                     ng-controller="ItemController"
                     ng-class="{'active': isSelected(item)}"
                     ng-repeat="item in getContent()|filter:folderFilter|orderBy:order.by:order.isReverse">
                    <div class="img-wrapper">
                        <img src
                             ng-src="{{item.thumb}}"
                             alt="{{item.full_name}}"
                             class="img-responsive manager-img">
                    </div>
                    <div class="item-footer">
                        <div class="text"
                             ng-if="!item.rename"
                             ng-bind="item.full_name"
                             ng-dblclick="enableRename($event)"></div>
                        <div class="rename" ng-if="item.rename">
                            <input type="text"
                                   name="name"
                                   onfocus="this.select();"
                                   crip-enter="item.saveNewName()"
                                   ng-click="$event.stopPropagation()"
                                   ng-model="item.name">
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<script src="{!! config('cripfilemanager.public_href') !!}/js/vendor.js"></script>
<script src="{!! config('cripfilemanager.public_href') !!}/js/file-manager.js"></script>
<script type="text/ng-template" id="item-properties-modal.html">
    <div class="modal-header">
        <button type="button" class="close" ng-click="close()">&times;</button>
        <h3 class="modal-title">
            <img src ng-src="{{thumb}}" class="thumb">
            <span>{{name}}</span>
        </h3>
    </div>
    <div class="modal-body">
        <ul>
            <li ng-repeat="prop in item">
                <span ng-bind="prop.name"></span>: <span ng-bind-html="prop.value"></span>
            </li>
        </ul>
    </div>
</script>
</body>
</html>