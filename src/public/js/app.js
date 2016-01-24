(function(ng){
    'use strict';

    ng.module('file.manager', [
        'crip.core',
        'angular-loading-bar',
        'angularFileUpload',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui-notification',
        'io.dennis.contextmenu'
    ]);

})(angular);
// hello from js
(function () {
    'use strict';

    angular.module('app', [
        'file.manager'
    ]);

})();
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .run(Run);
    Run.$inject = [
        '$rootScope'
    ];

    function Run($rootScope) {
        var $settings = $('#settings');

        $rootScope.fireBroadcast = function (eventName, args) {
            $rootScope.$broadcast(eventName, args);
        };

        $rootScope.baseUrl = function () {
            return $settings.data('base-url');
        };
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .controller('BaseController', BaseController);

    BaseController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'DirService', 'Dir'
    ];

    function BaseController($log, $scope, $cookies, Notification, DirService, Dir) {
        $log.log('BaseController controller <- started');

        activate();

        function activate() {
            $scope.isDir = isDir;
            $scope.isDirUp = isDirUp;

            // only for subcontroller usage
            $scope._error = _error;
            $scope._warning = _warning;
            $scope._success = _success;

            $scope.manager = {
                path: '/'
            };

            // TODO: add caching and load last opened dir for $scope.folder.items
            Dir.query(onInitialDirLoaded);
        }

        /**
         * Check is passed item is folder
         *
         * @param item
         * @returns {*|boolean}
         */
        function isDir(item) {
            return item && angular.isDefined(item.type) && item.type === 'dir';
        }

        /**
         * Check is passed item is dir to go up
         * @param item
         * @returns {*|boolean|boolean}
         */
        function isDirUp(item) {
            return isDir(item) && item.name == '..';
        }

        function __resolveMessage(response) {
            var notification = false;

            if (angular.isDefined(response.notification))
                notification = response.notification;

            if (angular.isDefined(response.data) && angular.isDefined(response.data.notification))
                notification = response.data.notification;

            if (notification)
                return {hasMessage: true, message: notification};

            $log.error('Cant get user friendly message from response', {response: response});
            return {hasMessage: false};
        }

        function _error(response) {
            $scope.fireBroadcast('_error');
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.error({message: handler.message});
        }

        function _warning(response) {
            $scope.fireBroadcast('_warning');
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.error({message: handler.message});
        }

        function _success(response) {
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.success({message: handler.message});
        }

        /**
         * Initial dir load for folder and tree
         *
         * @param response
         */
        function onInitialDirLoaded(response) {
            $log.log('BaseController -> onInitialDirLoaded', {response: response});

            DirService.extend(response);

            $scope.fireBroadcast('tree-changed', response.dirs());
            $scope.fireBroadcast('folder-changed', response.items());

            $log.log('FolderCache', {path: $cookies.get('path')});
            if (!($cookies.get('path') === '/' || typeof $cookies.get('path') === 'undefined')) {
                $scope.fireBroadcast('change-folder', {path: $cookies.get('path')});
            }
        }
    }
})(angular, jQuery);
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
            $scope.tree.items.removeItem(item.path, 'path');
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
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .controller('UploadController', UploadController);

    UploadController.$inject = [
        '$log', '$scope', 'FileUploader'
    ];

    function UploadController($log, $scope, FileUploader) {
        $log.log('UploadController controller <- started');

        activate();

        function activate() {
            $scope.uploader = new FileUploader({
                url: _getUploadPath
            });
        }

        function _getUploadPath() {
            return $scope.baseUrl() + 'file/upload' + $scope.manager.path;
        }

        $scope.uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            $log.info('onWhenAddingFileFailed', item, filter, options);
        };

        $scope.uploader.onAfterAddingFile = function (fileItem) {
            // fix url to upload as we can change it at any moment
            fileItem.uploader.url = fileItem.url = _getUploadPath();
            $log.info('onAfterAddingFile', fileItem);
        };

        $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
            // TODO: add error handling
            $log.info('onErrorItem', fileItem, /*response,*/ status, headers);
        };

        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (status === 200) {
                $log.info('UploadController -> uploader -> onCompleteItem',
                    {fileItem: fileItem, response: response, status: status, headers: headers});
                $scope.fireBroadcast('file-uploaded', response);
                $scope._success(response);
            }
        };

        $scope.uploader.onCompleteAll = function () {
            $log.info('UploadController -> uploader -> onCompleteAll', {uploader: $scope.uploader});

            var hasNotUploadedFiles = false;
            angular.forEach($scope.uploader.queue, function (file) {
                if (!file.isReady && !file.isUploading && !file.isSuccess) {
                    hasNotUploadedFiles = true;
                }
            });

            if (!hasNotUploadedFiles) {
                // Clear lis from items and hide it
                $scope.uploader.clearQueue();
            }
        };
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($log, $resource, $rootScope) {
        $log.log('Dir resource <- started');

        return $resource($rootScope.baseUrl() + 'dir/:path', {
            path: '@path'
        });
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('DirService', DirService);

    DirService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function DirService($log, $rootScope, $http) {
        $log.log('DirService service <- started');

        return {
            extend: extend,
            extendItem: extendItem,
            rename: rename,
            create: create,
            'delete': deleteDir,
            idGen: idGen
        };

        function extend(data) {
            if (angular.isDefined(data.DirServiceExtended) && data.DirServiceExtended)
                return;

            angular.extend(data, {
                dirs: function () {
                    var folders = [];
                    angular.forEach(data, function (value, key) {
                        if (value.type == 'dir' && value.name != '..') {
                            extendItem(value, key);
                            this.push(value);
                        }
                    }, folders);

                    return folders;
                },
                items: function () {
                    var items = [];
                    angular.forEach(data, function (value, key) {
                        extendItem(value, key);
                        this.push(value);
                    }, items);

                    return items;
                }
            });

            data.DirServiceExtended = true;
        }

        /**
         * Renames path last part nto new name
         *
         * @param path "path to rename"
         * @param oldName
         * @param newName "new name for path last element"
         * @param onSuccess "callback for successful rename"
         * @param onError "callback for error"
         */
        function rename(path, oldName, newName, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/rename/' + path;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        function create(path, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/create/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        function deleteDir(path, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/delete/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        function idGen(key) {
            return 'list-item-' + key;
        }

        function extendItem(item, key) {
            item.id = idGen(key);
        }
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('FileService', FileService);

    FileService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function FileService($log, $rootScope, $http) {
        $log.log('FileService service <- started');

        return {
            rename: rename,
            'delete': deleteFile
        };

        function rename(path, oldName, newName, onSuccess, onError) {
            $log.log('FileService -> rename', {path: path, oldName: oldName, newName: newName});

            var url = $rootScope.baseUrl() + 'file/rename/' + path;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        function deleteFile(path, name, onSuccess, onError) {
            $log.log('FileService -> delete', {path: path, name: name});

            var url = $rootScope.baseUrl() + 'file/delete/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }
    }
})(angular, jQuery);
(function (ng, $) {
    'use strict';

    ng
        .module('file.manager')
        .service('Settings', Settings);

    Settings.$inject = [];

    function Settings() {
        var $settings = $('#settings'), params = false;

        return {
            isTarget: isTarget,
            getType: getType,
            getThumbSize: getThumbSize,
            getParams: getParams
        };

        function isTarget(curr_target) {
            return getParams().target.toLowerCase() === curr_target.toLowerCase();
        }

        function getType() {
            return (getParams().type ? params.type.toLowerCase() : false) || 'file';
        }

        function getThumbSize(sizeKey) {
            var sizes = ng.fromJson($settings.data('sizes').replace(/\'/g, '"'));

            return sizes[sizeKey];
        }

        function getParams() {
            if (!params) {
                var dataParams = $settings.data('params');
                // if params is empty array, it already converted to empty array
                if (dataParams.length === 0)
                    return {};

                params = strFromJson(dataParams);
            }
            return params;
        }
    }

    function fixSerializableStr(str) {
        return str.replace(/\'/g, '"');
    }

    function strFromJson(str) {
        return ng.fromJson(fixSerializableStr(str));
    }
})(angular, jQuery);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGVtYW5hZ2VyL21vZHVsZS5qcyIsImFwcC5qcyIsImZpbGVtYW5hZ2VyL3J1bi5qcyIsImZpbGVtYW5hZ2VyL2NvbnRyb2xsZXJzL0Jhc2VDb250cm9sbGVyLmpzIiwiZmlsZW1hbmFnZXIvY29udHJvbGxlcnMvRm9sZGVyQ29udHJvbGxlci5qcyIsImZpbGVtYW5hZ2VyL2NvbnRyb2xsZXJzL0ZvbGRlckl0ZW1Db250cm9sbGVyLmpzIiwiZmlsZW1hbmFnZXIvY29udHJvbGxlcnMvVHJlZUNvbnRyb2xsZXIuanMiLCJmaWxlbWFuYWdlci9jb250cm9sbGVycy9VcGxvYWRDb250cm9sbGVyLmpzIiwiZmlsZW1hbmFnZXIvcmVzb3VyY2VzL0Rpci5qcyIsImZpbGVtYW5hZ2VyL3NlcnZpY2VzL0RpclNlcnZpY2UuanMiLCJmaWxlbWFuYWdlci9zZXJ2aWNlcy9GaWxlU2VydmljZS5qcyIsImZpbGVtYW5hZ2VyL3NlcnZpY2VzL1NldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihuZyl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgbmcubW9kdWxlKCdmaWxlLm1hbmFnZXInLCBbXG4gICAgICAgICdjcmlwLmNvcmUnLFxuICAgICAgICAnYW5ndWxhci1sb2FkaW5nLWJhcicsXG4gICAgICAgICdhbmd1bGFyRmlsZVVwbG9hZCcsXG4gICAgICAgICduZ0Nvb2tpZXMnLFxuICAgICAgICAnbmdSZXNvdXJjZScsXG4gICAgICAgICduZ1Nhbml0aXplJyxcbiAgICAgICAgJ3VpLmJvb3RzdHJhcCcsXG4gICAgICAgICd1aS1ub3RpZmljYXRpb24nLFxuICAgICAgICAnaW8uZGVubmlzLmNvbnRleHRtZW51J1xuICAgIF0pO1xuXG59KShhbmd1bGFyKTsiLCIvLyBoZWxsbyBmcm9tIGpzXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcclxuICAgICAgICAnZmlsZS5tYW5hZ2VyJ1xyXG4gICAgXSk7XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5ydW4oUnVuKTtcclxuICAgIFJ1bi4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSdW4oJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHZhciAkc2V0dGluZ3MgPSAkKCcjc2V0dGluZ3MnKTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS5maXJlQnJvYWRjYXN0ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgYXJncykge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoZXZlbnROYW1lLCBhcmdzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLmJhc2VVcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2V0dGluZ3MuZGF0YSgnYmFzZS11cmwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCYXNlQ29udHJvbGxlcicsIEJhc2VDb250cm9sbGVyKTtcclxuXHJcbiAgICBCYXNlQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICckY29va2llcycsICdOb3RpZmljYXRpb24nLCAnRGlyU2VydmljZScsICdEaXInXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJhc2VDb250cm9sbGVyKCRsb2csICRzY29wZSwgJGNvb2tpZXMsIE5vdGlmaWNhdGlvbiwgRGlyU2VydmljZSwgRGlyKSB7XHJcbiAgICAgICAgJGxvZy5sb2coJ0Jhc2VDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmlzRGlyID0gaXNEaXI7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0RpclVwID0gaXNEaXJVcDtcclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgZm9yIHN1YmNvbnRyb2xsZXIgdXNhZ2VcclxuICAgICAgICAgICAgJHNjb3BlLl9lcnJvciA9IF9lcnJvcjtcclxuICAgICAgICAgICAgJHNjb3BlLl93YXJuaW5nID0gX3dhcm5pbmc7XHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyA9IF9zdWNjZXNzO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm1hbmFnZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoOiAnLydcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBjYWNoaW5nIGFuZCBsb2FkIGxhc3Qgb3BlbmVkIGRpciBmb3IgJHNjb3BlLmZvbGRlci5pdGVtc1xyXG4gICAgICAgICAgICBEaXIucXVlcnkob25Jbml0aWFsRGlyTG9hZGVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlzIHBhc3NlZCBpdGVtIGlzIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Knxib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzRGlyKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0gJiYgYW5ndWxhci5pc0RlZmluZWQoaXRlbS50eXBlKSAmJiBpdGVtLnR5cGUgPT09ICdkaXInO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgcGFzc2VkIGl0ZW0gaXMgZGlyIHRvIGdvIHVwXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Knxib29sZWFufGJvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNEaXJVcChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpc0RpcihpdGVtKSAmJiBpdGVtLm5hbWUgPT0gJy4uJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9fcmVzb2x2ZU1lc3NhZ2UocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHJlc3BvbnNlLm5vdGlmaWNhdGlvbikpXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSByZXNwb25zZS5ub3RpZmljYXRpb247XHJcblxyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQocmVzcG9uc2UuZGF0YSkgJiYgYW5ndWxhci5pc0RlZmluZWQocmVzcG9uc2UuZGF0YS5ub3RpZmljYXRpb24pKVxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uID0gcmVzcG9uc2UuZGF0YS5ub3RpZmljYXRpb247XHJcblxyXG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtoYXNNZXNzYWdlOiB0cnVlLCBtZXNzYWdlOiBub3RpZmljYXRpb259O1xyXG5cclxuICAgICAgICAgICAgJGxvZy5lcnJvcignQ2FudCBnZXQgdXNlciBmcmllbmRseSBtZXNzYWdlIGZyb20gcmVzcG9uc2UnLCB7cmVzcG9uc2U6IHJlc3BvbnNlfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7aGFzTWVzc2FnZTogZmFsc2V9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2Vycm9yKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdfZXJyb3InKTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfX3Jlc29sdmVNZXNzYWdlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIuaGFzTWVzc2FnZSlcclxuICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvbi5lcnJvcih7bWVzc2FnZTogaGFuZGxlci5tZXNzYWdlfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfd2FybmluZyhyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnX3dhcm5pbmcnKTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfX3Jlc29sdmVNZXNzYWdlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIuaGFzTWVzc2FnZSlcclxuICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvbi5lcnJvcih7bWVzc2FnZTogaGFuZGxlci5tZXNzYWdlfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfc3VjY2VzcyhyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9fcmVzb2x2ZU1lc3NhZ2UocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5oYXNNZXNzYWdlKVxyXG4gICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3Moe21lc3NhZ2U6IGhhbmRsZXIubWVzc2FnZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5pdGlhbCBkaXIgbG9hZCBmb3IgZm9sZGVyIGFuZCB0cmVlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gcmVzcG9uc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvbkluaXRpYWxEaXJMb2FkZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0Jhc2VDb250cm9sbGVyIC0+IG9uSW5pdGlhbERpckxvYWRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuXHJcbiAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCd0cmVlLWNoYW5nZWQnLCByZXNwb25zZS5kaXJzKCkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZm9sZGVyLWNoYW5nZWQnLCByZXNwb25zZS5pdGVtcygpKTtcclxuXHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDYWNoZScsIHtwYXRoOiAkY29va2llcy5nZXQoJ3BhdGgnKX0pO1xyXG4gICAgICAgICAgICBpZiAoISgkY29va2llcy5nZXQoJ3BhdGgnKSA9PT0gJy8nIHx8IHR5cGVvZiAkY29va2llcy5nZXQoJ3BhdGgnKSA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnY2hhbmdlLWZvbGRlcicsIHtwYXRoOiAkY29va2llcy5nZXQoJ3BhdGgnKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdGb2xkZXJDb250cm9sbGVyJywgRm9sZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgRm9sZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICckY29va2llcycsICdmb2N1cycsICdEaXInLCAnRGlyU2VydmljZScsICdTZXR0aW5ncydcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRm9sZGVyQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRjb29raWVzLCBmb2N1cywgRGlyLCBEaXJTZXJ2aWNlLCBTZXR0aW5ncykge1xyXG4gICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlciA9IHtcclxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGluZzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbHRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtZWRpYTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jOiBvcmRlcixcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2U6IGNoYW5nZU9yZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ5OiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzaXplOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVuYWJsZUNyZWF0ZTogZW5hYmxlQ3JlYXRlLFxyXG4gICAgICAgICAgICAgICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICAgICAgICAgICAgICByZWZyZXNoOiByZWZyZXNoLFxyXG4gICAgICAgICAgICAgICAgaXNGaWx0ZXJzRW5hYmxlZDogaXNGaWx0ZXJzRW5hYmxlZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyRmlsdGVyID0gZm9sZGVyRmlsdGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX19jYW5Mb2FkKCkge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIGlmIGZvbGRlciBzdGlsbCBsb2FkaW5nXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZm9sZGVyLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybignRm9sZGVyQ29udHJvbGxlciAtPiBsb2FkaW5nJywgJ1ByZXZpb3VzIGl0ZW0gc3RpbGwgbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignX2Vycm9yJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgICRzY29wZS4kb24oJ193YXJuaW5nJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JIYW5kbGVkKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignY2hhbmdlLWZvbGRlcicsIGNoYW5nZUZvbGRlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gY2hhbmdlRm9sZGVyKGV2ZW50LCBmb2xkZXIpIHtcclxuICAgICAgICAgICAgaWYgKCFfX2NhbkxvYWQoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IGNoYW5nZUZvbGRlcicsIHtldmVudDogZXZlbnQsIGZvbGRlcjogZm9sZGVyfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIERpci5xdWVyeSh7cGF0aDogZm9sZGVyLnBhdGggfHwgJy8nfSwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyKTtcclxuICAgICAgICAgICAgICAgIG9uRm9sZGVyQ2hhbmdlZChyLCBmb2xkZXIpO1xyXG4gICAgICAgICAgICB9LCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2ZvbGRlci1jaGFuZ2VkJywgb25Gb2xkZXJFeHRlcm5hbGx5Q2hhbmdlZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25Gb2xkZXJFeHRlcm5hbGx5Q2hhbmdlZChldmVudCwgaXRlbXMpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gb25Gb2xkZXJFeHRlcm5hbGx5Q2hhbmdlZCcsIHtldmVudDogZXZlbnQsIGl0ZW1zOiBpdGVtc30pO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZmlsZS11cGxvYWRlZCcsIGFkZE5ld0ZpbGUpO1xyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE5ld0ZpbGUoZXZlbnQsIGZpbGUpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gYWRkTmV3RmlsZScsIHtldmVudDogZXZlbnQsIGZpbGU6IGZpbGV9KTtcclxuICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmRJdGVtKGZpbGUsICRzY29wZS5mb2xkZXIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcy51bnNoaWZ0KGZpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWRlbGV0ZWQnLCByZW1vdmVCeVBhdGgpO1xyXG4gICAgICAgICRzY29wZS4kb24oJ2ZpbGUtZGVsZXRlZCcsIHJlbW92ZUJ5UGF0aCk7XHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlQnlQYXRoKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IHJlbW92ZUJ5UGF0aCcsIHtldmVudDogZXZlbnQsIGl0ZW06IGl0ZW0sIGl0ZW1zOiAkc2NvcGUuZm9sZGVyLml0ZW1zfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIuaXRlbXMucmVtb3ZlSXRlbShpdGVtLnBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlRnJvbUFycigkc2NvcGUuZm9sZGVyLml0ZW1zLCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlsdGVycyBmb2xkZXIgaXRlbXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICAgICAqIEBwYXJhbSBhcnJheVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvbGRlckZpbHRlcih2YWx1ZSwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZS50eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnR5cGUgPT0gJ2RpcicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyc0VuYWJsZWQoKSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmZvbGRlci5maWx0ZXJzW3ZhbHVlLnR5cGVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5ncy5nZXRUeXBlKCkgPT0gdmFsdWUudHlwZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3JkZXIoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnZGlyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ubmFtZSA9PSAnLi4nKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwICsgJyAnICsgaXRlbVskc2NvcGUuZm9sZGVyLm9yZGVyLmJ5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuICd6JyArIGl0ZW1bJHNjb3BlLmZvbGRlci5vcmRlci5ieV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VPcmRlcihuZXdOYW1lKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIub3JkZXIuYnkgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IFsnbmFtZScsICdzaXplJywgJ2RhdGUnXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSlcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm9yZGVyW29wdGlvbnNbaV1dID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5vcmRlcltuZXdOYW1lXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc0ZpbHRlcnNFbmFibGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gU2V0dGluZ3MuZ2V0VHlwZSgpID09ICdmaWxlJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlZnJlc2goKSB7XHJcbiAgICAgICAgICAgIGlmICghX19jYW5Mb2FkKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IHJlZnJlc2gnLCB7bWFuYWdlcjogJHNjb3BlLm1hbmFnZXJ9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLm1hbmFnZXIucGF0aCA9ICRzY29wZS5tYW5hZ2VyLnBhdGgucmVwbGFjZSgvXlxcL3xcXC8kL2csICcnKTtcclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KHtwYXRoOiAkc2NvcGUubWFuYWdlci5wYXRoIHx8ICcvJ30sIGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgICAgICBvbkZvbGRlckNoYW5nZWQociwgJHNjb3BlLm1hbmFnZXIpO1xyXG4gICAgICAgICAgICB9LCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbGxiYWNrIGZvciBmb2xkZXIgZGF0YSBsb2FkIGNvbXBsZXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSByZXNwb25zZVxyXG4gICAgICAgICAqIEBwYXJhbSBmb2xkZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckNoYW5nZWQocmVzcG9uc2UsIGZvbGRlcikge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBjaGFuZ2VGb2xkZXIgLT4gb25Gb2xkZXJDaGFuZ2VkJyxcclxuICAgICAgICAgICAgICAgIHtyZXNwb25zZTogcmVzcG9uc2UsIGZvbGRlcjogZm9sZGVyfSk7XHJcbiAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcyA9IHJlc3BvbnNlLml0ZW1zKCk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUubWFuYWdlci5wYXRoID0gJy8nICsgKGZvbGRlci5wYXRoIHx8ICcnKTtcclxuICAgICAgICAgICAgJGNvb2tpZXMucHV0KCdwYXRoJywgKGZvbGRlci5wYXRoIHx8ICcnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlbmFibGVDcmVhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIuY3JlYXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb2N1cygnI2NyZWF0ZS1kaXItaW5wdXQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgICAgICAgICAgaWYgKCFfX2NhbkxvYWQoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5mb2xkZXIubmFtZSAmJiAkc2NvcGUuZm9sZGVyLm5hbWUgIT09ICcnKVxyXG4gICAgICAgICAgICAgICAgRGlyU2VydmljZS5jcmVhdGUoJHNjb3BlLm1hbmFnZXIucGF0aCwgJHNjb3BlLmZvbGRlci5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRm9sZGVyQ3JlYXRlZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckNyZWF0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gY3JlYXRlIC0+IG9uRm9sZGVyQ3JlYXRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIuY3JlYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5uYW1lID0gJyc7XHJcbiAgICAgICAgICAgIHZhciBmb2xkZXIgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICBEaXJTZXJ2aWNlLmV4dGVuZEl0ZW0oZm9sZGVyLCAkc2NvcGUuZm9sZGVyLml0ZW1zLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIuaXRlbXMudW5zaGlmdChmb2xkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZm9sZGVyLWNyZWF0ZWQnLCBmb2xkZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQsIHRvcCwgdywgTykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdGb2xkZXJJdGVtQ29udHJvbGxlcicsIEZvbGRlckl0ZW1Db250cm9sbGVyKTtcclxuXHJcbiAgICBGb2xkZXJJdGVtQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICdmb2N1cycsICdEaXJTZXJ2aWNlJywgJ0ZpbGVTZXJ2aWNlJywgJ1NldHRpbmdzJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGb2xkZXJJdGVtQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsIGZvY3VzLCBEaXJTZXJ2aWNlLCBGaWxlU2VydmljZSwgU2V0dGluZ3MpIHtcclxuICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgY29udHJvbGxlciA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY2xpY2sgPSBjbGljaztcclxuICAgICAgICAgICAgJHNjb3BlLmNhblJlbmFtZSA9IGNhblJlbmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmVuYWJsZVJlbmFtZSA9IGVuYWJsZVJlbmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVSZW5hbWUgPSBkaXNhYmxlUmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUucmVuYW1lID0gcmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0ID0gc2VsZWN0O1xyXG4gICAgICAgICAgICAkc2NvcGUuaGFzVGh1bWJzID0gaGFzVGh1bWJzO1xyXG4gICAgICAgICAgICAkc2NvcGUudGh1bWJOYW1lID0gdGh1bWJOYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGVbJ2RlbGV0ZSddID0gZGVsZXRlSXRlbTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXRlbSB0eXBlIGFuZCBkb2VzIGFjdGlvbiBmb3IgdGhhdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNsaWNrKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5mb2xkZXIubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIHdhcm5pbmcgYWJvdXQgbG9hZGluZ1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBjbGljaycsICdQcmV2aW91cyBpdGVtIHN0aWxsIGxvYWRpbmcnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IGNsaWNrJywge2l0ZW06IGl0ZW19KTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaXNEaXIoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdjaGFuZ2UtZm9sZGVyJywgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNlbGVjdChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhblJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhJHNjb3BlLmlzRGlyVXAoaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPbiByZW5hbWUgaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0ucmVuYW1lID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0RpcihpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5uZXdOYW1lID0gaXRlbS5uYW1lO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5leHQgPSBpdGVtLm5hbWUuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHZhciBjdXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICBjdXQgPSBpdGVtLmV4dC5sZW5ndGggKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW0ubmV3TmFtZSA9IGl0ZW0ubmFtZS5zdWJzdHJpbmcoMCwgaXRlbS5uYW1lLmxlbmd0aCAtIGN1dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXMoJyMnICsgaXRlbS5pZCArICcgaW5wdXQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmFtZSgpIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0Rpcigkc2NvcGUuaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuaXRlbS5uYW1lICE9ICcuLicpXHJcbiAgICAgICAgICAgICAgICAgICAgRGlyU2VydmljZS5yZW5hbWUoJHNjb3BlLm1hbmFnZXIucGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLml0ZW0ubmFtZSwgJHNjb3BlLml0ZW0ubmV3TmFtZSwgb25Gb2xkZXJSZW5hbWVkLCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRmlsZVNlcnZpY2UucmVuYW1lKCRzY29wZS5tYW5hZ2VyLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXRlbS5uYW1lLCBnZXRJdGVtTmV3TmFtZSgkc2NvcGUuaXRlbSksIG9uRmlsZVJlbmFtZWQsICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0SXRlbU5ld05hbWUoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaXRlbS5leHQpICYmIGl0ZW0uZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLm5ld05hbWUgKyAnLicgKyBpdGVtLmV4dDtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubmV3TmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRpc2FibGVSZW5hbWUoaXRlbSkge1xyXG4gICAgICAgICAgICBpdGVtLnJlbmFtZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25Gb2xkZXJSZW5hbWVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBvbkZvbGRlclJlbmFtZWQnLCB7cmVzcG9uc2U6IHJlc3BvbnNlLCBpdGVtOiAkc2NvcGUuaXRlbX0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB2YXIgY29weSA9IGFuZ3VsYXIuY29weSgkc2NvcGUuaXRlbSk7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnJlbmFtZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBjcmVhdGUgaXRlbSBhdXRvbWFwcGVyXHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnBhdGggPSByZXNwb25zZS5kYXRhLnBhdGg7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLm5hbWUgPSByZXNwb25zZS5kYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnVybCA9IHJlc3BvbnNlLmRhdGEudXJsO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZvbGRlci1yZW5hbWVkJywgeyduZXcnOiByZXNwb25zZS5kYXRhLCBvbGQ6IGNvcHl9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uRmlsZVJlbmFtZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IG9uRmlsZVJlbmFtZWQnLCB7cmVzcG9uc2U6IHJlc3BvbnNlfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnJlbmFtZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXRlbS5uYW1lID0gcmVzcG9uc2UuZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXRlbS51cmwgPSByZXNwb25zZS5kYXRhLnVybDtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0udGh1bWJzID0gcmVzcG9uc2UuZGF0YS50aHVtYnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWxlY3QoaXRlbSwgdGh1bWJJbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgZmlsZV91cmwgPSBpdGVtLnVybDtcclxuICAgICAgICAgICAgaWYgKCEhdGh1bWJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgZmlsZV91cmwgPSBpdGVtLnRodW1ic1t0aHVtYkluZGV4XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgc2VsZWN0IGZvciB0aW55TUNFXHJcbiAgICAgICAgICAgIGlmIChTZXR0aW5ncy5pc1RhcmdldCgndGlueU1DRScpKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLmluZm8oJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IHNlbGVjdCAtPiB0aW55bWNlJywge3RpbnltY2U6IHRvcC50aW55bWNlfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9wLnRpbnltY2UubWFqb3JWZXJzaW9uIDwgNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLnBhcmFtcy5zZXRVcmwoZmlsZV91cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JfaWQgPSB0b3AudGlueW1jZS5hY3RpdmVFZGl0b3Iud2luZG93TWFuYWdlci5wYXJhbXMubWNlX3dpbmRvd19pZDtcclxuICAgICAgICAgICAgICAgICAgICB0b3AudGlueW1jZS5hY3RpdmVFZGl0b3Iud2luZG93TWFuYWdlci5jbG9zZShlZGl0b3JfaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5pbmZvKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBzZWxlY3QgLT4gdGlueW1jZTQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7cGFyYW1zOiB0b3AudGlueW1jZS5hY3RpdmVFZGl0b3Iud2luZG93TWFuYWdlci5nZXRQYXJhbXMoKX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmdldFBhcmFtcygpLnNldFVybChmaWxlX3VybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wLnRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKFNldHRpbmdzLmlzVGFyZ2V0KCdjYWxsYmFjaycpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZW1hbmFnZXIgPSB3LmZpbGVtYW5hZ2VyIHx8IHcucGFyZW50LmZpbGVtYW5hZ2VyIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGZpbGVtYW5hZ2VyICYmIGZpbGVtYW5hZ2VyLm9uU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlbWFuYWdlci5vblNlbGVjdGVkKGZpbGVfdXJsLCBTZXR0aW5ncy5nZXRQYXJhbXMoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZUl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzRGlyKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lICE9ICcuLicpXHJcbiAgICAgICAgICAgICAgICAgICAgRGlyU2VydmljZS5kZWxldGUoJHNjb3BlLm1hbmFnZXIucGF0aCwgaXRlbS5uYW1lLCBvbkZvbGRlckRlbGV0ZWQsICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEZpbGVTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUubWFuYWdlci5wYXRoLCBpdGVtLm5hbWUsIG9uRmlsZURlbGV0ZWQsICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25Gb2xkZXJEZWxldGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBvbkZvbGRlckRlbGV0ZWQnLCB7cmVzcG9uc2U6IHJlc3BvbnNlfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdmb2xkZXItZGVsZXRlZCcsIHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25GaWxlRGVsZXRlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gb25GaWxlRGVsZXRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZpbGUtZGVsZXRlZCcsIHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVGh1bWJzKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhaXRlbSAmJiBhbmd1bGFyLmlzRGVmaW5lZChpdGVtLnRodW1icykgJiYgTy5rZXlzKGl0ZW0udGh1bWJzKS5sZW5ndGggPiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdGh1bWJOYW1lKHRodW1iSW5kZXgsIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKHRodW1iSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaXplID0gU2V0dGluZ3MuZ2V0VGh1bWJTaXplKHRodW1iSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBzaXplWzBdO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc2l6ZVsxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSAnKHt3aWR0aH0geCB7aGVpZ2h0fSknLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zID0ge3dpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlLnN1cHBsYW50KHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnksIHRvcCwgd2luZG93LCBPYmplY3QpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdUcmVlQ29udHJvbGxlcicsIFRyZWVDb250cm9sbGVyKTtcclxuXHJcbiAgICBUcmVlQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICdEaXInLCAnRGlyU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gVHJlZUNvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCBEaXIsIERpclNlcnZpY2UpIHtcclxuICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgY29udHJvbGxlciA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNPcGVuID0gaXNPcGVuO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNFbXB0eSA9IGlzRW1wdHk7XHJcbiAgICAgICAgICAgICRzY29wZS5jaGFuZ2VGb2xkZXIgPSBjaGFuZ2VGb2xkZXI7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudHJlZSA9IHtcclxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW10sXHJcbiAgICAgICAgICAgICAgICByb290OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJy8nLCAvLyBUT0RPOiBnZXQgdHJhbnNsYXRpb24gZm9yIHRoaXMgdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJHNjb3BlLmJhc2VVcmwgKyAnZGlyJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4cGFuZDogZXhwYW5kXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBhZGQgdHJlZSByZWZyZXNoXHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ19lcnJvcicsIG9uRXJyb3JIYW5kbGVkKTtcclxuICAgICAgICAkc2NvcGUuJG9uKCdfd2FybmluZycsIG9uRXJyb3JIYW5kbGVkKTtcclxuICAgICAgICBmdW5jdGlvbiBvbkVycm9ySGFuZGxlZChldmVudCkge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJlZS5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCd0cmVlLWNoYW5nZWQnLCB0cmVlQ2hhbmdlZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gdHJlZUNoYW5nZWQoZXZlbnQsIHRyZWUpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ1RyZWVDb250cm9sbGVyIC0+IHRyZWVDaGFuZ2VkJywge2V2ZW50OiBldmVudCwgdHJlZTogdHJlZX0pO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJlZS5pdGVtcyA9IHRyZWU7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2ZvbGRlci1jcmVhdGVkJywgb25Gb2xkZXJDcmVhdGVkKTtcclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckNyZWF0ZWQoZXZlbnQsIGZvbGRlcikge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gb25Gb2xkZXJDcmVhdGVkJywge2V2ZW50OiBldmVudCwgZm9sZGVyOiBmb2xkZXJ9KTtcclxuICAgICAgICAgICAgaWYgKGZvbGRlci5wYXRoLmluZGV4T2YoJy8nKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZWQgZm9sZGVyIGlzIGluIHJvb3QsIHNvIHdlZSBuZWVkIGFkZCBpdCB0byB0cmVlIG1lbnVcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zLnVuc2hpZnQoZm9sZGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLXJlbmFtZWQnLCBvbkZvbGRlclJlbmFtZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyUmVuYW1lZChldmVudCwgZm9sZGVycykge1xyXG4gICAgICAgICAgICB2YXIgb2xkRm9sZGVyID0gZm9sZGVycy5vbGQsXHJcbiAgICAgICAgICAgICAgICBuZXdGb2xkZXIgPSBmb2xkZXJzLm5ldztcclxuICAgICAgICAgICAgJGxvZy5sb2coJ1RyZWVDb250cm9sbGVyIC0+IG9uRm9sZGVyUmVuYW1lZCcsIHtldmVudDogZXZlbnQsIG5ld0ZvbGRlcjogbmV3Rm9sZGVyLCBvbGRGb2xkZXI6IG9sZEZvbGRlcn0pO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgY2hlY2sgYWxsIGNoaWxkIGZvbGRlcnNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUudHJlZS5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS50cmVlLml0ZW1zW2ldLnBhdGggPT0gb2xkRm9sZGVyLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBjcmVhdGUgaXRlbSBhdXRvbWFwcGVyXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXNbaV0ucGF0aCA9IG5ld0ZvbGRlci5wYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zW2ldLm5hbWUgPSBuZXdGb2xkZXIubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJlZS5pdGVtc1tpXS51cmwgPSBuZXdGb2xkZXIudXJsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdmb2xkZXItZGVsZXRlZCcsIHJlbW92ZUJ5UGF0aCk7XHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlQnlQYXRoKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciAtPiByZW1vdmVCeVBhdGgnLCB7ZXZlbnQ6IGV2ZW50LCBpdGVtOiBpdGVtLCBpdGVtczogJHNjb3BlLnRyZWUuaXRlbXN9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJlY3Vyc2l2ZWx5IGNoZWNrIGFsbCBjaGlsZCBmb2xkZXJzXHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zLnJlbW92ZUl0ZW0oaXRlbS5wYXRoLCAncGF0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgZm9sZGVyIG9wZW4gZm9yIHRyZWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBmb2xkZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc09wZW4oZm9sZGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmb2xkZXIgJiYgYW5ndWxhci5pc0RlZmluZWQoZm9sZGVyLmZvbGRlcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgZm9sZGVyIGhhcyBhbnkgb3RoZXIgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZm9sZGVyXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eShmb2xkZXIpIHtcclxuICAgICAgICAgICAgaWYgKGlzT3Blbihmb2xkZXIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvbGRlci5mb2xkZXJzLmxlbmd0aCA9PSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmQoY3VyckZvbGRlcikge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIGlmIHRyZWUgc3RpbGwgbG9hZGluZyBvciBkb25gdCBoYXZlIHN1YiBmb2xkZXJzXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUudHJlZS5sb2FkaW5nIHx8IGlzRW1wdHkoY3VyckZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybignVHJlZUNvbnRyb2xsZXIgLT4gZXhwYW5kJywgJ1ByZXZpb3VzIGl0ZW0gc3RpbGwgbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gZXhwYW5kJywge2N1cnI6IGN1cnJGb2xkZXJ9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgc3ViIGZvbGRlcnMgaWYgaXQgaXMgYWxyZWFkeSBvcGVuZWRcclxuICAgICAgICAgICAgaWYgKGlzT3BlbihjdXJyRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY3VyckZvbGRlci5mb2xkZXJzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudHJlZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KHtwYXRoOiBjdXJyRm9sZGVyLnBhdGh9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGN1cnJGb2xkZXIuZm9sZGVycyA9IHJlc3BvbnNlLmRpcnMoKTtcclxuICAgICAgICAgICAgfSwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VGb2xkZXIoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdjaGFuZ2UtZm9sZGVyJywgZm9sZGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1VwbG9hZENvbnRyb2xsZXInLCBVcGxvYWRDb250cm9sbGVyKTtcclxuXHJcbiAgICBVcGxvYWRDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ0ZpbGVVcGxvYWRlcidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gVXBsb2FkQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsIEZpbGVVcGxvYWRlcikge1xyXG4gICAgICAgICRsb2cubG9nKCdVcGxvYWRDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyID0gbmV3IEZpbGVVcGxvYWRlcih7XHJcbiAgICAgICAgICAgICAgICB1cmw6IF9nZXRVcGxvYWRQYXRoXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldFVwbG9hZFBhdGgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuYmFzZVVybCgpICsgJ2ZpbGUvdXBsb2FkJyArICRzY29wZS5tYW5hZ2VyLnBhdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUudXBsb2FkZXIub25XaGVuQWRkaW5nRmlsZUZhaWxlZCA9IGZ1bmN0aW9uIChpdGVtIC8qe0ZpbGV8RmlsZUxpa2VPYmplY3R9Ki8sIGZpbHRlciwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAkbG9nLmluZm8oJ29uV2hlbkFkZGluZ0ZpbGVGYWlsZWQnLCBpdGVtLCBmaWx0ZXIsIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbkFmdGVyQWRkaW5nRmlsZSA9IGZ1bmN0aW9uIChmaWxlSXRlbSkge1xyXG4gICAgICAgICAgICAvLyBmaXggdXJsIHRvIHVwbG9hZCBhcyB3ZSBjYW4gY2hhbmdlIGl0IGF0IGFueSBtb21lbnRcclxuICAgICAgICAgICAgZmlsZUl0ZW0udXBsb2FkZXIudXJsID0gZmlsZUl0ZW0udXJsID0gX2dldFVwbG9hZFBhdGgoKTtcclxuICAgICAgICAgICAgJGxvZy5pbmZvKCdvbkFmdGVyQWRkaW5nRmlsZScsIGZpbGVJdGVtKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudXBsb2FkZXIub25FcnJvckl0ZW0gPSBmdW5jdGlvbiAoZmlsZUl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYWRkIGVycm9yIGhhbmRsaW5nXHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnb25FcnJvckl0ZW0nLCBmaWxlSXRlbSwgLypyZXNwb25zZSwqLyBzdGF0dXMsIGhlYWRlcnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbkNvbXBsZXRlSXRlbSA9IGZ1bmN0aW9uIChmaWxlSXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycykge1xyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICRsb2cuaW5mbygnVXBsb2FkQ29udHJvbGxlciAtPiB1cGxvYWRlciAtPiBvbkNvbXBsZXRlSXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAge2ZpbGVJdGVtOiBmaWxlSXRlbSwgcmVzcG9uc2U6IHJlc3BvbnNlLCBzdGF0dXM6IHN0YXR1cywgaGVhZGVyczogaGVhZGVyc30pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZpbGUtdXBsb2FkZWQnLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyLm9uQ29tcGxldGVBbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnVXBsb2FkQ29udHJvbGxlciAtPiB1cGxvYWRlciAtPiBvbkNvbXBsZXRlQWxsJywge3VwbG9hZGVyOiAkc2NvcGUudXBsb2FkZXJ9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYXNOb3RVcGxvYWRlZEZpbGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUudXBsb2FkZXIucXVldWUsIGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGUuaXNSZWFkeSAmJiAhZmlsZS5pc1VwbG9hZGluZyAmJiAhZmlsZS5pc1N1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNOb3RVcGxvYWRlZEZpbGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWhhc05vdFVwbG9hZGVkRmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIENsZWFyIGxpcyBmcm9tIGl0ZW1zIGFuZCBoaWRlIGl0XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBsb2FkZXIuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnZmlsZS5tYW5hZ2VyJylcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcmVzb3VyY2UnLCAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyKCRsb2csICRyZXNvdXJjZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgICRsb2cubG9nKCdEaXIgcmVzb3VyY2UgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICByZXR1cm4gJHJlc291cmNlKCRyb290U2NvcGUuYmFzZVVybCgpICsgJ2Rpci86cGF0aCcsIHtcclxuICAgICAgICAgICAgcGF0aDogJ0BwYXRoJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdEaXJTZXJ2aWNlJywgRGlyU2VydmljZSk7XHJcblxyXG4gICAgRGlyU2VydmljZS4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRyb290U2NvcGUnLCAnJGh0dHAnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpclNlcnZpY2UoJGxvZywgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuICAgICAgICAkbG9nLmxvZygnRGlyU2VydmljZSBzZXJ2aWNlIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZXh0ZW5kOiBleHRlbmQsXHJcbiAgICAgICAgICAgIGV4dGVuZEl0ZW06IGV4dGVuZEl0ZW0sXHJcbiAgICAgICAgICAgIHJlbmFtZTogcmVuYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgICAgICAgICAgJ2RlbGV0ZSc6IGRlbGV0ZURpcixcclxuICAgICAgICAgICAgaWRHZW46IGlkR2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGRhdGEuRGlyU2VydmljZUV4dGVuZGVkKSAmJiBkYXRhLkRpclNlcnZpY2VFeHRlbmRlZClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGRhdGEsIHtcclxuICAgICAgICAgICAgICAgIGRpcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PSAnZGlyJyAmJiB2YWx1ZS5uYW1lICE9ICcuLicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odmFsdWUsIGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZm9sZGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb2xkZXJzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odmFsdWUsIGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgaXRlbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZGF0YS5EaXJTZXJ2aWNlRXh0ZW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuYW1lcyBwYXRoIGxhc3QgcGFydCBudG8gbmV3IG5hbWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXRoIFwicGF0aCB0byByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbGROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIG5ld05hbWUgXCJuZXcgbmFtZSBmb3IgcGF0aCBsYXN0IGVsZW1lbnRcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvblN1Y2Nlc3MgXCJjYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbkVycm9yIFwiY2FsbGJhY2sgZm9yIGVycm9yXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5hbWUocGF0aCwgb2xkTmFtZSwgbmV3TmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkcm9vdFNjb3BlLmJhc2VVcmwoKSArICdkaXIvcmVuYW1lLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ29sZCc6IG9sZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAnbmV3JzogbmV3TmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uU3VjY2Vzcywgb25FcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGUocGF0aCwgbmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkcm9vdFNjb3BlLmJhc2VVcmwoKSArICdkaXIvY3JlYXRlLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZURpcihwYXRoLCBuYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2Rpci9kZWxldGUvJyArIHBhdGg7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QodXJsLCB7XHJcbiAgICAgICAgICAgICAgICAnbmFtZSc6IG5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaWRHZW4oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbGlzdC1pdGVtLScgKyBrZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmRJdGVtKGl0ZW0sIGtleSkge1xyXG4gICAgICAgICAgICBpdGVtLmlkID0gaWRHZW4oa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLnNlcnZpY2UoJ0ZpbGVTZXJ2aWNlJywgRmlsZVNlcnZpY2UpO1xyXG5cclxuICAgIEZpbGVTZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHJvb3RTY29wZScsICckaHR0cCdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRmlsZVNlcnZpY2UoJGxvZywgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuICAgICAgICAkbG9nLmxvZygnRmlsZVNlcnZpY2Ugc2VydmljZSA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlbmFtZTogcmVuYW1lLFxyXG4gICAgICAgICAgICAnZGVsZXRlJzogZGVsZXRlRmlsZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmFtZShwYXRoLCBvbGROYW1lLCBuZXdOYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZpbGVTZXJ2aWNlIC0+IHJlbmFtZScsIHtwYXRoOiBwYXRoLCBvbGROYW1lOiBvbGROYW1lLCBuZXdOYW1lOiBuZXdOYW1lfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXJsID0gJHJvb3RTY29wZS5iYXNlVXJsKCkgKyAnZmlsZS9yZW5hbWUvJyArIHBhdGg7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QodXJsLCB7XHJcbiAgICAgICAgICAgICAgICAnb2xkJzogb2xkTmFtZSxcclxuICAgICAgICAgICAgICAgICduZXcnOiBuZXdOYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZUZpbGUocGF0aCwgbmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGaWxlU2VydmljZSAtPiBkZWxldGUnLCB7cGF0aDogcGF0aCwgbmFtZTogbmFtZX0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2ZpbGUvZGVsZXRlLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChuZywgJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIG5nXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXG4gICAgICAgIC5zZXJ2aWNlKCdTZXR0aW5ncycsIFNldHRpbmdzKTtcblxuICAgIFNldHRpbmdzLiRpbmplY3QgPSBbXTtcblxuICAgIGZ1bmN0aW9uIFNldHRpbmdzKCkge1xuICAgICAgICB2YXIgJHNldHRpbmdzID0gJCgnI3NldHRpbmdzJyksIHBhcmFtcyA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc1RhcmdldDogaXNUYXJnZXQsXG4gICAgICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxuICAgICAgICAgICAgZ2V0VGh1bWJTaXplOiBnZXRUaHVtYlNpemUsXG4gICAgICAgICAgICBnZXRQYXJhbXM6IGdldFBhcmFtc1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGlzVGFyZ2V0KGN1cnJfdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UGFyYW1zKCkudGFyZ2V0LnRvTG93ZXJDYXNlKCkgPT09IGN1cnJfdGFyZ2V0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICAgICAgcmV0dXJuIChnZXRQYXJhbXMoKS50eXBlID8gcGFyYW1zLnR5cGUudG9Mb3dlckNhc2UoKSA6IGZhbHNlKSB8fCAnZmlsZSc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRUaHVtYlNpemUoc2l6ZUtleSkge1xuICAgICAgICAgICAgdmFyIHNpemVzID0gbmcuZnJvbUpzb24oJHNldHRpbmdzLmRhdGEoJ3NpemVzJykucmVwbGFjZSgvXFwnL2csICdcIicpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNpemVzW3NpemVLZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UGFyYW1zKCkge1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YVBhcmFtcyA9ICRzZXR0aW5ncy5kYXRhKCdwYXJhbXMnKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBwYXJhbXMgaXMgZW1wdHkgYXJyYXksIGl0IGFscmVhZHkgY29udmVydGVkIHRvIGVtcHR5IGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFQYXJhbXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG5cbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBzdHJGcm9tSnNvbihkYXRhUGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaXhTZXJpYWxpemFibGVTdHIoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFwnL2csICdcIicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ckZyb21Kc29uKHN0cikge1xuICAgICAgICByZXR1cm4gbmcuZnJvbUpzb24oZml4U2VyaWFsaXphYmxlU3RyKHN0cikpO1xuICAgIH1cbn0pKGFuZ3VsYXIsIGpRdWVyeSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
