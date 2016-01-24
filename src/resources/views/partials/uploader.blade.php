<div ng-controller="UploadController">
    <div class="row">
        <input type="file" class="form-control" nv-file-select uploader="uploader" multiple/>
    </div>
    <div class="list-container" ng-if="uploader.queue.length > 0">
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th width="50%">{!! FileManager::trans('uploader_th_name') !!}</th>
                    <th ng-show="uploader.isHTML5">{!! FileManager::trans('uploader_th_size') !!}</th>
                    <th ng-show="uploader.isHTML5">{!! FileManager::trans('uploader_th_progress') !!}</th>
                    <th>{!! FileManager::trans('uploader_th_status') !!}</th>
                    <th>{!! FileManager::trans('uploader_th_actions') !!}</th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="item in uploader.queue" class="upload-item">
                    <td>
                        <strong>{{ item.file.name }}</strong>

                        <div ng-show="uploader.isHTML5" crip-thumb="{'file': item._file, 'height': 50}"></div>
                    </td>
                    <td ng-show="uploader.isHTML5"
                        nowrap>{{item.file.size/1024/1024|number:2}} {!! FileManager::trans('size_mb') !!}</td>
                    <td ng-show="uploader.isHTML5">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar"
                                 ng-style="{'width': item.progress + '%'}"></div>
                        </div>
                    </td>
                    <td class="text-center">
                        <span ng-show="item.isSuccess"><i class="glyphicon glyphicon-ok"></i></span>
                        <span ng-show="item.isCancel"><i class="glyphicon glyphicon-ban-circle"></i></span>
                        <span ng-show="item.isError"><i class="glyphicon glyphicon-remove"></i></span>
                    </td>
                    <td nowrap>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-default img" ng-click="item.upload()"
                                    ng-disabled="item.isReady || item.isUploading || item.isSuccess"
                                    title="{!! FileManager::trans('uploader_upload') !!}">
                                <img src="{!! FileManager::icon('upload.png') !!}"
                                     alt="{!! FileManager::trans('uploader_upload') !!}"
                                     class="btn-img">
                            </button>
                            <button type="button" class="btn btn-default img" ng-click="item.cancel()"
                                    ng-disabled="!item.isUploading"
                                    title="{!! FileManager::trans('uploader_cancel') !!}">
                                <img src="{!! FileManager::icon('cancel.png') !!}"
                                     alt="{!! FileManager::trans('uploader_cancel') !!}"
                                     class="btn-img">
                            </button>
                            <button type="button" class="btn btn-default img" ng-click="item.remove()"
                                    title="{!! FileManager::trans('uploader_remove') !!}">
                                <img src="{!! FileManager::icon('delete.png') !!}"
                                     alt="{!! FileManager::trans('uploader_remove') !!}"
                                     class="btn-img">
                            </button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="upload-actions">
            <div>
                <div class="progress">
                    <div class="progress-bar"
                         role="progressbar"
                         ng-style="{ 'width': uploader.progress + '%' }"></div>
                </div>
            </div>
            <button type="button"
                    class="btn btn-default img"
                    ng-click="uploader.uploadAll()"
                    ng-disabled="!uploader.getNotUploadedItems().length"
                    title="{!! FileManager::trans('uploader_upload_all') !!}">
                <img class="btn-img"
                     src="{!! FileManager::icon('upload.png') !!}"
                     alt="{!! FileManager::trans('uploader_upload_all') !!}">
            </button>
            <button type="button"
                    class="btn btn-default img"
                    ng-click="uploader.cancelAll()"
                    ng-disabled="!uploader.isUploading"
                    title="{!! FileManager::trans('uploader_cancel_all') !!}">
                <img class="btn-img"
                     src="{!! FileManager::icon('cancel.png') !!}"
                     alt="{!! FileManager::trans('uploader_cancel_all') !!}">
            </button>
            <button type="button"
                    class="btn btn-default img"
                    ng-click="uploader.clearQueue()"
                    ng-disabled="!uploader.queue.length"
                    title="{!! FileManager::trans('uploader_remove_all') !!}">
                <img class="btn-img"
                     src="{!! FileManager::icon('delete.png') !!}"
                     alt="{!! FileManager::trans('uploader_remove_all') !!}">
            </button>
        </div>
    </div>
</div>