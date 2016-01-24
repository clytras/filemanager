<div class="thumbnail" id="{{item.id}}" ng-controller="FolderItemController">
    <div class="item-link text-center"
         ng-class="{'href': isDir(item), 'renaming': item.rename}"
         ng-click="click(item)">
        <img src ng-src="{{item.thumbs.thumb}}" class="img-responsive"/>
    </div>

    <div class="box"
         ng-if="!item.rename"
         ng-class="{'text-muted': folder.loading}"
         ng-click="click(item)">
        <h4 class="ellipsis">
            <span ng-bind="item.name"></span>
        </h4>
    </div>

    <div class="box-under">
        <div class="rename" ng-if="item.rename">
            <div class="input-group input-group-sm">
                <input type="text"
                       name="name"
                       ng-cloak
                       class="form-control"
                       ng-model="item.newName"
                       c-enter="rename()"
                       placeholder="{{item.name}}">
                    <span class="input-group-btn">
                        <span ng-if="item.ext" class="btn btn-default disabled" ng-bind="'.' + item.ext"></span>
                        <button class="btn btn-default img"
                                type="button"
                                ng-click="rename()"
                                title="{!! FileManager::trans('rename_save') !!}">
                            <img src="{!! FileManager::icon('save.png') !!}"
                                 alt="{!! FileManager::trans('rename_save') !!}"
                                 class="btn-img">
                        </button>
                    </span>
            </div>
        </div>

        <div class="actions" ng-if="!item.rename">
            <a class="action action-open"
               href ng-click="click(item)"
               ng-if="isDir(item)"
               title="{!! FileManager::trans('open_folder') !!}">
                <img src="{!! FileManager::icon('open-folder.png') !!}"
                     alt="{!! FileManager::trans('open_folder') !!}"
                     class="btn-img">
            </a>
            <a class="action action-edit"
               href ng-click="enableRename(item)"
               ng-if="canRename(item)"
               title="{!! FileManager::trans('rename') !!}">
                <img src="{!! FileManager::icon('edit.png') !!}"
                     alt="{!! FileManager::trans('rename') !!}"
                     class="btn-img">
            </a>
            <a class="action action-select"
               href ng-click="select(item)"
               ng-if="!isDir(item)"
               title="{!! FileManager::trans('select_file') !!}">
                <img src="{!! FileManager::icon('select.png') !!}"
                     alt="{!! FileManager::trans('select_file') !!}"
                     class="btn-img">
            </a>
            <a class="action action-delete" ng-if="!isDirUp(item)"
               href ng-click="delete(item)" title="{!! FileManager::trans('delete') !!}">
                <img src="{!! FileManager::icon('delete.png') !!}"
                     alt="{!! FileManager::trans('delete') !!}"
                     class="btn-img">
            </a>
        </div>
    </div>
</div>