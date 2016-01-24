<div contextmenu="cxmenu" class="dropdown contextmenu">
    <ul class="dropdown-menu" role="menu" ng-controller="FolderItemController">
        <li class="dropdown-header" ng-cloak>
            {{cxmenu.item.name}}
        </li>
        <li class="divider"></li>

        <!-- Folder actions -->
        <li ng-if="canRename(cxmenu.item)">
            <a tabindex="-1" href ng-if="!cxmenu.item.rename"
               ng-click="enableRename(cxmenu.item)">
                <span>{!! FileManager::trans('context_rename') !!}</span>
            </a>
            <a tabindex="-1" href ng-if="cxmenu.item.rename"
               ng-click="disableRename(cxmenu.item)">
                <span>{!! FileManager::trans('context_disable_rename') !!}</span>
            </a>
        </li>
        <li ng-if="isDir(cxmenu.item)">
            <a href tabindex="-1"
               ng-click="click(cxmenu.item)">
                <span>{!! FileManager::trans('context_open_folder') !!}</span>
            </a>
        </li>

        <!-- File actions -->
        <li>
            <a href tabindex="-1" ng-if="!isDirUp(cxmenu.item)"
               ng-click="delete(cxmenu.item)">{!! FileManager::trans('context_delete') !!}</a>
        </li>

        <li ng-if="!isDir(cxmenu.item)">
            <a href tabindex="-1"
               ng-click="select(cxmenu.item)">
                {!! FileManager::trans('context_select') !!}
                <span ng-if="cxmenu.item.image"
                      ng-bind="thumbName(false, cxmenu.item.image.width, cxmenu.item.image.height)"></span>
            </a>
        </li>

        <li ng-show="hasThumbs(cxmenu.item)" class="dropdown-submenu">
            <a tabindex="-1" href>{!! FileManager::trans('context_image_sizes') !!}</a>
            <ul class="dropdown-menu">
                <li ng-repeat="(key, url) in cxmenu.item.thumbs">
                    <a href
                       ng-bind="'{!! FileManager::trans('context_select_size_prefix') !!}' + thumbName(key)"
                       ng-click="select(cxmenu.item, key)"></a>
                </li>
            </ul>
        </li>

        <li class="divider"></li>
        <li class="dropdown-header" ng-bind="cxmenu.item.date"></li>
        <li class="dropdown-header" ng-cloak>
            {{cxmenu.item.size/1024/1024|number:2}} {!! FileManager::trans('size_mb') !!}
        </li>
        <li class="dropdown-header" ng-if="cxmenu.item.image" ng-cloak>
            {{cxmenu.item.image.width}} x {{cxmenu.item.image.height}}
        </li>
    </ul>
</div>
<!-- /.contextmenu -->