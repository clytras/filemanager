<div class="panel panel-default folder-content" ng-controller="FolderController">
    @include(FileManager::incView('partials.folder_header'))

    <div class="panel-body dir-container" contextmenu-container="cxmenu">
        <div ng-if="!folder.items.length">
            <div class="alert alert-danger" role="alert">
                <span class="glyphicon glyphicon-exclamation-sign"></span>
                 {!! FileManager::trans('warn_empty_folder') !!}
            </div>
        </div>
        <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 dir-item"
             ng-repeat="item in folder.items | filter:folderFilter | orderBy:folder.order.func:folder.order.reverse"
             contextmenu-item="item">
            @include(FileManager::incView('partials.folder_item'))
        </div>
        @include(FileManager::incView('partials.folder_item_context'))
    </div>
</div>