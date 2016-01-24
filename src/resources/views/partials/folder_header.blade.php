<div class="panel-heading" contextmenu-container="cxmenu_bre">
    <div contextmenu-item="folder">
        <h3 class="panel-title pull-left" ng-bind="manager.path"></h3>

        <div class="pull-right">
            <div class="form-inline">
                <div class="input-group" ng-if="folder.creating">
                    <input type="text"
                           ng-cloak
                           name="name"
                           id="create-dir-input"
                           crip-enter="folder.create()"
                           class="form-control input-sm"
                           ng-model="folder.name"
                           placeholder="{!! FileManager::trans('new_folder_placeholder') !!}">
                        <span class="input-group-btn">
                            <button class="btn btn-default btn-sm img-lg"
                                    type="button"
                                    ng-click="folder.create()"
                                    title="{!! FileManager::trans('save') !!}">
                                <img src="{!! FileManager::icon('save.png') !!}"
                                     alt="{!! FileManager::trans('save') !!}"
                                     class="btn-img">
                            </button>
                        </span>
                </div>
                <div class="btn-group btn-group-sm">
                    <a href class="btn btn-default img-lg"
                       ng-click="folder.enableCreate()"
                       title="{!! FileManager::trans('new_folder') !!}">
                        <img src="{!! FileManager::icon('add-folder.png') !!}"
                             alt="{!! FileManager::trans('new_folder') !!}"
                             class="btn-img">
                    </a>
                    <label class="btn btn-default img-lg" uib-btn-checkbox
                           ng-show="folder.isFiltersEnabled()"
                           title="{!! FileManager::trans('filter_images') !!}"
                           ng-model="folder.filters.image">
                        <img src="{!! FileManager::icon('image.png') !!}"
                             alt="{!! FileManager::trans('filter_images') !!}"
                             class="btn-img">
                    </label>
                    <label class="btn btn-default img-lg" uib-btn-checkbox
                           ng-show="folder.isFiltersEnabled()"
                           ng-model="folder.filters.media"
                           title="{!! FileManager::trans('filter_media') !!}">
                        <img src="{!! FileManager::icon('media.png') !!}"
                             alt="{!! FileManager::trans('filter_media') !!}"
                             class="btn-img">
                    </label>
                    <label class="btn btn-default img-lg" uib-btn-checkbox
                           ng-show="folder.isFiltersEnabled()"
                           ng-model="folder.filters.document"
                           title="{!! FileManager::trans('filter_document') !!}">
                        <img src="{!! FileManager::icon('document.png') !!}"
                             alt="{!! FileManager::trans('filter_document') !!}"
                             class="btn-img">
                    </label>
                    <label class="btn btn-default img-lg" uib-btn-checkbox
                           ng-show="folder.isFiltersEnabled()"
                           ng-model="folder.filters.file"
                           title="{!! FileManager::trans('filter_file') !!}">
                        <img src="{!! FileManager::icon('file.png') !!}"
                             alt="{!! FileManager::trans('filter_file') !!}"
                             class="btn-img">
                    </label>
                    <label class="btn btn-default"
                           title="{!! FileManager::trans('order_by_name_title') !!}"
                           uib-btn-checkbox
                           ng-model="folder.order.name"
                           ng-click="folder.order.change('name')">
                        {!! FileManager::trans('order_by_name') !!}
                    </label>
                    <label class="btn btn-default"
                           title="{!! FileManager::trans('order_by_size_title') !!}"
                           uib-btn-checkbox
                           ng-model="folder.order.size"
                           ng-click="folder.order.change('size')">
                        {!! FileManager::trans('order_by_size') !!}
                    </label>
                    <label class="btn btn-default"
                           title="{!! FileManager::trans('order_by_date_title') !!}"
                           uib-btn-checkbox
                           ng-model="folder.order.date"
                           ng-click="folder.order.change('date')">
                        {!! FileManager::trans('order_by_date') !!}
                    </label>
                    <a href class="btn btn-default img-lg"
                       ng-click="folder.refresh()"
                       title="{!! FileManager::trans('refresh_folder') !!}">
                        <img src="{!! FileManager::icon('refresh.png') !!}"
                             alt="{!! FileManager::trans('refresh_folder') !!}"
                             class="btn-img">
                    </a>
                </div>
            </div>
        </div>

        <div class="clearfix"></div>
    </div>
</div>

<div contextmenu="cxmenu_bre" class="dropdown contextmenu">
    <ul class="dropdown-menu" role="menu">
        <li>
            <a role="menuitem" href tabindex="-1"
               ng-click="folder.enableCreate()">
                <span>{!! FileManager::trans('context_new_folder') !!}</span>
            </a>
        </li>
    </ul>
</div>
<!-- /.contextmenu -->