(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .controller('FolderController', FolderController);

    FolderController.$inject = [
        '$log', '$scope', '$cookies', 'focus', 'Dir', 'DirService', 'Settings'
    ];

    function FolderController($log, $scope, $cookies, focus, Dir, DirService, Settings) {
        $log.log('FolderController controller <- started');

        activate();

        function activate() {
            $scope.folder = {
                loading: true,
                creating: false,
                name: '',
                items: [],
                filters: {
                    image: true,
                    media: true,
                    document: true,
                    file: true
                },
                order: {
                    func: order,
                    change: changeOrder,
                    by: 'name',
                    reverse: false,
                    name: true,
                    size: false,
                    date: false
                },
                enableCreate: enableCreate,
                create: create,
                refresh: refresh,
                isFiltersEnabled: isFiltersEnabled
            };
            $scope.folderFilter = folderFilter;
        }

        function __canLoad() {
            // do nothing if folder still loading
            if ($scope.folder.loading) {
                $log.warn('FolderController -> loading', 'Previous item still loading');
                return false;
            }
            return true;
        }

        $scope.$on('_error', onErrorHandled);
        $scope.$on('_warning', onErrorHandled);
        function onErrorHandled(event) {
            $scope.folder.loading = false;
        }

        $scope.$on('change-folder', changeFolder);
        function changeFolder(event, folder) {
            if (!__canLoad())
                return;

            $log.log('FolderController -> changeFolder', {event: event, folder: folder});
            $scope.folder.loading = true;
            Dir.query({path: folder.path || '/'}, function (r) {
                $scope._success(r);
                onFolderChanged(r, folder);
            }, $scope._error);
        }

        $scope.$on('folder-changed', onFolderExternallyChanged);
        function onFolderExternallyChanged(event, items) {
            $log.log('FolderController -> onFolderExternallyChanged', {event: event, items: items});
            $scope.folder.loading = false;
            $scope.folder.items = items;
        }

        $scope.$on('file-uploaded', addNewFile);
        function addNewFile(event, file) {
            $log.log('FolderController -> addNewFile', {event: event, file: file});
            DirService.extendItem(file, $scope.folder.items.length);
            $scope.folder.items.unshift(file);
        }

        $scope.$on('folder-deleted', removeByPath);
        $scope.$on('file-deleted', removeByPath);
        function removeByPath(event, item) {
            $log.log('FolderController -> removeByPath', {event: event, item: item, items: $scope.folder.items});
            $scope.folder.items.removeItem(item.path, 'path');
            //removeFromArr($scope.folder.items, );
        }

        /**
         * Filters folder items
         *
         * @param value
         * @param index
         * @param array
         */
        function folderFilter(value, index, array) {
            if (angular.isDefined(value.type)) {
                if (value.type == 'dir')
                    return true;

                if (isFiltersEnabled())
                    return $scope.folder.filters[value.type];

                if (Settings.getType() == value.type)
                    return true;
            }

            return false;
        }

        function order(item) {
            if (item.type === 'dir') {
                if (item.name == '..')
                    return -1;
                return 0 + ' ' + item[$scope.folder.order.by];
            }

            return 'z' + item[$scope.folder.order.by];
        }

        function changeOrder(newName) {
            $scope.folder.order.by = newName;
            var options = ['name', 'size', 'date'];
            for (var i in options) {
                if (options.hasOwnProperty(i))
                    $scope.folder.order[options[i]] = false;
            }
            $scope.folder.order[newName] = true;

            return false;
        }

        function isFiltersEnabled() {
            return Settings.getType() == 'file';
        }

        function refresh() {
            if (!__canLoad())
                return;
            $log.log('FolderController -> refresh', {manager: $scope.manager});
            $scope.folder.loading = true;
            $scope.manager.path = $scope.manager.path.replace(/^\/|\/$/g, '');
            Dir.query({path: $scope.manager.path || '/'}, function (r) {
                onFolderChanged(r, $scope.manager);
            }, $scope._error);
        }

        /**
         * Callback for folder data load completion
         *
         * @param response
         * @param folder
         */
        function onFolderChanged(response, folder) {
            $log.log('FolderController -> changeFolder -> onFolderChanged',
                {response: response, folder: folder});
            DirService.extend(response);
            $scope.folder.items = response.items();
            $scope.folder.loading = false;
            $scope.manager.path = '/' + (folder.path || '');
            $cookies.put('path', (folder.path || ''));
        }

        function enableCreate() {
            $scope.folder.creating = true;
            focus('#create-dir-input');
        }

        function create() {
            if (!__canLoad())
                return;
            if ($scope.folder.name && $scope.folder.name !== '')
                DirService.create($scope.manager.path, $scope.folder.name,
                    onFolderCreated, $scope._error);
        }

        function onFolderCreated(response) {
            $log.log('FolderController -> create -> onFolderCreated', {response: response});

            $scope._success(response);
            $scope.folder.creating = false;
            $scope.folder.name = '';
            var folder = response.data;
            DirService.extendItem(folder, $scope.folder.items.length);
            $scope.folder.items.unshift(folder);
            $scope.fireBroadcast('folder-created', folder);
        }
    }
})(angular, jQuery);