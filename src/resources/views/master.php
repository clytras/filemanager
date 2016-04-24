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
            <ul class="list">
                <li>
                    <a href
                       class="action-vertical"
                       crip-trans-title="actions_new_dir"
                       ng-class="{'disabled': !canCreateFolder()}"
                       ng-click="createFolder('<?php echo trans("cripfilemanager::app.actions_new_dir") ?>')">
                        <img class="action-large"
                             crip-trans-alt="actions_new_dir"
                             ng-src="{{icon('add-folder')}}">
                        <span class="action-text" crip-trans="actions_new_dir"></span>
                    </a>
                    <a href
                       class="action-vertical"
                       crip-trans-title="actions_upload"
                       ng-class="{'disabled': !canUpload()}"
                       ngf-multiple="true"
                       ngf-select="addFiles($files, $invalidFiles)">
                        <img class="action-large"
                             crip-trans-alt="actions_upload"
                             ng-src="{{icon('upload')}}">
                        <span class="action-text" crip-trans="actions_upload"></span>
                    </a>

                    <div class="actions-horizontal">
                        <a href
                           class="action-horizontal"
                           title="<?php echo trans('cripfilemanager::app.actions_upload_all') ?>"
                           ng-class="{'disabled': !hasUploads()}"
                           ng-click="upload()">
                            <img class="action-small"
                                 ng-src="{{icon('upload')}}"
                                 crip-trans-alt="actions_upload_all">
                            <span class="action-text" crip-trans="actions_upload_all_text"></span>
                        </a>
                        <a href
                           class="action-horizontal"
                           crip-trans-title="actions_cancel_upload_all"
                           ng-class="{'disabled': !hasUploads()}"
                           ng-click="cancelUpload()">
                            <img class="action-small"
                                 ng-src="{{icon('cancel')}}"
                                 crip-trans-alt="actions_cancel_upload_all">
                            <span class="action-text" crip-trans="actions_cancel_upload_all_text"></span>
                        </a>
                    </div>
                </li>
                <li>
                    <a href
                       class="action-vertical"
                       crip-trans-title="actions_delete"
                       ng-class="{'disabled': !canDeleteSelected()}"
                       ng-click="deleteSelected($event)">
                        <img class="action-large"
                             ng-src="{{icon('cancel')}}"
                             crip-trans-alt="actions_delete">
                        <span class="action-text" crip-trans="actions_delete"></span>
                    </a>
                    <a href
                       class="action-vertical"
                       crip-trans-title="actions_rename"
                       ng-class="{'disabled': !canRenameSelected()}"
                       ng-click="enableRenameSelected($event)">
                        <img class="action-large"
                             ng-src="{{icon('rename')}}"
                             crip-trans-alt="actions_rename">
                        <span class="action-text" crip-trans="actions_rename"></span>
                    </a>
                </li>
                <li>
                    <a href
                       id="action-properties"
                       class="action-vertical"
                       crip-trans-title="actions_properties"
                       ng-class="{'disabled': !hasProperties()}"
                       ng-click="openProperties($event)">
                        <img class="action-large"
                             ng-src="{{icon('view-details')}}"
                             crip-trans-alt="actions_properties">
                        <span class="action-text" crip-trans="actions_properties"></span>
                    </a>

                    <div class="actions-horizontal">
                        <a href
                           class="action-horizontal"
                           crip-trans-title="actions_open"
                           ng-class="{'disabled': !canOpenSelected()}"
                           ng-click="openSelected()">
                            <img class="action-small"
                                 ng-src="{{icon('open-folder')}}"
                                 crip-trans-alt="actions_open">
                            <span class="action-text" crip-trans="actions_open"></span>
                        </a>
                    </div>
                </li>
                <li>
                    <div class="actions-horizontal alone">
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': order.isBy('full_name')}"
                           crip-trans-title="actions_sort_by_name"
                           ng-click="order.set('full_name')">
                            <span class="action-text" crip-trans="actions_sort_by_name_text"></span>
                        </a>
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': order.isBy('bytes')}"
                           crip-trans-title="actions_sort_by_size"
                           ng-click="order.set('bytes')">
                            <span class="action-text" crip-trans="actions_sort_by_size_text"></span>
                        </a>
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': order.isBy('updated_at')}"
                           crip-trans-title="actions_sort_by_date"
                           ng-click="order.set('updated_at')">
                            <span class="action-text" crip-trans="actions_sort_by_date_text"></span>
                        </a>
                    </div>
                </li>
                <li ng-if="allMediaAllowed()">
                    <div class="actions-horizontal alone">
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': filters.image}"
                           crip-trans-title="actions_images_enabled"
                           ng-click="filters.toggle('image')">
                            <span class="action-text" crip-trans="actions_images_enabled_text"></span>
                        </a>
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': filters.media}"
                           crip-trans-title="actions_media_enabled"
                           ng-click="filters.toggle('media')">
                            <span class="action-text" crip-trans="actions_media_enabled_text"></span>
                        </a>
                        <a href
                           class="action-horizontal"
                           ng-class="{'active': filters.document}"
                           crip-trans-title="actions_document_enabled"
                           ng-click="filters.toggle('document')">
                            <span class="action-text" crip-trans="actions_document_enabled_text"></span>
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="row breadcrumb-row">
        <ol class="breadcrumb" ng-controller="BreadcrumbController">
            <li>
                <a href
                   crip-trans-title="breadcrumb_go_to_root"
                   crip-trans="breadcrumb_root"
                   ng-click="goToRoot()"></a>
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
        <span class="refresh-btn">
            <a href
               crip-trans-title="breadcrumb_refresh"
               ng-click="refreshContent()">
                <img ng-src="{{icon('refresh')}}"
                     crip-trans-alt="breadcrumb_refresh_img">
            </a>
        </span>
    </div>

    <div ng-controller="FileUploadController" ng-show="hasUploads()">
        <div ng-repeat="file in files()"
             class="col-xs-6 col-sm-4 col-md-3 col-lg-2 text-center manager-item-wrapper"
             crip-progressbar="file.progress">
            <div class="img-wrapper">
                <div ng-show="file.isHtml5"
                     class="img-responsive manager-img"
                     crip-thumb="{file: file, height: 100}"></div>
            </div>
            <div class="item-footer" ng-class="{'error': file.error}">
                <div class="text" ng-bind="file.name"></div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="row">
                <div class="col-xs-4 col-md-3 col-lg-2">
                    Here will be sidebar
                </div>
                <div class="col-xs-8 col-md-9 col-lg-10" ng-controller="DirContentController">
                    <div class="row crip-content-wrapper">
                        <a href
                           id="{{item.identifier}}"
                           title="{{item.full_name}}"
                           tabindex="{{$index * 2 + 50}}"
                           class="col-xs-12 col-sm-6 col-md-3 col-lg-2 text-center manager-item-wrapper"
                           ng-click="click($event, item)"
                           ng-dblclick="dblclick($event, item)"
                           ng-controller="ItemController"
                           ng-class="{'active': isSelected(item)}"
                           ng-repeat="item in getContent()|filter:filter.dir|orderBy:order.by:order.isReverse"
                           crip-contextmenu="openMenu(item, $event)">
                            <div class="img-wrapper">
                                <img src
                                     ng-src="{{item.thumb}}"
                                     alt="{{item.full_name}}"
                                     class="img-responsive manager-img">
                            </div>
                            <div class="item-footer">
                                <div class="text"
                                     tabindex="-1"
                                     ng-if="!item.rename"
                                     ng-bind="item.full_name"
                                     ng-dblclick="enableRename($event)"></div>
                                <div class="rename" ng-if="item.rename">
                                    <input type="text"
                                           name="name"
                                           tabindex="-1"
                                           onfocus="this.select();"
                                           crip-enter="item.saveNewName()"
                                           ng-click="$event.stopPropagation()"
                                           ng-model="item.name">
                                </div>
                                <md-menu ng-init="item.menu = this" use-backdrop="false">
                                    <md-button class="md-icon-button"
                                               aria-label="---"
                                               ng-click="openMenu(item, $event)"
                                               tabindex="{{$index * 2 + 50}}">
                                        <img class="crip-menu-icon"
                                             ng-src="{{icon('menu')}}"
                                             crip-trans-alt="item_actions_title_img">
                                    </md-button>
                                    <md-menu-content width="4">
                                        <md-menu-item ng-if="canOpen(item)">
                                            <md-button ng-click="openDir(item)" aria-label="-">
                                                <img class="crip-menu-item-icon"
                                                     ng-src="{{icon('open-folder')}}"
                                                     crip-trans-alt="item_actions_open_img">
                                                <span crip-trans="item_actions_open"></span>
                                            </md-button>
                                        </md-menu-item>
                                        <md-menu-item ng-if="canRename(item)">
                                            <md-button ng-click="enableRename(item)" aria-label="-">
                                                <img class="crip-menu-item-icon"
                                                     ng-src="{{icon('rename')}}"
                                                     crip-trans-alt="item_actions_rename_img">
                                                <span crip-trans="item_actions_rename"></span>
                                            </md-button>
                                        </md-menu-item>
                                        <md-menu-item ng-if="hasProperties(item)">
                                            <md-button ng-click="openProperties(item)" aria-label="-">
                                                <img class="crip-menu-item-icon"
                                                     ng-src="{{icon('view-details')}}"
                                                     crip-trans-alt="item_actions_properties_img">
                                                <span crip-trans="item_actions_properties"></span>
                                            </md-button>
                                        </md-menu-item>
                                        <md-menu-item ng-if="canDelete(item)">
                                            <md-button ng-click="deleteItem(item)" aria-label="-">
                                                <img class="crip-menu-item-icon"
                                                     ng-src="{{icon('cancel')}}"
                                                     crip-trans-alt="item_actions_delete_img">
                                                <span crip-trans="item_actions_delete"></span>
                                            </md-button>
                                        </md-menu-item>
                                    </md-menu-content>
                                </md-menu>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="<?php echo config('cripfilemanager.public_href') ?>/js/vendor.js"></script>
<script src="<?php echo config('cripfilemanager.public_href') ?>/js/file-manager.js"></script>
</body>
</html>