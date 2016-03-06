(function(ng, crip){
    'use strict';

    crip.fileM = ng.module('file.manager', [
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

})(angular, window.crip || (window.crip = {}));
// hello from js
(function () {
    'use strict';

    angular.module('app', [
        'file.manager'
    ]);

})();
(function (angular, $, crip) {
    'use strict';

    crip.fileM
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
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.fileM
        .controller('BaseController', BaseController);

    BaseController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'DirService', 'Dir'
    ];

    function BaseController($log, $scope, $cookies, Notification, DirService, Dir) {
        //$log.log('BaseController controller <- started');

        activate();

        function activate() {
            $scope.isDir = isDir;
            $scope.isDirUp = isDirUp;

            // only for sub-controller usage
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
            return item && ng.isDefined(item.mime) && item.mime === 'dir';
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

            if (ng.isDefined(response.notification))
                notification = response.notification;

            if (ng.isDefined(response.data) && ng.isDefined(response.data.notification))
                notification = response.data.notification;

            if (notification)
                return {hasMessage: true, message: notification};

            //$log.error('Cant get user friendly message from response', {response: response});
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
            //$log.log('BaseController -> onInitialDirLoaded', {response: response});

            DirService.extend(response);

            $scope.fireBroadcast('tree-changed', response.dirs());
            $scope.fireBroadcast('folder-changed', response.items());

            //$log.log('FolderCache', {path: $cookies.get('path')});
            //if (!($cookies.get('path') === '/' || typeof $cookies.get('path') === 'undefined')) {
            //    $scope.fireBroadcast('change-folder', {path: $cookies.get('path')});
            //}
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.fileM
        .controller('FolderController', FolderController);

    FolderController.$inject = [
        '$log', '$scope', '$cookies', 'focus', 'Dir', 'DirService', 'Settings'
    ];

    function FolderController($log, $scope, $cookies, focus, Dir, DirService, Settings) {
        //$log.log('FolderController controller <- started');

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
                    // order by property
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

            //$log.log('FolderController -> changeFolder', {event: event, folder: folder});
            $scope.folder.loading = true;
            Dir.query(folder, function (r) {
                $scope._success(r);
                onFolderChanged(r, folder);
            }, $scope._error);
        }

        $scope.$on('folder-changed', onFolderExternallyChanged);
        function onFolderExternallyChanged(event, items) {
            //$log.log('FolderController -> onFolderExternallyChanged', {event: event, items: items});
            $scope.folder.loading = false;
            $scope.folder.items = items;
        }

        $scope.$on('file-uploaded', addNewFile);
        function addNewFile(event, file) {
            //$log.log('FolderController -> addNewFile', {event: event, file: file});
            DirService.extendItem(file, $scope.folder.items.length);
            $scope.folder.items.unshift(file);
        }

        $scope.$on('folder-deleted', removeByPath);
        $scope.$on('file-deleted', removeByPath);
        function removeByPath(event, item) {
            // TODO: now we dont have path property, find a way to remove item from ui when deleted
            //$log.log('FolderController -> removeByPath', {event: event, item: item, items: $scope.folder.items});
            //$scope.folder.items.removeItem(item.path, 'path');
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
            if (ng.isDefined(value.type)) {
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
            //$log.log('FolderController -> refresh', {manager: $scope.manager});
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
})(angular, window.crip || (window.crip = {}));
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
(function (angular, crip) {
    'use strict';

    crip.fileM
        .service('DirService', DirService);

    DirService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function DirService($log, $rootScope, $http) {
        //$log.log('DirService service <- started');

        return {
            'extend': extend,
            'extendItem': extendItem,
            'rename': rename,
            'create': create,
            'delete': deleteDir,
            'idGen': idGen
        };

        function extend(data) {
            if (angular.isDefined(data.DirServiceExtended) && data.DirServiceExtended)
                return;

            angular.extend(data, {
                /**
                 * Used for file tree where folder up is not required
                 *
                 * @returns {Array}
                 */
                dirs: function () {
                    var folders = [];
                    angular.forEach(data, function (value, key) {
                        if (value.mime === 'dir' && value.full_name != '..') {
                            extendItem(value, key);
                            this.push(value);
                        }
                    }, folders);

                    return folders;
                },
                /**
                 * Append each item with required data
                 *
                 * @returns {Array}
                 */
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
         * @param dir "path to rename"
         * @param oldName
         * @param newName "new name for path last element"
         * @param onSuccess "callback for successful rename"
         * @param onError "callback for error"
         */
        function rename(dir, oldName, newName, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/rename/' + dir;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        /**
         * Create new directory
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function create(dir, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/create/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        /**
         * Delete existing directory
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function deleteDir(dir, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/delete/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        /**
         * Generate unique item id property
         *
         * @param key array key
         * @returns {string} item id
         */
        function idGen(key) {
            return 'list-item-' + key;
        }

        /**
         * Add id parameter to item
         *
         * @param item
         * @param key
         */
        function extendItem(item, key) {
            item.id = idGen(key);
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (angular, crip) {
    'use strict';

    crip.fileM
        .service('FileService', FileService);

    FileService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function FileService($log, $rootScope, $http) {
        //$log.log('FileService service <- started');

        return {
            rename: rename,
            'delete': deleteFile
        };

        /**
         * Rename file
         *
         * @param dir
         * @param oldName
         * @param newName
         * @param onSuccess
         * @param onError
         */
        function rename(dir, oldName, newName, onSuccess, onError) {
            $log.log('FileService -> rename', {dir: dir, oldName: oldName, newName: newName});

            var url = $rootScope.baseUrl() + 'file/rename/' + dir;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        /**
         * Delete file
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function deleteFile(dir, name, onSuccess, onError) {
            $log.log('FileService -> delete', {dir: dir, name: name});

            var url = $rootScope.baseUrl() + 'file/delete/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.fileM
        .service('Settings', Settings);

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
})(angular, jQuery, window.crip || (window.crip = {}));
(function (crip) {
    'use strict';

    crip.fileM
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($log, $resource, $rootScope) {
        //$log.log('Dir resource <- started');

        return $resource($rootScope.baseUrl() + 'dir/:dir/:name', {
            dir: '@dir',
            name: '@name'
        });
    }
})(window.crip || (window.crip = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGVtYW5hZ2VyL21vZHVsZS5qcyIsImFwcC5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL0Jhc2VDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvRm9sZGVyQ29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL0ZvbGRlckl0ZW1Db250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvVHJlZUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9VcGxvYWRDb250cm9sbGVyLmpzIiwic2VydmljZXMvRGlyU2VydmljZS5qcyIsInNlcnZpY2VzL0ZpbGVTZXJ2aWNlLmpzIiwic2VydmljZXMvU2V0dGluZ3MuanMiLCJyZXNvdXJjZXMvRGlyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24obmcsIGNyaXApe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGNyaXAuZmlsZU0gPSBuZy5tb2R1bGUoJ2ZpbGUubWFuYWdlcicsIFtcbiAgICAgICAgJ2NyaXAuY29yZScsXG4gICAgICAgICdhbmd1bGFyLWxvYWRpbmctYmFyJyxcbiAgICAgICAgJ2FuZ3VsYXJGaWxlVXBsb2FkJyxcbiAgICAgICAgJ25nQ29va2llcycsXG4gICAgICAgICduZ1Jlc291cmNlJyxcbiAgICAgICAgJ25nU2FuaXRpemUnLFxuICAgICAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAgICAgJ3VpLW5vdGlmaWNhdGlvbicsXG4gICAgICAgICdpby5kZW5uaXMuY29udGV4dG1lbnUnXG4gICAgXSk7XG5cbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiLy8gaGVsbG8gZnJvbSBqc1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXHJcbiAgICAgICAgJ2ZpbGUubWFuYWdlcidcclxuICAgIF0pO1xyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVNXHJcbiAgICAgICAgLnJ1bihSdW4pO1xyXG5cclxuICAgIFJ1bi4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSdW4oJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHZhciAkc2V0dGluZ3MgPSAkKCcjc2V0dGluZ3MnKTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS5maXJlQnJvYWRjYXN0ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgYXJncykge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoZXZlbnROYW1lLCBhcmdzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLmJhc2VVcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2V0dGluZ3MuZGF0YSgnYmFzZS11cmwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZU1cclxuICAgICAgICAuY29udHJvbGxlcignQmFzZUNvbnRyb2xsZXInLCBCYXNlQ29udHJvbGxlcik7XHJcblxyXG4gICAgQmFzZUNvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnJGNvb2tpZXMnLCAnTm90aWZpY2F0aW9uJywgJ0RpclNlcnZpY2UnLCAnRGlyJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCYXNlQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRjb29raWVzLCBOb3RpZmljYXRpb24sIERpclNlcnZpY2UsIERpcikge1xyXG4gICAgICAgIC8vJGxvZy5sb2coJ0Jhc2VDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmlzRGlyID0gaXNEaXI7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0RpclVwID0gaXNEaXJVcDtcclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgZm9yIHN1Yi1jb250cm9sbGVyIHVzYWdlXHJcbiAgICAgICAgICAgICRzY29wZS5fZXJyb3IgPSBfZXJyb3I7XHJcbiAgICAgICAgICAgICRzY29wZS5fd2FybmluZyA9IF93YXJuaW5nO1xyXG4gICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MgPSBfc3VjY2VzcztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5tYW5hZ2VyID0ge1xyXG4gICAgICAgICAgICAgICAgcGF0aDogJy8nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgY2FjaGluZyBhbmQgbG9hZCBsYXN0IG9wZW5lZCBkaXIgZm9yICRzY29wZS5mb2xkZXIuaXRlbXNcclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KG9uSW5pdGlhbERpckxvYWRlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyBwYXNzZWQgaXRlbSBpcyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMgeyp8Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpcihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtICYmIG5nLmlzRGVmaW5lZChpdGVtLm1pbWUpICYmIGl0ZW0ubWltZSA9PT0gJ2Rpcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyBwYXNzZWQgaXRlbSBpcyBkaXIgdG8gZ28gdXBcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfGJvb2xlYW58Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpclVwKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGlyKGl0ZW0pICYmIGl0ZW0ubmFtZSA9PSAnLi4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX19yZXNvbHZlTWVzc2FnZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKHJlc3BvbnNlLm5vdGlmaWNhdGlvbikpXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSByZXNwb25zZS5ub3RpZmljYXRpb247XHJcblxyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKHJlc3BvbnNlLmRhdGEpICYmIG5nLmlzRGVmaW5lZChyZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbikpXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSByZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge2hhc01lc3NhZ2U6IHRydWUsIG1lc3NhZ2U6IG5vdGlmaWNhdGlvbn07XHJcblxyXG4gICAgICAgICAgICAvLyRsb2cuZXJyb3IoJ0NhbnQgZ2V0IHVzZXIgZnJpZW5kbHkgbWVzc2FnZSBmcm9tIHJlc3BvbnNlJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG4gICAgICAgICAgICByZXR1cm4ge2hhc01lc3NhZ2U6IGZhbHNlfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9lcnJvcihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnX2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX19yZXNvbHZlTWVzc2FnZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLmhhc01lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgICBOb3RpZmljYXRpb24uZXJyb3Ioe21lc3NhZ2U6IGhhbmRsZXIubWVzc2FnZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3dhcm5pbmcocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ193YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX19yZXNvbHZlTWVzc2FnZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLmhhc01lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgICBOb3RpZmljYXRpb24uZXJyb3Ioe21lc3NhZ2U6IGhhbmRsZXIubWVzc2FnZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3N1Y2Nlc3MocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfX3Jlc29sdmVNZXNzYWdlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIuaGFzTWVzc2FnZSlcclxuICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKHttZXNzYWdlOiBoYW5kbGVyLm1lc3NhZ2V9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluaXRpYWwgZGlyIGxvYWQgZm9yIGZvbGRlciBhbmQgdHJlZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25Jbml0aWFsRGlyTG9hZGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIC8vJGxvZy5sb2coJ0Jhc2VDb250cm9sbGVyIC0+IG9uSW5pdGlhbERpckxvYWRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuXHJcbiAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCd0cmVlLWNoYW5nZWQnLCByZXNwb25zZS5kaXJzKCkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZm9sZGVyLWNoYW5nZWQnLCByZXNwb25zZS5pdGVtcygpKTtcclxuXHJcbiAgICAgICAgICAgIC8vJGxvZy5sb2coJ0ZvbGRlckNhY2hlJywge3BhdGg6ICRjb29raWVzLmdldCgncGF0aCcpfSk7XHJcbiAgICAgICAgICAgIC8vaWYgKCEoJGNvb2tpZXMuZ2V0KCdwYXRoJykgPT09ICcvJyB8fCB0eXBlb2YgJGNvb2tpZXMuZ2V0KCdwYXRoJykgPT09ICd1bmRlZmluZWQnKSkge1xyXG4gICAgICAgICAgICAvLyAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnY2hhbmdlLWZvbGRlcicsIHtwYXRoOiAkY29va2llcy5nZXQoJ3BhdGgnKX0pO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZU1cclxuICAgICAgICAuY29udHJvbGxlcignRm9sZGVyQ29udHJvbGxlcicsIEZvbGRlckNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEZvbGRlckNvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnJGNvb2tpZXMnLCAnZm9jdXMnLCAnRGlyJywgJ0RpclNlcnZpY2UnLCAnU2V0dGluZ3MnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEZvbGRlckNvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCAkY29va2llcywgZm9jdXMsIERpciwgRGlyU2VydmljZSwgU2V0dGluZ3MpIHtcclxuICAgICAgICAvLyRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlciA9IHtcclxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGluZzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbHRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtZWRpYTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jOiBvcmRlcixcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2U6IGNoYW5nZU9yZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9yZGVyIGJ5IHByb3BlcnR5XHJcbiAgICAgICAgICAgICAgICAgICAgYnk6ICduYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICByZXZlcnNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlQ3JlYXRlOiBlbmFibGVDcmVhdGUsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgICAgICAgICAgICAgIHJlZnJlc2g6IHJlZnJlc2gsXHJcbiAgICAgICAgICAgICAgICBpc0ZpbHRlcnNFbmFibGVkOiBpc0ZpbHRlcnNFbmFibGVkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXJGaWx0ZXIgPSBmb2xkZXJGaWx0ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfX2NhbkxvYWQoKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgZm9sZGVyIHN0aWxsIGxvYWRpbmdcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5mb2xkZXIubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKCdGb2xkZXJDb250cm9sbGVyIC0+IGxvYWRpbmcnLCAnUHJldmlvdXMgaXRlbSBzdGlsbCBsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdfZXJyb3InLCBvbkVycm9ySGFuZGxlZCk7XHJcbiAgICAgICAgJHNjb3BlLiRvbignX3dhcm5pbmcnLCBvbkVycm9ySGFuZGxlZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25FcnJvckhhbmRsZWQoZXZlbnQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdjaGFuZ2UtZm9sZGVyJywgY2hhbmdlRm9sZGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VGb2xkZXIoZXZlbnQsIGZvbGRlcikge1xyXG4gICAgICAgICAgICBpZiAoIV9fY2FuTG9hZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8kbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBjaGFuZ2VGb2xkZXInLCB7ZXZlbnQ6IGV2ZW50LCBmb2xkZXI6IGZvbGRlcn0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBEaXIucXVlcnkoZm9sZGVyLCBmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHIpO1xyXG4gICAgICAgICAgICAgICAgb25Gb2xkZXJDaGFuZ2VkKHIsIGZvbGRlcik7XHJcbiAgICAgICAgICAgIH0sICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWNoYW5nZWQnLCBvbkZvbGRlckV4dGVybmFsbHlDaGFuZ2VkKTtcclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckV4dGVybmFsbHlDaGFuZ2VkKGV2ZW50LCBpdGVtcykge1xyXG4gICAgICAgICAgICAvLyRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IG9uRm9sZGVyRXh0ZXJuYWxseUNoYW5nZWQnLCB7ZXZlbnQ6IGV2ZW50LCBpdGVtczogaXRlbXN9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2ZpbGUtdXBsb2FkZWQnLCBhZGROZXdGaWxlKTtcclxuICAgICAgICBmdW5jdGlvbiBhZGROZXdGaWxlKGV2ZW50LCBmaWxlKSB7XHJcbiAgICAgICAgICAgIC8vJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gYWRkTmV3RmlsZScsIHtldmVudDogZXZlbnQsIGZpbGU6IGZpbGV9KTtcclxuICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmRJdGVtKGZpbGUsICRzY29wZS5mb2xkZXIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcy51bnNoaWZ0KGZpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWRlbGV0ZWQnLCByZW1vdmVCeVBhdGgpO1xyXG4gICAgICAgICRzY29wZS4kb24oJ2ZpbGUtZGVsZXRlZCcsIHJlbW92ZUJ5UGF0aCk7XHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlQnlQYXRoKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG5vdyB3ZSBkb250IGhhdmUgcGF0aCBwcm9wZXJ0eSwgZmluZCBhIHdheSB0byByZW1vdmUgaXRlbSBmcm9tIHVpIHdoZW4gZGVsZXRlZFxyXG4gICAgICAgICAgICAvLyRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IHJlbW92ZUJ5UGF0aCcsIHtldmVudDogZXZlbnQsIGl0ZW06IGl0ZW0sIGl0ZW1zOiAkc2NvcGUuZm9sZGVyLml0ZW1zfSk7XHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmZvbGRlci5pdGVtcy5yZW1vdmVJdGVtKGl0ZW0ucGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICAgICAgLy9yZW1vdmVGcm9tQXJyKCRzY29wZS5mb2xkZXIuaXRlbXMsICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaWx0ZXJzIGZvbGRlciBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgICAgICogQHBhcmFtIGFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZm9sZGVyRmlsdGVyKHZhbHVlLCBpbmRleCwgYXJyYXkpIHtcclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZCh2YWx1ZS50eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnR5cGUgPT0gJ2RpcicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyc0VuYWJsZWQoKSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmZvbGRlci5maWx0ZXJzW3ZhbHVlLnR5cGVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5ncy5nZXRUeXBlKCkgPT0gdmFsdWUudHlwZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3JkZXIoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnZGlyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ubmFtZSA9PSAnLi4nKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwICsgJyAnICsgaXRlbVskc2NvcGUuZm9sZGVyLm9yZGVyLmJ5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuICd6JyArIGl0ZW1bJHNjb3BlLmZvbGRlci5vcmRlci5ieV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VPcmRlcihuZXdOYW1lKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIub3JkZXIuYnkgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IFsnbmFtZScsICdzaXplJywgJ2RhdGUnXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSlcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm9yZGVyW29wdGlvbnNbaV1dID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5vcmRlcltuZXdOYW1lXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc0ZpbHRlcnNFbmFibGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gU2V0dGluZ3MuZ2V0VHlwZSgpID09ICdmaWxlJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlZnJlc2goKSB7XHJcbiAgICAgICAgICAgIGlmICghX19jYW5Mb2FkKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gcmVmcmVzaCcsIHttYW5hZ2VyOiAkc2NvcGUubWFuYWdlcn0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUubWFuYWdlci5wYXRoID0gJHNjb3BlLm1hbmFnZXIucGF0aC5yZXBsYWNlKC9eXFwvfFxcLyQvZywgJycpO1xyXG4gICAgICAgICAgICBEaXIucXVlcnkoe3BhdGg6ICRzY29wZS5tYW5hZ2VyLnBhdGggfHwgJy8nfSwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgIG9uRm9sZGVyQ2hhbmdlZChyLCAkc2NvcGUubWFuYWdlcik7XHJcbiAgICAgICAgICAgIH0sICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsbGJhY2sgZm9yIGZvbGRlciBkYXRhIGxvYWQgY29tcGxldGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgICAgICogQHBhcmFtIGZvbGRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ2hhbmdlZChyZXNwb25zZSwgZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IGNoYW5nZUZvbGRlciAtPiBvbkZvbGRlckNoYW5nZWQnLFxyXG4gICAgICAgICAgICAgICAge3Jlc3BvbnNlOiByZXNwb25zZSwgZm9sZGVyOiBmb2xkZXJ9KTtcclxuICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmQocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLml0ZW1zID0gcmVzcG9uc2UuaXRlbXMoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5tYW5hZ2VyLnBhdGggPSAnLycgKyAoZm9sZGVyLnBhdGggfHwgJycpO1xyXG4gICAgICAgICAgICAkY29va2llcy5wdXQoJ3BhdGgnLCAoZm9sZGVyLnBhdGggfHwgJycpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZUNyZWF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5jcmVhdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvY3VzKCcjY3JlYXRlLWRpci1pbnB1dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgICAgICAgICBpZiAoIV9fY2FuTG9hZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmZvbGRlci5uYW1lICYmICRzY29wZS5mb2xkZXIubmFtZSAhPT0gJycpXHJcbiAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLmNyZWF0ZSgkc2NvcGUubWFuYWdlci5wYXRoLCAkc2NvcGUuZm9sZGVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgb25Gb2xkZXJDcmVhdGVkLCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ3JlYXRlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBjcmVhdGUgLT4gb25Gb2xkZXJDcmVhdGVkJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5jcmVhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm5hbWUgPSAnJztcclxuICAgICAgICAgICAgdmFyIGZvbGRlciA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kSXRlbShmb2xkZXIsICRzY29wZS5mb2xkZXIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcy51bnNoaWZ0KGZvbGRlcik7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdmb2xkZXItY3JlYXRlZCcsIGZvbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCwgdG9wLCB3LCBPKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0ZvbGRlckl0ZW1Db250cm9sbGVyJywgRm9sZGVySXRlbUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEZvbGRlckl0ZW1Db250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ2ZvY3VzJywgJ0RpclNlcnZpY2UnLCAnRmlsZVNlcnZpY2UnLCAnU2V0dGluZ3MnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEZvbGRlckl0ZW1Db250cm9sbGVyKCRsb2csICRzY29wZSwgZm9jdXMsIERpclNlcnZpY2UsIEZpbGVTZXJ2aWNlLCBTZXR0aW5ncykge1xyXG4gICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciBjb250cm9sbGVyIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jbGljayA9IGNsaWNrO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FuUmVuYW1lID0gY2FuUmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuZW5hYmxlUmVuYW1lID0gZW5hYmxlUmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVJlbmFtZSA9IGRpc2FibGVSZW5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5yZW5hbWUgPSByZW5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3QgPSBzZWxlY3Q7XHJcbiAgICAgICAgICAgICRzY29wZS5oYXNUaHVtYnMgPSBoYXNUaHVtYnM7XHJcbiAgICAgICAgICAgICRzY29wZS50aHVtYk5hbWUgPSB0aHVtYk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZVsnZGVsZXRlJ10gPSBkZWxldGVJdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpdGVtIHR5cGUgYW5kIGRvZXMgYWN0aW9uIGZvciB0aGF0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xpY2soaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmZvbGRlci5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBhZGQgd2FybmluZyBhYm91dCBsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IGNsaWNrJywgJ1ByZXZpb3VzIGl0ZW0gc3RpbGwgbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gY2xpY2snLCB7aXRlbTogaXRlbX0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0RpcihpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2NoYW5nZS1mb2xkZXInLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZWN0KGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICEkc2NvcGUuaXNEaXJVcChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9uIHJlbmFtZSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZW5hYmxlUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5yZW5hbWUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzRGlyKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLm5ld05hbWUgPSBpdGVtLm5hbWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmV4dCA9IGl0ZW0ubmFtZS5zcGxpdCgnLicpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1dCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5leHQubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1dCA9IGl0ZW0uZXh0Lmxlbmd0aCArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5uZXdOYW1lID0gaXRlbS5uYW1lLnN1YnN0cmluZygwLCBpdGVtLm5hbWUubGVuZ3RoIC0gY3V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1cygnIycgKyBpdGVtLmlkICsgJyBpbnB1dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVuYW1lKCkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzRGlyKCRzY29wZS5pdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5pdGVtLm5hbWUgIT0gJy4uJylcclxuICAgICAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLnJlbmFtZSgkc2NvcGUubWFuYWdlci5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXRlbS5uYW1lLCAkc2NvcGUuaXRlbS5uZXdOYW1lLCBvbkZvbGRlclJlbmFtZWQsICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBGaWxlU2VydmljZS5yZW5hbWUoJHNjb3BlLm1hbmFnZXIucGF0aCxcclxuICAgICAgICAgICAgICAgICRzY29wZS5pdGVtLm5hbWUsIGdldEl0ZW1OZXdOYW1lKCRzY29wZS5pdGVtKSwgb25GaWxlUmVuYW1lZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRJdGVtTmV3TmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpdGVtLmV4dCkgJiYgaXRlbS5leHQubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubmV3TmFtZSArICcuJyArIGl0ZW0uZXh0O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5uZXdOYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGlzYWJsZVJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlclJlbmFtZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IG9uRm9sZGVyUmVuYW1lZCcsIHtyZXNwb25zZTogcmVzcG9uc2UsIGl0ZW06ICRzY29wZS5pdGVtfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHZhciBjb3B5ID0gYW5ndWxhci5jb3B5KCRzY29wZS5pdGVtKTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGNyZWF0ZSBpdGVtIGF1dG9tYXBwZXJcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucGF0aCA9IHJlc3BvbnNlLmRhdGEucGF0aDtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ubmFtZSA9IHJlc3BvbnNlLmRhdGEubmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0udXJsID0gcmVzcG9uc2UuZGF0YS51cmw7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZm9sZGVyLXJlbmFtZWQnLCB7J25ldyc6IHJlc3BvbnNlLmRhdGEsIG9sZDogY29weX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25GaWxlUmVuYW1lZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gb25GaWxlUmVuYW1lZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLm5hbWUgPSByZXNwb25zZS5kYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnVybCA9IHJlc3BvbnNlLmRhdGEudXJsO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXRlbS50aHVtYnMgPSByZXNwb25zZS5kYXRhLnRodW1icztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdChpdGVtLCB0aHVtYkluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlX3VybCA9IGl0ZW0udXJsO1xyXG4gICAgICAgICAgICBpZiAoISF0aHVtYkluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX3VybCA9IGl0ZW0udGh1bWJzW3RodW1iSW5kZXhdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBzZWxlY3QgZm9yIHRpbnlNQ0VcclxuICAgICAgICAgICAgaWYgKFNldHRpbmdzLmlzVGFyZ2V0KCd0aW55TUNFJykpIHtcclxuICAgICAgICAgICAgICAgICRsb2cuaW5mbygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gc2VsZWN0IC0+IHRpbnltY2UnLCB7dGlueW1jZTogdG9wLnRpbnltY2V9KTtcclxuICAgICAgICAgICAgICAgIGlmICh0b3AudGlueW1jZS5tYWpvclZlcnNpb24gPCA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wLnRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIucGFyYW1zLnNldFVybChmaWxlX3VybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvcl9pZCA9IHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLnBhcmFtcy5tY2Vfd2luZG93X2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmNsb3NlKGVkaXRvcl9pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLmluZm8oJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IHNlbGVjdCAtPiB0aW55bWNlNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtwYXJhbXM6IHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmdldFBhcmFtcygpfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wLnRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIuZ2V0UGFyYW1zKCkuc2V0VXJsKGZpbGVfdXJsKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3AudGlueW1jZS5hY3RpdmVFZGl0b3Iud2luZG93TWFuYWdlci5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3MuaXNUYXJnZXQoJ2NhbGxiYWNrJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlbWFuYWdlciA9IHcuZmlsZW1hbmFnZXIgfHwgdy5wYXJlbnQuZmlsZW1hbmFnZXIgfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZmlsZW1hbmFnZXIgJiYgZmlsZW1hbmFnZXIub25TZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVtYW5hZ2VyLm9uU2VsZWN0ZWQoZmlsZV91cmwsIFNldHRpbmdzLmdldFBhcmFtcygpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlSXRlbShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaXNEaXIoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLm5hbWUgIT0gJy4uJylcclxuICAgICAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUubWFuYWdlci5wYXRoLCBpdGVtLm5hbWUsIG9uRm9sZGVyRGVsZXRlZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRmlsZVNlcnZpY2UuZGVsZXRlKCRzY29wZS5tYW5hZ2VyLnBhdGgsIGl0ZW0ubmFtZSwgb25GaWxlRGVsZXRlZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckRlbGV0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IG9uRm9sZGVyRGVsZXRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZvbGRlci1kZWxldGVkJywgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZpbGVEZWxldGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBvbkZpbGVEZWxldGVkJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZmlsZS1kZWxldGVkJywgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYXNUaHVtYnMoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFpdGVtICYmIGFuZ3VsYXIuaXNEZWZpbmVkKGl0ZW0udGh1bWJzKSAmJiBPLmtleXMoaXRlbS50aHVtYnMpLmxlbmd0aCA+IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB0aHVtYk5hbWUodGh1bWJJbmRleCwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgICAgICBpZiAodGh1bWJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSBTZXR0aW5ncy5nZXRUaHVtYlNpemUodGh1bWJJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHNpemVbMF07XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXplWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9ICcoe3dpZHRofSB4IHtoZWlnaHR9KScsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUuc3VwcGxhbnQocGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSwgdG9wLCB3aW5kb3csIE9iamVjdCk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1RyZWVDb250cm9sbGVyJywgVHJlZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIFRyZWVDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ0RpcicsICdEaXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUcmVlQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsIERpciwgRGlyU2VydmljZSkge1xyXG4gICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciBjb250cm9sbGVyIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc09wZW4gPSBpc09wZW47XHJcbiAgICAgICAgICAgICRzY29wZS5pc0VtcHR5ID0gaXNFbXB0eTtcclxuICAgICAgICAgICAgJHNjb3BlLmNoYW5nZUZvbGRlciA9IGNoYW5nZUZvbGRlcjtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS50cmVlID0ge1xyXG4gICAgICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgIHJvb3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnLycsIC8vIFRPRE86IGdldCB0cmFuc2xhdGlvbiBmb3IgdGhpcyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUuYmFzZVVybCArICdkaXInXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhwYW5kOiBleHBhbmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGFkZCB0cmVlIHJlZnJlc2hcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignX2Vycm9yJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgICRzY29wZS4kb24oJ193YXJuaW5nJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JIYW5kbGVkKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3RyZWUtY2hhbmdlZCcsIHRyZWVDaGFuZ2VkKTtcclxuICAgICAgICBmdW5jdGlvbiB0cmVlQ2hhbmdlZChldmVudCwgdHJlZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gdHJlZUNoYW5nZWQnLCB7ZXZlbnQ6IGV2ZW50LCB0cmVlOiB0cmVlfSk7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zID0gdHJlZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyZWUubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWNyZWF0ZWQnLCBvbkZvbGRlckNyZWF0ZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ3JlYXRlZChldmVudCwgZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciAtPiBvbkZvbGRlckNyZWF0ZWQnLCB7ZXZlbnQ6IGV2ZW50LCBmb2xkZXI6IGZvbGRlcn0pO1xyXG4gICAgICAgICAgICBpZiAoZm9sZGVyLnBhdGguaW5kZXhPZignLycpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlZCBmb2xkZXIgaXMgaW4gcm9vdCwgc28gd2VlIG5lZWQgYWRkIGl0IHRvIHRyZWUgbWVudVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXMudW5zaGlmdChmb2xkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdmb2xkZXItcmVuYW1lZCcsIG9uRm9sZGVyUmVuYW1lZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25Gb2xkZXJSZW5hbWVkKGV2ZW50LCBmb2xkZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBvbGRGb2xkZXIgPSBmb2xkZXJzLm9sZCxcclxuICAgICAgICAgICAgICAgIG5ld0ZvbGRlciA9IGZvbGRlcnMubmV3O1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gb25Gb2xkZXJSZW5hbWVkJywge2V2ZW50OiBldmVudCwgbmV3Rm9sZGVyOiBuZXdGb2xkZXIsIG9sZEZvbGRlcjogb2xkRm9sZGVyfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiByZWN1cnNpdmVseSBjaGVjayBhbGwgY2hpbGQgZm9sZGVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS50cmVlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnRyZWUuaXRlbXNbaV0ucGF0aCA9PSBvbGRGb2xkZXIucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGNyZWF0ZSBpdGVtIGF1dG9tYXBwZXJcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJlZS5pdGVtc1tpXS5wYXRoID0gbmV3Rm9sZGVyLnBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXNbaV0ubmFtZSA9IG5ld0ZvbGRlci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zW2ldLnVybCA9IG5ld0ZvbGRlci51cmw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2ZvbGRlci1kZWxldGVkJywgcmVtb3ZlQnlQYXRoKTtcclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVCeVBhdGgoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ1RyZWVDb250cm9sbGVyIC0+IHJlbW92ZUJ5UGF0aCcsIHtldmVudDogZXZlbnQsIGl0ZW06IGl0ZW0sIGl0ZW1zOiAkc2NvcGUudHJlZS5pdGVtc30pO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgY2hlY2sgYWxsIGNoaWxkIGZvbGRlcnNcclxuICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXMucmVtb3ZlSXRlbShpdGVtLnBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyBmb2xkZXIgb3BlbiBmb3IgdHJlZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGZvbGRlclxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzT3Blbihmb2xkZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZvbGRlciAmJiBhbmd1bGFyLmlzRGVmaW5lZChmb2xkZXIuZm9sZGVycyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyBmb2xkZXIgaGFzIGFueSBvdGhlciBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBmb2xkZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0VtcHR5KGZvbGRlcikge1xyXG4gICAgICAgICAgICBpZiAoaXNPcGVuKGZvbGRlcikpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVyLmZvbGRlcnMubGVuZ3RoID09IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZChjdXJyRm9sZGVyKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgdHJlZSBzdGlsbCBsb2FkaW5nIG9yIGRvbmB0IGhhdmUgc3ViIGZvbGRlcnNcclxuICAgICAgICAgICAgaWYgKCRzY29wZS50cmVlLmxvYWRpbmcgfHwgaXNFbXB0eShjdXJyRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKCdUcmVlQ29udHJvbGxlciAtPiBleHBhbmQnLCAnUHJldmlvdXMgaXRlbSBzdGlsbCBsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciAtPiBleHBhbmQnLCB7Y3VycjogY3VyckZvbGRlcn0pO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGFsbCBzdWIgZm9sZGVycyBpZiBpdCBpcyBhbHJlYWR5IG9wZW5lZFxyXG4gICAgICAgICAgICBpZiAoaXNPcGVuKGN1cnJGb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyRm9sZGVyLmZvbGRlcnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBEaXIucXVlcnkoe3BhdGg6IGN1cnJGb2xkZXIucGF0aH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmQocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY3VyckZvbGRlci5mb2xkZXJzID0gcmVzcG9uc2UuZGlycygpO1xyXG4gICAgICAgICAgICB9LCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoYW5nZUZvbGRlcihmb2xkZXIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2NoYW5nZS1mb2xkZXInLCBmb2xkZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnZmlsZS5tYW5hZ2VyJylcclxuICAgICAgICAuY29udHJvbGxlcignVXBsb2FkQ29udHJvbGxlcicsIFVwbG9hZENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFVwbG9hZENvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnRmlsZVVwbG9hZGVyJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBVcGxvYWRDb250cm9sbGVyKCRsb2csICRzY29wZSwgRmlsZVVwbG9hZGVyKSB7XHJcbiAgICAgICAgJGxvZy5sb2coJ1VwbG9hZENvbnRyb2xsZXIgY29udHJvbGxlciA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkZXIgPSBuZXcgRmlsZVVwbG9hZGVyKHtcclxuICAgICAgICAgICAgICAgIHVybDogX2dldFVwbG9hZFBhdGhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0VXBsb2FkUGF0aCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5iYXNlVXJsKCkgKyAnZmlsZS91cGxvYWQnICsgJHNjb3BlLm1hbmFnZXIucGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbldoZW5BZGRpbmdGaWxlRmFpbGVkID0gZnVuY3Rpb24gKGl0ZW0gLyp7RmlsZXxGaWxlTGlrZU9iamVjdH0qLywgZmlsdGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnb25XaGVuQWRkaW5nRmlsZUZhaWxlZCcsIGl0ZW0sIGZpbHRlciwgb3B0aW9ucyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyLm9uQWZ0ZXJBZGRpbmdGaWxlID0gZnVuY3Rpb24gKGZpbGVJdGVtKSB7XHJcbiAgICAgICAgICAgIC8vIGZpeCB1cmwgdG8gdXBsb2FkIGFzIHdlIGNhbiBjaGFuZ2UgaXQgYXQgYW55IG1vbWVudFxyXG4gICAgICAgICAgICBmaWxlSXRlbS51cGxvYWRlci51cmwgPSBmaWxlSXRlbS51cmwgPSBfZ2V0VXBsb2FkUGF0aCgpO1xyXG4gICAgICAgICAgICAkbG9nLmluZm8oJ29uQWZ0ZXJBZGRpbmdGaWxlJywgZmlsZUl0ZW0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbkVycm9ySXRlbSA9IGZ1bmN0aW9uIChmaWxlSXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycykge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZXJyb3IgaGFuZGxpbmdcclxuICAgICAgICAgICAgJGxvZy5pbmZvKCdvbkVycm9ySXRlbScsIGZpbGVJdGVtLCAvKnJlc3BvbnNlLCovIHN0YXR1cywgaGVhZGVycyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyLm9uQ29tcGxldGVJdGVtID0gZnVuY3Rpb24gKGZpbGVJdGVtLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy5pbmZvKCdVcGxvYWRDb250cm9sbGVyIC0+IHVwbG9hZGVyIC0+IG9uQ29tcGxldGVJdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICB7ZmlsZUl0ZW06IGZpbGVJdGVtLCByZXNwb25zZTogcmVzcG9uc2UsIHN0YXR1czogc3RhdHVzLCBoZWFkZXJzOiBoZWFkZXJzfSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZmlsZS11cGxvYWRlZCcsIHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudXBsb2FkZXIub25Db21wbGV0ZUFsbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGxvZy5pbmZvKCdVcGxvYWRDb250cm9sbGVyIC0+IHVwbG9hZGVyIC0+IG9uQ29tcGxldGVBbGwnLCB7dXBsb2FkZXI6ICRzY29wZS51cGxvYWRlcn0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGhhc05vdFVwbG9hZGVkRmlsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS51cGxvYWRlci5xdWV1ZSwgZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlsZS5pc1JlYWR5ICYmICFmaWxlLmlzVXBsb2FkaW5nICYmICFmaWxlLmlzU3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc05vdFVwbG9hZGVkRmlsZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaGFzTm90VXBsb2FkZWRGaWxlcykge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgbGlzIGZyb20gaXRlbXMgYW5kIGhpZGUgaXRcclxuICAgICAgICAgICAgICAgICRzY29wZS51cGxvYWRlci5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZU1cclxuICAgICAgICAuc2VydmljZSgnRGlyU2VydmljZScsIERpclNlcnZpY2UpO1xyXG5cclxuICAgIERpclNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcm9vdFNjb3BlJywgJyRodHRwJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBEaXJTZXJ2aWNlKCRsb2csICRyb290U2NvcGUsICRodHRwKSB7XHJcbiAgICAgICAgLy8kbG9nLmxvZygnRGlyU2VydmljZSBzZXJ2aWNlIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2V4dGVuZCc6IGV4dGVuZCxcclxuICAgICAgICAgICAgJ2V4dGVuZEl0ZW0nOiBleHRlbmRJdGVtLFxyXG4gICAgICAgICAgICAncmVuYW1lJzogcmVuYW1lLFxyXG4gICAgICAgICAgICAnY3JlYXRlJzogY3JlYXRlLFxyXG4gICAgICAgICAgICAnZGVsZXRlJzogZGVsZXRlRGlyLFxyXG4gICAgICAgICAgICAnaWRHZW4nOiBpZEdlblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4dGVuZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChkYXRhLkRpclNlcnZpY2VFeHRlbmRlZCkgJiYgZGF0YS5EaXJTZXJ2aWNlRXh0ZW5kZWQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChkYXRhLCB7XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIFVzZWQgZm9yIGZpbGUgdHJlZSB3aGVyZSBmb2xkZXIgdXAgaXMgbm90IHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkaXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvbGRlcnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLm1pbWUgPT09ICdkaXInICYmIHZhbHVlLmZ1bGxfbmFtZSAhPSAnLi4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRJdGVtKHZhbHVlLCBrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZvbGRlcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVycztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEFwcGVuZCBlYWNoIGl0ZW0gd2l0aCByZXF1aXJlZCBkYXRhXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpdGVtczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRJdGVtKHZhbHVlLCBrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGl0ZW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGRhdGEuRGlyU2VydmljZUV4dGVuZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbmFtZXMgcGF0aCBsYXN0IHBhcnQgbnRvIG5ldyBuYW1lXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZGlyIFwicGF0aCB0byByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbGROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIG5ld05hbWUgXCJuZXcgbmFtZSBmb3IgcGF0aCBsYXN0IGVsZW1lbnRcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvblN1Y2Nlc3MgXCJjYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbkVycm9yIFwiY2FsbGJhY2sgZm9yIGVycm9yXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5hbWUoZGlyLCBvbGROYW1lLCBuZXdOYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2Rpci9yZW5hbWUvJyArIGRpcjtcclxuICAgICAgICAgICAgJGh0dHAucG9zdCh1cmwsIHtcclxuICAgICAgICAgICAgICAgICdvbGQnOiBvbGROYW1lLFxyXG4gICAgICAgICAgICAgICAgJ25ldyc6IG5ld05hbWVcclxuICAgICAgICAgICAgfSkudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlIG5ldyBkaXJlY3RvcnlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSBvblN1Y2Nlc3NcclxuICAgICAgICAgKiBAcGFyYW0gb25FcnJvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZShkaXIsIG5hbWUsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gJHJvb3RTY29wZS5iYXNlVXJsKCkgKyAnZGlyL2NyZWF0ZS8nICsgZGlyO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBleGlzdGluZyBkaXJlY3RvcnlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSBvblN1Y2Nlc3NcclxuICAgICAgICAgKiBAcGFyYW0gb25FcnJvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZURpcihkaXIsIG5hbWUsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gJHJvb3RTY29wZS5iYXNlVXJsKCkgKyAnZGlyL2RlbGV0ZS8nICsgZGlyO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlIHVuaXF1ZSBpdGVtIGlkIHByb3BlcnR5XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ga2V5IGFycmF5IGtleVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGl0ZW0gaWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpZEdlbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdsaXN0LWl0ZW0tJyArIGtleTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZCBpZCBwYXJhbWV0ZXIgdG8gaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kSXRlbShpdGVtLCBrZXkpIHtcclxuICAgICAgICAgICAgaXRlbS5pZCA9IGlkR2VuKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZU1cclxuICAgICAgICAuc2VydmljZSgnRmlsZVNlcnZpY2UnLCBGaWxlU2VydmljZSk7XHJcblxyXG4gICAgRmlsZVNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcm9vdFNjb3BlJywgJyRodHRwJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGaWxlU2VydmljZSgkbG9nLCAkcm9vdFNjb3BlLCAkaHR0cCkge1xyXG4gICAgICAgIC8vJGxvZy5sb2coJ0ZpbGVTZXJ2aWNlIHNlcnZpY2UgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZW5hbWU6IHJlbmFtZSxcclxuICAgICAgICAgICAgJ2RlbGV0ZSc6IGRlbGV0ZUZpbGVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW5hbWUgZmlsZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGRpclxyXG4gICAgICAgICAqIEBwYXJhbSBvbGROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIG5ld05hbWVcclxuICAgICAgICAgKiBAcGFyYW0gb25TdWNjZXNzXHJcbiAgICAgICAgICogQHBhcmFtIG9uRXJyb3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5hbWUoZGlyLCBvbGROYW1lLCBuZXdOYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZpbGVTZXJ2aWNlIC0+IHJlbmFtZScsIHtkaXI6IGRpciwgb2xkTmFtZTogb2xkTmFtZSwgbmV3TmFtZTogbmV3TmFtZX0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2ZpbGUvcmVuYW1lLycgKyBkaXI7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QodXJsLCB7XHJcbiAgICAgICAgICAgICAgICAnb2xkJzogb2xkTmFtZSxcclxuICAgICAgICAgICAgICAgICduZXcnOiBuZXdOYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBmaWxlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZGlyXHJcbiAgICAgICAgICogQHBhcmFtIG5hbWVcclxuICAgICAgICAgKiBAcGFyYW0gb25TdWNjZXNzXHJcbiAgICAgICAgICogQHBhcmFtIG9uRXJyb3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVGaWxlKGRpciwgbmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGaWxlU2VydmljZSAtPiBkZWxldGUnLCB7ZGlyOiBkaXIsIG5hbWU6IG5hbWV9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkcm9vdFNjb3BlLmJhc2VVcmwoKSArICdmaWxlL2RlbGV0ZS8nICsgZGlyO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgJCwgY3JpcCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGNyaXAuZmlsZU1cbiAgICAgICAgLnNlcnZpY2UoJ1NldHRpbmdzJywgU2V0dGluZ3MpO1xuXG4gICAgZnVuY3Rpb24gU2V0dGluZ3MoKSB7XG4gICAgICAgIHZhciAkc2V0dGluZ3MgPSAkKCcjc2V0dGluZ3MnKSwgcGFyYW1zID0gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzVGFyZ2V0OiBpc1RhcmdldCxcbiAgICAgICAgICAgIGdldFR5cGU6IGdldFR5cGUsXG4gICAgICAgICAgICBnZXRUaHVtYlNpemU6IGdldFRodW1iU2l6ZSxcbiAgICAgICAgICAgIGdldFBhcmFtczogZ2V0UGFyYW1zXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gaXNUYXJnZXQoY3Vycl90YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRQYXJhbXMoKS50YXJnZXQudG9Mb3dlckNhc2UoKSA9PT0gY3Vycl90YXJnZXQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFR5cGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGdldFBhcmFtcygpLnR5cGUgPyBwYXJhbXMudHlwZS50b0xvd2VyQ2FzZSgpIDogZmFsc2UpIHx8ICdmaWxlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFRodW1iU2l6ZShzaXplS2V5KSB7XG4gICAgICAgICAgICB2YXIgc2l6ZXMgPSBuZy5mcm9tSnNvbigkc2V0dGluZ3MuZGF0YSgnc2l6ZXMnKS5yZXBsYWNlKC9cXCcvZywgJ1wiJykpO1xuXG4gICAgICAgICAgICByZXR1cm4gc2l6ZXNbc2l6ZUtleV07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRQYXJhbXMoKSB7XG4gICAgICAgICAgICBpZiAoIXBhcmFtcykge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhUGFyYW1zID0gJHNldHRpbmdzLmRhdGEoJ3BhcmFtcycpO1xuICAgICAgICAgICAgICAgIC8vIGlmIHBhcmFtcyBpcyBlbXB0eSBhcnJheSwgaXQgYWxyZWFkeSBjb252ZXJ0ZWQgdG8gZW1wdHkgYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVBhcmFtcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcblxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHN0ckZyb21Kc29uKGRhdGFQYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpeFNlcmlhbGl6YWJsZVN0cihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXCcvZywgJ1wiJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RyRnJvbUpzb24oc3RyKSB7XG4gICAgICAgIHJldHVybiBuZy5mcm9tSnNvbihmaXhTZXJpYWxpemFibGVTdHIoc3RyKSk7XG4gICAgfVxufSkoYW5ndWxhciwgalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZU1cclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcmVzb3VyY2UnLCAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyKCRsb2csICRyZXNvdXJjZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIC8vJGxvZy5sb2coJ0RpciByZXNvdXJjZSA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoJHJvb3RTY29wZS5iYXNlVXJsKCkgKyAnZGlyLzpkaXIvOm5hbWUnLCB7XHJcbiAgICAgICAgICAgIGRpcjogJ0BkaXInLFxyXG4gICAgICAgICAgICBuYW1lOiAnQG5hbWUnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
