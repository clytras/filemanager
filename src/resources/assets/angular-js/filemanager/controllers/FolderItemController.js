(function (angular, $, top, w, O) {
    'use strict';

    angular
        .module('file.manager')
        .controller('FolderItemController', FolderItemController);

    FolderItemController.$inject = [
        '$log', '$scope', 'focus', 'DirService', 'FileService', 'Settings'
    ];

    function FolderItemController($log, $scope, focus, DirService, FileService, Settings) {
        $log.log('FolderItemController controller <- started');

        activate();

        function activate() {
            $scope.click = click;
            $scope.canRename = canRename;
            $scope.enableRename = enableRename;
            $scope.disableRename = disableRename;
            $scope.rename = rename;
            $scope.select = select;
            $scope.hasThumbs = hasThumbs;
            $scope.thumbName = thumbName;
            $scope['delete'] = deleteItem;
        }

        /**
         * Determines item type and does action for that
         */
        function click(item) {
            if ($scope.folder.loading) {
                // TODO: add warning about loading
                $log.warn('FolderItemController -> click', 'Previous item still loading');
                return;
            }

            $log.log('FolderItemController -> click', {item: item});

            if ($scope.isDir(item)) {
                $scope.fireBroadcast('change-folder', item);
                return;
            }

            select(item);
        }

        function canRename(item) {
            return !$scope.isDirUp(item);
        }

        /**
         * On rename item
         */
        function enableRename(item) {
            item.rename = true;
            if ($scope.isDir(item)) {
                item.newName = item.name;
            } else {
                item.ext = item.name.split('.').pop();
                var cut = 0;
                if (item.ext.length)
                    cut = item.ext.length + 1;

                item.newName = item.name.substring(0, item.name.length - cut);
            }
            focus('#' + item.id + ' input');
        }

        function rename() {
            if ($scope.isDir($scope.item)) {
                if ($scope.item.name != '..')
                    DirService.rename($scope.manager.path,
                        $scope.item.name, $scope.item.newName, onFolderRenamed, $scope._error);
                return;
            }

            FileService.rename($scope.manager.path,
                $scope.item.name, getItemNewName($scope.item), onFileRenamed, $scope._error);
        }

        function getItemNewName(item) {
            if (angular.isDefined(item.ext) && item.ext.length)
                return item.newName + '.' + item.ext;
            return item.newName;
        }

        function disableRename(item) {
            item.rename = false;
        }

        function onFolderRenamed(response) {
            $log.log('FolderItemController -> onFolderRenamed', {response: response, item: $scope.item});
            $scope._success(response);
            var copy = angular.copy($scope.item);
            $scope.item.rename = false;
            // TODO: create item automapper
            $scope.item.path = response.data.path;
            $scope.item.name = response.data.name;
            $scope.item.url = response.data.url;

            $scope.fireBroadcast('folder-renamed', {'new': response.data, old: copy});
        }

        function onFileRenamed(response) {
            $log.log('FolderItemController -> onFileRenamed', {response: response});
            $scope._success(response);
            $scope.item.rename = false;
            $scope.item.name = response.data.name;
            $scope.item.url = response.data.url;
            $scope.item.thumbs = response.data.thumbs;
        }

        function select(item, thumbIndex) {
            var file_url = item.url;
            if (!!thumbIndex) {
                file_url = item.thumbs[thumbIndex];
            }

            // if select for tinyMCE
            if (Settings.isTarget('tinyMCE')) {
                $log.info('FolderItemController -> select -> tinymce', {tinymce: top.tinymce});
                if (top.tinymce.majorVersion < 4) {
                    top.tinymce.activeEditor.windowManager.params.setUrl(file_url);
                    var editor_id = top.tinymce.activeEditor.windowManager.params.mce_window_id;
                    top.tinymce.activeEditor.windowManager.close(editor_id);
                }
                else {
                    $log.info('FolderItemController -> select -> tinymce4',
                        {params: top.tinymce.activeEditor.windowManager.getParams()});
                    top.tinymce.activeEditor.windowManager.getParams().setUrl(file_url);
                    top.tinymce.activeEditor.windowManager.close();
                }
            }

            if (Settings.isTarget('callback')) {
                var filemanager = w.filemanager || w.parent.filemanager || {};

                if(filemanager && filemanager.onSelected) {
                    filemanager.onSelected(file_url, Settings.getParams());
                }
            }
        }

        function deleteItem(item) {
            if ($scope.isDir(item)) {
                if (item.name != '..')
                    DirService.delete($scope.manager.path, item.name, onFolderDeleted, $scope._error);
                return;
            }
            FileService.delete($scope.manager.path, item.name, onFileDeleted, $scope._error);
        }

        function onFolderDeleted(response) {
            $log.log('FolderItemController -> onFolderDeleted', {response: response});
            $scope._success(response);
            $scope.fireBroadcast('folder-deleted', response.data);
        }

        function onFileDeleted(response) {
            $log.log('FolderItemController -> onFileDeleted', {response: response});
            $scope._success(response);
            $scope.fireBroadcast('file-deleted', response.data);
        }

        function hasThumbs(item) {
            return !!item && angular.isDefined(item.thumbs) && O.keys(item.thumbs).length > 1;
        }

        function thumbName(thumbIndex, width, height) {
            if (thumbIndex) {
                var size = Settings.getThumbSize(thumbIndex);
                width = size[0];
                height = size[1];
            }
            var template = '({width} x {height})',
                params = {width: width, height: height};

            return template.supplant(params);
        }
    }
})(angular, jQuery, top, window, Object);