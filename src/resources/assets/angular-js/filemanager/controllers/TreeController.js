(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .controller('TreeController', TreeController);

    TreeController.$inject = [
        '$log', '$scope', 'Dir', 'DirService'
    ];

    function TreeController($log, $scope, Dir, DirService) {
        $log.log('TreeController controller <- started');

        activate();

        function activate() {
            $scope.isOpen = isOpen;
            $scope.isEmpty = isEmpty;
            $scope.changeFolder = changeFolder;

            $scope.tree = {
                loading: true,
                items: [],
                root: {
                    name: '/', // TODO: get translation for this text
                    url: $scope.baseUrl + 'dir'
                },
                expand: expand
            };
        }

        // TODO: add tree refresh

        $scope.$on('_error', onErrorHandled);
        $scope.$on('_warning', onErrorHandled);
        function onErrorHandled(event) {
            $scope.tree.loading = false;
        }

        $scope.$on('tree-changed', treeChanged);
        function treeChanged(event, tree) {
            $log.log('TreeController -> treeChanged', {event: event, tree: tree});
            $scope.tree.items = tree;
            $scope.tree.loading = false;
        }

        $scope.$on('folder-created', onFolderCreated);
        function onFolderCreated(event, folder) {
            $log.log('TreeController -> onFolderCreated', {event: event, folder: folder});
            if (folder.path.indexOf('/') === -1) {
                // created folder is in root, so wee need add it to tree menu
                $scope.tree.items.unshift(folder);
            }
        }

        $scope.$on('folder-renamed', onFolderRenamed);
        function onFolderRenamed(event, folders) {
            var oldFolder = folders.old,
                newFolder = folders.new;
            $log.log('TreeController -> onFolderRenamed', {event: event, newFolder: newFolder, oldFolder: oldFolder});

            // TODO: recursively check all child folders
            for (var i = 0; i < $scope.tree.items.length; i++) {
                if ($scope.tree.items[i].path == oldFolder.path) {
                    // TODO: create item automapper
                    $scope.tree.items[i].path = newFolder.path;
                    $scope.tree.items[i].name = newFolder.name;
                    $scope.tree.items[i].url = newFolder.url;
                }
            }
        }

        $scope.$on('folder-deleted', removeByPath);
        function removeByPath(event, item) {
            $log.log('TreeController -> removeByPath', {event: event, item: item, items: $scope.tree.items});

            // TODO: recursively check all child folders
            removeFromArr($scope.tree.items, item.path, 'path');
        }

        /**
         * Check is folder open for tree
         *
         * @param folder
         * @returns {boolean}
         */
        function isOpen(folder) {
            return folder && angular.isDefined(folder.folders);
        }

        /**
         * Check is folder has any other folder
         *
         * @param folder
         * @returns {boolean}
         */
        function isEmpty(folder) {
            if (isOpen(folder))
                return folder.folders.length == 0;
            return false;
        }

        function expand(currFolder) {
            // do nothing if tree still loading or don`t have sub folders
            if ($scope.tree.loading || isEmpty(currFolder)) {
                $log.warn('TreeController -> expand', 'Previous item still loading');
                return;
            }

            $log.log('TreeController -> expand', {curr: currFolder});

            // remove all sub folders if it is already opened
            if (isOpen(currFolder)) {
                currFolder.folders = undefined;
                return;
            }

            $scope.tree.loading = true;
            Dir.query({path: currFolder.path}, function (response) {
                DirService.extend(response);
                $scope.tree.loading = false;
                currFolder.folders = response.dirs();
            }, $scope._error);
        }

        function changeFolder(folder) {
            $scope.fireBroadcast('change-folder', folder);
        }
    }
})(angular, jQuery);