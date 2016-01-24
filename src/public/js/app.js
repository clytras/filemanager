(function (angular, $) {
    'use strict';

    angular.module('script.core', []);
})(angular, jQuery);
(function(ng){
    'use strict';

    ng.module('file.manager', [
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
        'script.core',
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
        .module('script.core')
        .directive('cEnter', cEnter);

    function cEnter() {
        return function (scope, elem, attr) {
            elem.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attr.cEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .directive('cFocus', cFocus);

    function cFocus(focus) {
        return function (scope, elem, attr) {
            elem.on(attr.cFocus, function () {
                focus(attr.cFocusSelector);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                elem.off(attr.cFocus);
            });
        }
    }
})(angular, jQuery);
(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .factory('focus', focus);

    focus.$inject = [
        '$log', '$timeout'
    ];

    function focus($log, $timeout) {
        return function(selector) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function() {
                var $element = $(selector);
                if($element.length === 1)
                    $element.focus();
            });
        };
    }
})(angular, jQuery);
if (!removeFromArr) {
    function removeFromArr(arr, val, key) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (typeof key === "undefined") {
                if (arr[i] == val)
                    arr.splice(i, 1);
            }
            else if (arr[i][key] == val)
                arr.splice(i, 1);
        }
    }
}

if (!isDefined) {
    function isDefined() {
        var a = arguments;

        if (a.length === 0 || typeof a[0] === 'undefined')
            return false;

        var target = a[0];
        for (var arg in a) {
            if (arg === '0')
                continue;

            if (!target.hasOwnProperty(a[arg]))
                return false;

            target = target[a[arg]];
            if (typeof target === 'undefined')
                return false;
        }

        return true;
    }
}

(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .directive('cThumb', cThumb);

    cThumb.$inject = [
        '$window'
    ];

    function cThumb($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function (scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.cThumb);

                if (!helper.isFile(params.file) || !helper.isImage(params.file)) {
                    element.hide();
                    return;
                }

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({width: width, height: height});
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
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
            removeFromArr($scope.folder.items, item.path, 'path');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvbW9kdWxlLmpzIiwiZmlsZW1hbmFnZXIvbW9kdWxlLmpzIiwiYXBwLmpzIiwiZmlsZW1hbmFnZXIvcnVuLmpzIiwiY29yZS9lbnRlci9kaXJlY3RpdmUuanMiLCJjb3JlL2ZvY3VzL2RpcmVjdGl2ZS5qcyIsImNvcmUvZm9jdXMvZmFjdG9yeS5qcyIsImNvcmUvaGVscGVycy9hcnJheS5qcyIsImNvcmUvdGh1bWIvZGlyZWN0aXZlLmpzIiwiZmlsZW1hbmFnZXIvY29udHJvbGxlcnMvQmFzZUNvbnRyb2xsZXIuanMiLCJmaWxlbWFuYWdlci9jb250cm9sbGVycy9Gb2xkZXJDb250cm9sbGVyLmpzIiwiZmlsZW1hbmFnZXIvY29udHJvbGxlcnMvRm9sZGVySXRlbUNvbnRyb2xsZXIuanMiLCJmaWxlbWFuYWdlci9jb250cm9sbGVycy9UcmVlQ29udHJvbGxlci5qcyIsImZpbGVtYW5hZ2VyL2NvbnRyb2xsZXJzL1VwbG9hZENvbnRyb2xsZXIuanMiLCJmaWxlbWFuYWdlci9yZXNvdXJjZXMvRGlyLmpzIiwiZmlsZW1hbmFnZXIvc2VydmljZXMvRGlyU2VydmljZS5qcyIsImZpbGVtYW5hZ2VyL3NlcnZpY2VzL0ZpbGVTZXJ2aWNlLmpzIiwiZmlsZW1hbmFnZXIvc2VydmljZXMvU2V0dGluZ3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdzY3JpcHQuY29yZScsIFtdKTtcclxufSkoYW5ndWxhciwgalF1ZXJ5KTsiLCIoZnVuY3Rpb24obmcpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIG5nLm1vZHVsZSgnZmlsZS5tYW5hZ2VyJywgW1xuICAgICAgICAnYW5ndWxhci1sb2FkaW5nLWJhcicsXG4gICAgICAgICdhbmd1bGFyRmlsZVVwbG9hZCcsXG4gICAgICAgICduZ0Nvb2tpZXMnLFxuICAgICAgICAnbmdSZXNvdXJjZScsXG4gICAgICAgICduZ1Nhbml0aXplJyxcbiAgICAgICAgJ3VpLmJvb3RzdHJhcCcsXG4gICAgICAgICd1aS1ub3RpZmljYXRpb24nLFxuICAgICAgICAnaW8uZGVubmlzLmNvbnRleHRtZW51J1xuICAgIF0pO1xuXG59KShhbmd1bGFyKTsiLCIvLyBoZWxsbyBmcm9tIGpzXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcclxuICAgICAgICAnc2NyaXB0LmNvcmUnLFxyXG4gICAgICAgICdmaWxlLm1hbmFnZXInXHJcbiAgICBdKTtcclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLnJ1bihSdW4pO1xyXG4gICAgUnVuLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJ1bigkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdmFyICRzZXR0aW5ncyA9ICQoJyNzZXR0aW5ncycpO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLmZpcmVCcm9hZGNhc3QgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChldmVudE5hbWUsIGFyZ3MpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuYmFzZVVybCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzZXR0aW5ncy5kYXRhKCdiYXNlLXVybCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3NjcmlwdC5jb3JlJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdjRW50ZXInLCBjRW50ZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNFbnRlcigpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGVsZW0uYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoYXR0ci5jRW50ZXIsIHsnZXZlbnQnOiBldmVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdzY3JpcHQuY29yZScpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnY0ZvY3VzJywgY0ZvY3VzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjRm9jdXMoZm9jdXMpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oYXR0ci5jRm9jdXMsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGZvY3VzKGF0dHIuY0ZvY3VzU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZXMgYm91bmQgZXZlbnRzIGluIHRoZSBlbGVtZW50IGl0c2VsZlxyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBzY29wZSBpcyBkZXN0cm95ZWRcclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0ub2ZmKGF0dHIuY0ZvY3VzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdzY3JpcHQuY29yZScpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2ZvY3VzJywgZm9jdXMpO1xyXG5cclxuICAgIGZvY3VzLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHRpbWVvdXQnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZvY3VzKCRsb2csICR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIC8vIHRpbWVvdXQgbWFrZXMgc3VyZSB0aGF0IGl0IGlzIGludm9rZWQgYWZ0ZXIgYW55IG90aGVyIGV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgLy8gZS5nLiBjbGljayBldmVudHMgdGhhdCBuZWVkIHRvIHJ1biBiZWZvcmUgdGhlIGZvY3VzIG9yXHJcbiAgICAgICAgICAgIC8vIGlucHV0cyBlbGVtZW50cyB0aGF0IGFyZSBpbiBhIGRpc2FibGVkIHN0YXRlIGJ1dCBhcmUgZW5hYmxlZCB3aGVuIHRob3NlIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBhcmUgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYoJGVsZW1lbnQubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiaWYgKCFyZW1vdmVGcm9tQXJyKSB7XHJcbiAgICBmdW5jdGlvbiByZW1vdmVGcm9tQXJyKGFyciwgdmFsLCBrZXkpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gYXJyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJyW2ldID09IHZhbClcclxuICAgICAgICAgICAgICAgICAgICBhcnIuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGFycltpXVtrZXldID09IHZhbClcclxuICAgICAgICAgICAgICAgIGFyci5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5pZiAoIWlzRGVmaW5lZCkge1xyXG4gICAgZnVuY3Rpb24gaXNEZWZpbmVkKCkge1xyXG4gICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiAoYS5sZW5ndGggPT09IDAgfHwgdHlwZW9mIGFbMF0gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBhWzBdO1xyXG4gICAgICAgIGZvciAodmFyIGFyZyBpbiBhKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmcgPT09ICcwJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0YXJnZXQuaGFzT3duUHJvcGVydHkoYVthcmddKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldFthW2FyZ11dO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4iLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnc2NyaXB0LmNvcmUnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NUaHVtYicsIGNUaHVtYik7XHJcblxyXG4gICAgY1RodW1iLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyR3aW5kb3cnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNUaHVtYigkd2luZG93KSB7XHJcbiAgICAgICAgdmFyIGhlbHBlciA9IHtcclxuICAgICAgICAgICAgc3VwcG9ydDogISEoJHdpbmRvdy5GaWxlUmVhZGVyICYmICR3aW5kb3cuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSxcclxuICAgICAgICAgICAgaXNGaWxlOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuaXNPYmplY3QoaXRlbSkgJiYgaXRlbSBpbnN0YW5jZW9mICR3aW5kb3cuRmlsZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXNJbWFnZTogZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gJ3wnICsgZmlsZS50eXBlLnNsaWNlKGZpbGUudHlwZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyAnfCc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3xqcGd8cG5nfGpwZWd8Ym1wfGdpZnwnLmluZGV4T2YodHlwZSkgIT09IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8Y2FudmFzLz4nLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICghaGVscGVyLnN1cHBvcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gc2NvcGUuJGV2YWwoYXR0cmlidXRlcy5jVGh1bWIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghaGVscGVyLmlzRmlsZShwYXJhbXMuZmlsZSkgfHwgIWhlbHBlci5pc0ltYWdlKHBhcmFtcy5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2FudmFzID0gZWxlbWVudC5maW5kKCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBvbkxvYWRGaWxlO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocGFyYW1zLmZpbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEZpbGUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IG9uTG9hZEltYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIGltZy5zcmMgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTG9hZEltYWdlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHBhcmFtcy53aWR0aCB8fCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQgKiBwYXJhbXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJhbXMuaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCAqIHBhcmFtcy53aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBjYW52YXMuYXR0cih7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0Jhc2VDb250cm9sbGVyJywgQmFzZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJhc2VDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyRjb29raWVzJywgJ05vdGlmaWNhdGlvbicsICdEaXJTZXJ2aWNlJywgJ0RpcidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQmFzZUNvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCAkY29va2llcywgTm90aWZpY2F0aW9uLCBEaXJTZXJ2aWNlLCBEaXIpIHtcclxuICAgICAgICAkbG9nLmxvZygnQmFzZUNvbnRyb2xsZXIgY29udHJvbGxlciA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNEaXIgPSBpc0RpcjtcclxuICAgICAgICAgICAgJHNjb3BlLmlzRGlyVXAgPSBpc0RpclVwO1xyXG5cclxuICAgICAgICAgICAgLy8gb25seSBmb3Igc3ViY29udHJvbGxlciB1c2FnZVxyXG4gICAgICAgICAgICAkc2NvcGUuX2Vycm9yID0gX2Vycm9yO1xyXG4gICAgICAgICAgICAkc2NvcGUuX3dhcm5pbmcgPSBfd2FybmluZztcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzID0gX3N1Y2Nlc3M7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWFuYWdlciA9IHtcclxuICAgICAgICAgICAgICAgIHBhdGg6ICcvJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogYWRkIGNhY2hpbmcgYW5kIGxvYWQgbGFzdCBvcGVuZWQgZGlyIGZvciAkc2NvcGUuZm9sZGVyLml0ZW1zXHJcbiAgICAgICAgICAgIERpci5xdWVyeShvbkluaXRpYWxEaXJMb2FkZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgcGFzc2VkIGl0ZW0gaXMgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfGJvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNEaXIoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbSAmJiBhbmd1bGFyLmlzRGVmaW5lZChpdGVtLnR5cGUpICYmIGl0ZW0udHlwZSA9PT0gJ2Rpcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyBwYXNzZWQgaXRlbSBpcyBkaXIgdG8gZ28gdXBcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfGJvb2xlYW58Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpclVwKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGlyKGl0ZW0pICYmIGl0ZW0ubmFtZSA9PSAnLi4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX19yZXNvbHZlTWVzc2FnZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQocmVzcG9uc2Uubm90aWZpY2F0aW9uKSlcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IHJlc3BvbnNlLm5vdGlmaWNhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChyZXNwb25zZS5kYXRhKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChyZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbikpXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSByZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge2hhc01lc3NhZ2U6IHRydWUsIG1lc3NhZ2U6IG5vdGlmaWNhdGlvbn07XHJcblxyXG4gICAgICAgICAgICAkbG9nLmVycm9yKCdDYW50IGdldCB1c2VyIGZyaWVuZGx5IG1lc3NhZ2UgZnJvbSByZXNwb25zZScsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHtoYXNNZXNzYWdlOiBmYWxzZX07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZXJyb3IocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ19lcnJvcicpO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9fcmVzb2x2ZU1lc3NhZ2UocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5oYXNNZXNzYWdlKVxyXG4gICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHttZXNzYWdlOiBoYW5kbGVyLm1lc3NhZ2V9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF93YXJuaW5nKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdfd2FybmluZycpO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9fcmVzb2x2ZU1lc3NhZ2UocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5oYXNNZXNzYWdlKVxyXG4gICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHttZXNzYWdlOiBoYW5kbGVyLm1lc3NhZ2V9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zdWNjZXNzKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX19yZXNvbHZlTWVzc2FnZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLmhhc01lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgICBOb3RpZmljYXRpb24uc3VjY2Vzcyh7bWVzc2FnZTogaGFuZGxlci5tZXNzYWdlfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbml0aWFsIGRpciBsb2FkIGZvciBmb2xkZXIgYW5kIHRyZWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSByZXNwb25zZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uSW5pdGlhbERpckxvYWRlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnQmFzZUNvbnRyb2xsZXIgLT4gb25Jbml0aWFsRGlyTG9hZGVkJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG5cclxuICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmQocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ3RyZWUtY2hhbmdlZCcsIHJlc3BvbnNlLmRpcnMoKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdmb2xkZXItY2hhbmdlZCcsIHJlc3BvbnNlLml0ZW1zKCkpO1xyXG5cclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNhY2hlJywge3BhdGg6ICRjb29raWVzLmdldCgncGF0aCcpfSk7XHJcbiAgICAgICAgICAgIGlmICghKCRjb29raWVzLmdldCgncGF0aCcpID09PSAnLycgfHwgdHlwZW9mICRjb29raWVzLmdldCgncGF0aCcpID09PSAndW5kZWZpbmVkJykpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdjaGFuZ2UtZm9sZGVyJywge3BhdGg6ICRjb29raWVzLmdldCgncGF0aCcpfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0ZvbGRlckNvbnRyb2xsZXInLCBGb2xkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBGb2xkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyRjb29raWVzJywgJ2ZvY3VzJywgJ0RpcicsICdEaXJTZXJ2aWNlJywgJ1NldHRpbmdzJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGb2xkZXJDb250cm9sbGVyKCRsb2csICRzY29wZSwgJGNvb2tpZXMsIGZvY3VzLCBEaXIsIERpclNlcnZpY2UsIFNldHRpbmdzKSB7XHJcbiAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgY29udHJvbGxlciA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyID0ge1xyXG4gICAgICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNyZWF0aW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsdGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmM6IG9yZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZTogY2hhbmdlT3JkZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgYnk6ICduYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICByZXZlcnNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlQ3JlYXRlOiBlbmFibGVDcmVhdGUsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgICAgICAgICAgICAgIHJlZnJlc2g6IHJlZnJlc2gsXHJcbiAgICAgICAgICAgICAgICBpc0ZpbHRlcnNFbmFibGVkOiBpc0ZpbHRlcnNFbmFibGVkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXJGaWx0ZXIgPSBmb2xkZXJGaWx0ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfX2NhbkxvYWQoKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgZm9sZGVyIHN0aWxsIGxvYWRpbmdcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5mb2xkZXIubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKCdGb2xkZXJDb250cm9sbGVyIC0+IGxvYWRpbmcnLCAnUHJldmlvdXMgaXRlbSBzdGlsbCBsb2FkaW5nJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdfZXJyb3InLCBvbkVycm9ySGFuZGxlZCk7XHJcbiAgICAgICAgJHNjb3BlLiRvbignX3dhcm5pbmcnLCBvbkVycm9ySGFuZGxlZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25FcnJvckhhbmRsZWQoZXZlbnQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdjaGFuZ2UtZm9sZGVyJywgY2hhbmdlRm9sZGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VGb2xkZXIoZXZlbnQsIGZvbGRlcikge1xyXG4gICAgICAgICAgICBpZiAoIV9fY2FuTG9hZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gY2hhbmdlRm9sZGVyJywge2V2ZW50OiBldmVudCwgZm9sZGVyOiBmb2xkZXJ9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KHtwYXRoOiBmb2xkZXIucGF0aCB8fCAnLyd9LCBmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHIpO1xyXG4gICAgICAgICAgICAgICAgb25Gb2xkZXJDaGFuZ2VkKHIsIGZvbGRlcik7XHJcbiAgICAgICAgICAgIH0sICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWNoYW5nZWQnLCBvbkZvbGRlckV4dGVybmFsbHlDaGFuZ2VkKTtcclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckV4dGVybmFsbHlDaGFuZ2VkKGV2ZW50LCBpdGVtcykge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBvbkZvbGRlckV4dGVybmFsbHlDaGFuZ2VkJywge2V2ZW50OiBldmVudCwgaXRlbXM6IGl0ZW1zfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdmaWxlLXVwbG9hZGVkJywgYWRkTmV3RmlsZSk7XHJcbiAgICAgICAgZnVuY3Rpb24gYWRkTmV3RmlsZShldmVudCwgZmlsZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBhZGROZXdGaWxlJywge2V2ZW50OiBldmVudCwgZmlsZTogZmlsZX0pO1xyXG4gICAgICAgICAgICBEaXJTZXJ2aWNlLmV4dGVuZEl0ZW0oZmlsZSwgJHNjb3BlLmZvbGRlci5pdGVtcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLml0ZW1zLnVuc2hpZnQoZmlsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdmb2xkZXItZGVsZXRlZCcsIHJlbW92ZUJ5UGF0aCk7XHJcbiAgICAgICAgJHNjb3BlLiRvbignZmlsZS1kZWxldGVkJywgcmVtb3ZlQnlQYXRoKTtcclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVCeVBhdGgoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gcmVtb3ZlQnlQYXRoJywge2V2ZW50OiBldmVudCwgaXRlbTogaXRlbSwgaXRlbXM6ICRzY29wZS5mb2xkZXIuaXRlbXN9KTtcclxuICAgICAgICAgICAgcmVtb3ZlRnJvbUFycigkc2NvcGUuZm9sZGVyLml0ZW1zLCBpdGVtLnBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaWx0ZXJzIGZvbGRlciBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgICAgICogQHBhcmFtIGFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZm9sZGVyRmlsdGVyKHZhbHVlLCBpbmRleCwgYXJyYXkpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PSAnZGlyJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNGaWx0ZXJzRW5hYmxlZCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZm9sZGVyLmZpbHRlcnNbdmFsdWUudHlwZV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzLmdldFR5cGUoKSA9PSB2YWx1ZS50eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcmRlcihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkaXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lID09ICcuLicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgKyAnICcgKyBpdGVtWyRzY29wZS5mb2xkZXIub3JkZXIuYnldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJ3onICsgaXRlbVskc2NvcGUuZm9sZGVyLm9yZGVyLmJ5XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoYW5nZU9yZGVyKG5ld05hbWUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5vcmRlci5ieSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gWyduYW1lJywgJ3NpemUnLCAnZGF0ZSddO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGkpKVxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5mb2xkZXIub3JkZXJbb3B0aW9uc1tpXV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm9yZGVyW25ld05hbWVdID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzRmlsdGVyc0VuYWJsZWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTZXR0aW5ncy5nZXRUeXBlKCkgPT0gJ2ZpbGUnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVmcmVzaCgpIHtcclxuICAgICAgICAgICAgaWYgKCFfX2NhbkxvYWQoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckNvbnRyb2xsZXIgLT4gcmVmcmVzaCcsIHttYW5hZ2VyOiAkc2NvcGUubWFuYWdlcn0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUubWFuYWdlci5wYXRoID0gJHNjb3BlLm1hbmFnZXIucGF0aC5yZXBsYWNlKC9eXFwvfFxcLyQvZywgJycpO1xyXG4gICAgICAgICAgICBEaXIucXVlcnkoe3BhdGg6ICRzY29wZS5tYW5hZ2VyLnBhdGggfHwgJy8nfSwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgIG9uRm9sZGVyQ2hhbmdlZChyLCAkc2NvcGUubWFuYWdlcik7XHJcbiAgICAgICAgICAgIH0sICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsbGJhY2sgZm9yIGZvbGRlciBkYXRhIGxvYWQgY29tcGxldGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgICAgICogQHBhcmFtIGZvbGRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ2hhbmdlZChyZXNwb25zZSwgZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJDb250cm9sbGVyIC0+IGNoYW5nZUZvbGRlciAtPiBvbkZvbGRlckNoYW5nZWQnLFxyXG4gICAgICAgICAgICAgICAge3Jlc3BvbnNlOiByZXNwb25zZSwgZm9sZGVyOiBmb2xkZXJ9KTtcclxuICAgICAgICAgICAgRGlyU2VydmljZS5leHRlbmQocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLml0ZW1zID0gcmVzcG9uc2UuaXRlbXMoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5tYW5hZ2VyLnBhdGggPSAnLycgKyAoZm9sZGVyLnBhdGggfHwgJycpO1xyXG4gICAgICAgICAgICAkY29va2llcy5wdXQoJ3BhdGgnLCAoZm9sZGVyLnBhdGggfHwgJycpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZUNyZWF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5jcmVhdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvY3VzKCcjY3JlYXRlLWRpci1pbnB1dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgICAgICAgICBpZiAoIV9fY2FuTG9hZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmZvbGRlci5uYW1lICYmICRzY29wZS5mb2xkZXIubmFtZSAhPT0gJycpXHJcbiAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLmNyZWF0ZSgkc2NvcGUubWFuYWdlci5wYXRoLCAkc2NvcGUuZm9sZGVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgb25Gb2xkZXJDcmVhdGVkLCAkc2NvcGUuX2Vycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ3JlYXRlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVyQ29udHJvbGxlciAtPiBjcmVhdGUgLT4gb25Gb2xkZXJDcmVhdGVkJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5jcmVhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm5hbWUgPSAnJztcclxuICAgICAgICAgICAgdmFyIGZvbGRlciA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kSXRlbShmb2xkZXIsICRzY29wZS5mb2xkZXIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcy51bnNoaWZ0KGZvbGRlcik7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdmb2xkZXItY3JlYXRlZCcsIGZvbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCwgdG9wLCB3LCBPKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0ZvbGRlckl0ZW1Db250cm9sbGVyJywgRm9sZGVySXRlbUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEZvbGRlckl0ZW1Db250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ2ZvY3VzJywgJ0RpclNlcnZpY2UnLCAnRmlsZVNlcnZpY2UnLCAnU2V0dGluZ3MnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEZvbGRlckl0ZW1Db250cm9sbGVyKCRsb2csICRzY29wZSwgZm9jdXMsIERpclNlcnZpY2UsIEZpbGVTZXJ2aWNlLCBTZXR0aW5ncykge1xyXG4gICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciBjb250cm9sbGVyIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jbGljayA9IGNsaWNrO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FuUmVuYW1lID0gY2FuUmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuZW5hYmxlUmVuYW1lID0gZW5hYmxlUmVuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVJlbmFtZSA9IGRpc2FibGVSZW5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5yZW5hbWUgPSByZW5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3QgPSBzZWxlY3Q7XHJcbiAgICAgICAgICAgICRzY29wZS5oYXNUaHVtYnMgPSBoYXNUaHVtYnM7XHJcbiAgICAgICAgICAgICRzY29wZS50aHVtYk5hbWUgPSB0aHVtYk5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZVsnZGVsZXRlJ10gPSBkZWxldGVJdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpdGVtIHR5cGUgYW5kIGRvZXMgYWN0aW9uIGZvciB0aGF0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xpY2soaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmZvbGRlci5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBhZGQgd2FybmluZyBhYm91dCBsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IGNsaWNrJywgJ1ByZXZpb3VzIGl0ZW0gc3RpbGwgbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gY2xpY2snLCB7aXRlbTogaXRlbX0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0RpcihpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2NoYW5nZS1mb2xkZXInLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZWN0KGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICEkc2NvcGUuaXNEaXJVcChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9uIHJlbmFtZSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZW5hYmxlUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5yZW5hbWUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzRGlyKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLm5ld05hbWUgPSBpdGVtLm5hbWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmV4dCA9IGl0ZW0ubmFtZS5zcGxpdCgnLicpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1dCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5leHQubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1dCA9IGl0ZW0uZXh0Lmxlbmd0aCArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5uZXdOYW1lID0gaXRlbS5uYW1lLnN1YnN0cmluZygwLCBpdGVtLm5hbWUubGVuZ3RoIC0gY3V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1cygnIycgKyBpdGVtLmlkICsgJyBpbnB1dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVuYW1lKCkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzRGlyKCRzY29wZS5pdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5pdGVtLm5hbWUgIT0gJy4uJylcclxuICAgICAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLnJlbmFtZSgkc2NvcGUubWFuYWdlci5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXRlbS5uYW1lLCAkc2NvcGUuaXRlbS5uZXdOYW1lLCBvbkZvbGRlclJlbmFtZWQsICRzY29wZS5fZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBGaWxlU2VydmljZS5yZW5hbWUoJHNjb3BlLm1hbmFnZXIucGF0aCxcclxuICAgICAgICAgICAgICAgICRzY29wZS5pdGVtLm5hbWUsIGdldEl0ZW1OZXdOYW1lKCRzY29wZS5pdGVtKSwgb25GaWxlUmVuYW1lZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRJdGVtTmV3TmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpdGVtLmV4dCkgJiYgaXRlbS5leHQubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubmV3TmFtZSArICcuJyArIGl0ZW0uZXh0O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5uZXdOYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGlzYWJsZVJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlclJlbmFtZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IG9uRm9sZGVyUmVuYW1lZCcsIHtyZXNwb25zZTogcmVzcG9uc2UsIGl0ZW06ICRzY29wZS5pdGVtfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5fc3VjY2VzcyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHZhciBjb3B5ID0gYW5ndWxhci5jb3B5KCRzY29wZS5pdGVtKTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGNyZWF0ZSBpdGVtIGF1dG9tYXBwZXJcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucGF0aCA9IHJlc3BvbnNlLmRhdGEucGF0aDtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ubmFtZSA9IHJlc3BvbnNlLmRhdGEubmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0udXJsID0gcmVzcG9uc2UuZGF0YS51cmw7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZm9sZGVyLXJlbmFtZWQnLCB7J25ldyc6IHJlc3BvbnNlLmRhdGEsIG9sZDogY29weX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25GaWxlUmVuYW1lZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gb25GaWxlUmVuYW1lZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0ucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLm5hbWUgPSByZXNwb25zZS5kYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtLnVybCA9IHJlc3BvbnNlLmRhdGEudXJsO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXRlbS50aHVtYnMgPSByZXNwb25zZS5kYXRhLnRodW1icztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdChpdGVtLCB0aHVtYkluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlX3VybCA9IGl0ZW0udXJsO1xyXG4gICAgICAgICAgICBpZiAoISF0aHVtYkluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX3VybCA9IGl0ZW0udGh1bWJzW3RodW1iSW5kZXhdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBzZWxlY3QgZm9yIHRpbnlNQ0VcclxuICAgICAgICAgICAgaWYgKFNldHRpbmdzLmlzVGFyZ2V0KCd0aW55TUNFJykpIHtcclxuICAgICAgICAgICAgICAgICRsb2cuaW5mbygnRm9sZGVySXRlbUNvbnRyb2xsZXIgLT4gc2VsZWN0IC0+IHRpbnltY2UnLCB7dGlueW1jZTogdG9wLnRpbnltY2V9KTtcclxuICAgICAgICAgICAgICAgIGlmICh0b3AudGlueW1jZS5tYWpvclZlcnNpb24gPCA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wLnRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIucGFyYW1zLnNldFVybChmaWxlX3VybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvcl9pZCA9IHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLnBhcmFtcy5tY2Vfd2luZG93X2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmNsb3NlKGVkaXRvcl9pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLmluZm8oJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IHNlbGVjdCAtPiB0aW55bWNlNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtwYXJhbXM6IHRvcC50aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmdldFBhcmFtcygpfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wLnRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIuZ2V0UGFyYW1zKCkuc2V0VXJsKGZpbGVfdXJsKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3AudGlueW1jZS5hY3RpdmVFZGl0b3Iud2luZG93TWFuYWdlci5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3MuaXNUYXJnZXQoJ2NhbGxiYWNrJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlbWFuYWdlciA9IHcuZmlsZW1hbmFnZXIgfHwgdy5wYXJlbnQuZmlsZW1hbmFnZXIgfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZmlsZW1hbmFnZXIgJiYgZmlsZW1hbmFnZXIub25TZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVtYW5hZ2VyLm9uU2VsZWN0ZWQoZmlsZV91cmwsIFNldHRpbmdzLmdldFBhcmFtcygpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlSXRlbShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaXNEaXIoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLm5hbWUgIT0gJy4uJylcclxuICAgICAgICAgICAgICAgICAgICBEaXJTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUubWFuYWdlci5wYXRoLCBpdGVtLm5hbWUsIG9uRm9sZGVyRGVsZXRlZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRmlsZVNlcnZpY2UuZGVsZXRlKCRzY29wZS5tYW5hZ2VyLnBhdGgsIGl0ZW0ubmFtZSwgb25GaWxlRGVsZXRlZCwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZvbGRlckRlbGV0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZvbGRlckl0ZW1Db250cm9sbGVyIC0+IG9uRm9sZGVyRGVsZXRlZCcsIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcclxuICAgICAgICAgICAgJHNjb3BlLl9zdWNjZXNzKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZvbGRlci1kZWxldGVkJywgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbkZpbGVEZWxldGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGb2xkZXJJdGVtQ29udHJvbGxlciAtPiBvbkZpbGVEZWxldGVkJywge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlyZUJyb2FkY2FzdCgnZmlsZS1kZWxldGVkJywgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYXNUaHVtYnMoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFpdGVtICYmIGFuZ3VsYXIuaXNEZWZpbmVkKGl0ZW0udGh1bWJzKSAmJiBPLmtleXMoaXRlbS50aHVtYnMpLmxlbmd0aCA+IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB0aHVtYk5hbWUodGh1bWJJbmRleCwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgICAgICBpZiAodGh1bWJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSBTZXR0aW5ncy5nZXRUaHVtYlNpemUodGh1bWJJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHNpemVbMF07XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXplWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9ICcoe3dpZHRofSB4IHtoZWlnaHR9KScsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUuc3VwcGxhbnQocGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSwgdG9wLCB3aW5kb3csIE9iamVjdCk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1RyZWVDb250cm9sbGVyJywgVHJlZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIFRyZWVDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ0RpcicsICdEaXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUcmVlQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsIERpciwgRGlyU2VydmljZSkge1xyXG4gICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciBjb250cm9sbGVyIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc09wZW4gPSBpc09wZW47XHJcbiAgICAgICAgICAgICRzY29wZS5pc0VtcHR5ID0gaXNFbXB0eTtcclxuICAgICAgICAgICAgJHNjb3BlLmNoYW5nZUZvbGRlciA9IGNoYW5nZUZvbGRlcjtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS50cmVlID0ge1xyXG4gICAgICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgIHJvb3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnLycsIC8vIFRPRE86IGdldCB0cmFuc2xhdGlvbiBmb3IgdGhpcyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUuYmFzZVVybCArICdkaXInXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhwYW5kOiBleHBhbmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGFkZCB0cmVlIHJlZnJlc2hcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignX2Vycm9yJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgICRzY29wZS4kb24oJ193YXJuaW5nJywgb25FcnJvckhhbmRsZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JIYW5kbGVkKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3RyZWUtY2hhbmdlZCcsIHRyZWVDaGFuZ2VkKTtcclxuICAgICAgICBmdW5jdGlvbiB0cmVlQ2hhbmdlZChldmVudCwgdHJlZSkge1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gdHJlZUNoYW5nZWQnLCB7ZXZlbnQ6IGV2ZW50LCB0cmVlOiB0cmVlfSk7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zID0gdHJlZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyZWUubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZm9sZGVyLWNyZWF0ZWQnLCBvbkZvbGRlckNyZWF0ZWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uRm9sZGVyQ3JlYXRlZChldmVudCwgZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdUcmVlQ29udHJvbGxlciAtPiBvbkZvbGRlckNyZWF0ZWQnLCB7ZXZlbnQ6IGV2ZW50LCBmb2xkZXI6IGZvbGRlcn0pO1xyXG4gICAgICAgICAgICBpZiAoZm9sZGVyLnBhdGguaW5kZXhPZignLycpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlZCBmb2xkZXIgaXMgaW4gcm9vdCwgc28gd2VlIG5lZWQgYWRkIGl0IHRvIHRyZWUgbWVudVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXMudW5zaGlmdChmb2xkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdmb2xkZXItcmVuYW1lZCcsIG9uRm9sZGVyUmVuYW1lZCk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25Gb2xkZXJSZW5hbWVkKGV2ZW50LCBmb2xkZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBvbGRGb2xkZXIgPSBmb2xkZXJzLm9sZCxcclxuICAgICAgICAgICAgICAgIG5ld0ZvbGRlciA9IGZvbGRlcnMubmV3O1xyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gb25Gb2xkZXJSZW5hbWVkJywge2V2ZW50OiBldmVudCwgbmV3Rm9sZGVyOiBuZXdGb2xkZXIsIG9sZEZvbGRlcjogb2xkRm9sZGVyfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiByZWN1cnNpdmVseSBjaGVjayBhbGwgY2hpbGQgZm9sZGVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS50cmVlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnRyZWUuaXRlbXNbaV0ucGF0aCA9PSBvbGRGb2xkZXIucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGNyZWF0ZSBpdGVtIGF1dG9tYXBwZXJcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJlZS5pdGVtc1tpXS5wYXRoID0gbmV3Rm9sZGVyLnBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyZWUuaXRlbXNbaV0ubmFtZSA9IG5ld0ZvbGRlci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmVlLml0ZW1zW2ldLnVybCA9IG5ld0ZvbGRlci51cmw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2ZvbGRlci1kZWxldGVkJywgcmVtb3ZlQnlQYXRoKTtcclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVCeVBhdGgoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ1RyZWVDb250cm9sbGVyIC0+IHJlbW92ZUJ5UGF0aCcsIHtldmVudDogZXZlbnQsIGl0ZW06IGl0ZW0sIGl0ZW1zOiAkc2NvcGUudHJlZS5pdGVtc30pO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgY2hlY2sgYWxsIGNoaWxkIGZvbGRlcnNcclxuICAgICAgICAgICAgcmVtb3ZlRnJvbUFycigkc2NvcGUudHJlZS5pdGVtcywgaXRlbS5wYXRoLCAncGF0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgZm9sZGVyIG9wZW4gZm9yIHRyZWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBmb2xkZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc09wZW4oZm9sZGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmb2xkZXIgJiYgYW5ndWxhci5pc0RlZmluZWQoZm9sZGVyLmZvbGRlcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgZm9sZGVyIGhhcyBhbnkgb3RoZXIgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZm9sZGVyXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNFbXB0eShmb2xkZXIpIHtcclxuICAgICAgICAgICAgaWYgKGlzT3Blbihmb2xkZXIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvbGRlci5mb2xkZXJzLmxlbmd0aCA9PSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmQoY3VyckZvbGRlcikge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIGlmIHRyZWUgc3RpbGwgbG9hZGluZyBvciBkb25gdCBoYXZlIHN1YiBmb2xkZXJzXHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUudHJlZS5sb2FkaW5nIHx8IGlzRW1wdHkoY3VyckZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybignVHJlZUNvbnRyb2xsZXIgLT4gZXhwYW5kJywgJ1ByZXZpb3VzIGl0ZW0gc3RpbGwgbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkbG9nLmxvZygnVHJlZUNvbnRyb2xsZXIgLT4gZXhwYW5kJywge2N1cnI6IGN1cnJGb2xkZXJ9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgc3ViIGZvbGRlcnMgaWYgaXQgaXMgYWxyZWFkeSBvcGVuZWRcclxuICAgICAgICAgICAgaWYgKGlzT3BlbihjdXJyRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY3VyckZvbGRlci5mb2xkZXJzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudHJlZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KHtwYXRoOiBjdXJyRm9sZGVyLnBhdGh9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIERpclNlcnZpY2UuZXh0ZW5kKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmVlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGN1cnJGb2xkZXIuZm9sZGVycyA9IHJlc3BvbnNlLmRpcnMoKTtcclxuICAgICAgICAgICAgfSwgJHNjb3BlLl9lcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VGb2xkZXIoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5maXJlQnJvYWRjYXN0KCdjaGFuZ2UtZm9sZGVyJywgZm9sZGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1VwbG9hZENvbnRyb2xsZXInLCBVcGxvYWRDb250cm9sbGVyKTtcclxuXHJcbiAgICBVcGxvYWRDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ0ZpbGVVcGxvYWRlcidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gVXBsb2FkQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsIEZpbGVVcGxvYWRlcikge1xyXG4gICAgICAgICRsb2cubG9nKCdVcGxvYWRDb250cm9sbGVyIGNvbnRyb2xsZXIgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyID0gbmV3IEZpbGVVcGxvYWRlcih7XHJcbiAgICAgICAgICAgICAgICB1cmw6IF9nZXRVcGxvYWRQYXRoXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldFVwbG9hZFBhdGgoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuYmFzZVVybCgpICsgJ2ZpbGUvdXBsb2FkJyArICRzY29wZS5tYW5hZ2VyLnBhdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUudXBsb2FkZXIub25XaGVuQWRkaW5nRmlsZUZhaWxlZCA9IGZ1bmN0aW9uIChpdGVtIC8qe0ZpbGV8RmlsZUxpa2VPYmplY3R9Ki8sIGZpbHRlciwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAkbG9nLmluZm8oJ29uV2hlbkFkZGluZ0ZpbGVGYWlsZWQnLCBpdGVtLCBmaWx0ZXIsIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbkFmdGVyQWRkaW5nRmlsZSA9IGZ1bmN0aW9uIChmaWxlSXRlbSkge1xyXG4gICAgICAgICAgICAvLyBmaXggdXJsIHRvIHVwbG9hZCBhcyB3ZSBjYW4gY2hhbmdlIGl0IGF0IGFueSBtb21lbnRcclxuICAgICAgICAgICAgZmlsZUl0ZW0udXBsb2FkZXIudXJsID0gZmlsZUl0ZW0udXJsID0gX2dldFVwbG9hZFBhdGgoKTtcclxuICAgICAgICAgICAgJGxvZy5pbmZvKCdvbkFmdGVyQWRkaW5nRmlsZScsIGZpbGVJdGVtKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudXBsb2FkZXIub25FcnJvckl0ZW0gPSBmdW5jdGlvbiAoZmlsZUl0ZW0sIHJlc3BvbnNlLCBzdGF0dXMsIGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYWRkIGVycm9yIGhhbmRsaW5nXHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnb25FcnJvckl0ZW0nLCBmaWxlSXRlbSwgLypyZXNwb25zZSwqLyBzdGF0dXMsIGhlYWRlcnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS51cGxvYWRlci5vbkNvbXBsZXRlSXRlbSA9IGZ1bmN0aW9uIChmaWxlSXRlbSwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycykge1xyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICRsb2cuaW5mbygnVXBsb2FkQ29udHJvbGxlciAtPiB1cGxvYWRlciAtPiBvbkNvbXBsZXRlSXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAge2ZpbGVJdGVtOiBmaWxlSXRlbSwgcmVzcG9uc2U6IHJlc3BvbnNlLCBzdGF0dXM6IHN0YXR1cywgaGVhZGVyczogaGVhZGVyc30pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZpcmVCcm9hZGNhc3QoJ2ZpbGUtdXBsb2FkZWQnLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuX3N1Y2Nlc3MocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyLm9uQ29tcGxldGVBbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnVXBsb2FkQ29udHJvbGxlciAtPiB1cGxvYWRlciAtPiBvbkNvbXBsZXRlQWxsJywge3VwbG9hZGVyOiAkc2NvcGUudXBsb2FkZXJ9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYXNOb3RVcGxvYWRlZEZpbGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUudXBsb2FkZXIucXVldWUsIGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGUuaXNSZWFkeSAmJiAhZmlsZS5pc1VwbG9hZGluZyAmJiAhZmlsZS5pc1N1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNOb3RVcGxvYWRlZEZpbGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWhhc05vdFVwbG9hZGVkRmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIENsZWFyIGxpcyBmcm9tIGl0ZW1zIGFuZCBoaWRlIGl0XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBsb2FkZXIuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5KTsiLCIoZnVuY3Rpb24gKGFuZ3VsYXIsICQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnZmlsZS5tYW5hZ2VyJylcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcmVzb3VyY2UnLCAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyKCRsb2csICRyZXNvdXJjZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgICRsb2cubG9nKCdEaXIgcmVzb3VyY2UgPC0gc3RhcnRlZCcpO1xyXG5cclxuICAgICAgICByZXR1cm4gJHJlc291cmNlKCRyb290U2NvcGUuYmFzZVVybCgpICsgJ2Rpci86cGF0aCcsIHtcclxuICAgICAgICAgICAgcGF0aDogJ0BwYXRoJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdmaWxlLm1hbmFnZXInKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdEaXJTZXJ2aWNlJywgRGlyU2VydmljZSk7XHJcblxyXG4gICAgRGlyU2VydmljZS4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRyb290U2NvcGUnLCAnJGh0dHAnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpclNlcnZpY2UoJGxvZywgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuICAgICAgICAkbG9nLmxvZygnRGlyU2VydmljZSBzZXJ2aWNlIDwtIHN0YXJ0ZWQnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZXh0ZW5kOiBleHRlbmQsXHJcbiAgICAgICAgICAgIGV4dGVuZEl0ZW06IGV4dGVuZEl0ZW0sXHJcbiAgICAgICAgICAgIHJlbmFtZTogcmVuYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgICAgICAgICAgJ2RlbGV0ZSc6IGRlbGV0ZURpcixcclxuICAgICAgICAgICAgaWRHZW46IGlkR2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGRhdGEuRGlyU2VydmljZUV4dGVuZGVkKSAmJiBkYXRhLkRpclNlcnZpY2VFeHRlbmRlZClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGRhdGEsIHtcclxuICAgICAgICAgICAgICAgIGRpcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PSAnZGlyJyAmJiB2YWx1ZS5uYW1lICE9ICcuLicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odmFsdWUsIGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZm9sZGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb2xkZXJzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odmFsdWUsIGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgaXRlbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZGF0YS5EaXJTZXJ2aWNlRXh0ZW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuYW1lcyBwYXRoIGxhc3QgcGFydCBudG8gbmV3IG5hbWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXRoIFwicGF0aCB0byByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbGROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIG5ld05hbWUgXCJuZXcgbmFtZSBmb3IgcGF0aCBsYXN0IGVsZW1lbnRcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvblN1Y2Nlc3MgXCJjYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCByZW5hbWVcIlxyXG4gICAgICAgICAqIEBwYXJhbSBvbkVycm9yIFwiY2FsbGJhY2sgZm9yIGVycm9yXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5hbWUocGF0aCwgb2xkTmFtZSwgbmV3TmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkcm9vdFNjb3BlLmJhc2VVcmwoKSArICdkaXIvcmVuYW1lLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ29sZCc6IG9sZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAnbmV3JzogbmV3TmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uU3VjY2Vzcywgb25FcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGUocGF0aCwgbmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkcm9vdFNjb3BlLmJhc2VVcmwoKSArICdkaXIvY3JlYXRlLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZURpcihwYXRoLCBuYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2Rpci9kZWxldGUvJyArIHBhdGg7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QodXJsLCB7XHJcbiAgICAgICAgICAgICAgICAnbmFtZSc6IG5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaWRHZW4oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbGlzdC1pdGVtLScgKyBrZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmRJdGVtKGl0ZW0sIGtleSkge1xyXG4gICAgICAgICAgICBpdGVtLmlkID0gaWRHZW4oa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChhbmd1bGFyLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXHJcbiAgICAgICAgLnNlcnZpY2UoJ0ZpbGVTZXJ2aWNlJywgRmlsZVNlcnZpY2UpO1xyXG5cclxuICAgIEZpbGVTZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHJvb3RTY29wZScsICckaHR0cCdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRmlsZVNlcnZpY2UoJGxvZywgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuICAgICAgICAkbG9nLmxvZygnRmlsZVNlcnZpY2Ugc2VydmljZSA8LSBzdGFydGVkJyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlbmFtZTogcmVuYW1lLFxyXG4gICAgICAgICAgICAnZGVsZXRlJzogZGVsZXRlRmlsZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmFtZShwYXRoLCBvbGROYW1lLCBuZXdOYW1lLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0ZpbGVTZXJ2aWNlIC0+IHJlbmFtZScsIHtwYXRoOiBwYXRoLCBvbGROYW1lOiBvbGROYW1lLCBuZXdOYW1lOiBuZXdOYW1lfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXJsID0gJHJvb3RTY29wZS5iYXNlVXJsKCkgKyAnZmlsZS9yZW5hbWUvJyArIHBhdGg7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QodXJsLCB7XHJcbiAgICAgICAgICAgICAgICAnb2xkJzogb2xkTmFtZSxcclxuICAgICAgICAgICAgICAgICduZXcnOiBuZXdOYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZUZpbGUocGF0aCwgbmFtZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdGaWxlU2VydmljZSAtPiBkZWxldGUnLCB7cGF0aDogcGF0aCwgbmFtZTogbmFtZX0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVybCA9ICRyb290U2NvcGUuYmFzZVVybCgpICsgJ2ZpbGUvZGVsZXRlLycgKyBwYXRoO1xyXG4gICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwge1xyXG4gICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChuZywgJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIG5nXG4gICAgICAgIC5tb2R1bGUoJ2ZpbGUubWFuYWdlcicpXG4gICAgICAgIC5zZXJ2aWNlKCdTZXR0aW5ncycsIFNldHRpbmdzKTtcblxuICAgIFNldHRpbmdzLiRpbmplY3QgPSBbXTtcblxuICAgIGZ1bmN0aW9uIFNldHRpbmdzKCkge1xuICAgICAgICB2YXIgJHNldHRpbmdzID0gJCgnI3NldHRpbmdzJyksIHBhcmFtcyA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc1RhcmdldDogaXNUYXJnZXQsXG4gICAgICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxuICAgICAgICAgICAgZ2V0VGh1bWJTaXplOiBnZXRUaHVtYlNpemUsXG4gICAgICAgICAgICBnZXRQYXJhbXM6IGdldFBhcmFtc1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGlzVGFyZ2V0KGN1cnJfdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UGFyYW1zKCkudGFyZ2V0LnRvTG93ZXJDYXNlKCkgPT09IGN1cnJfdGFyZ2V0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICAgICAgcmV0dXJuIChnZXRQYXJhbXMoKS50eXBlID8gcGFyYW1zLnR5cGUudG9Mb3dlckNhc2UoKSA6IGZhbHNlKSB8fCAnZmlsZSc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRUaHVtYlNpemUoc2l6ZUtleSkge1xuICAgICAgICAgICAgdmFyIHNpemVzID0gbmcuZnJvbUpzb24oJHNldHRpbmdzLmRhdGEoJ3NpemVzJykucmVwbGFjZSgvXFwnL2csICdcIicpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNpemVzW3NpemVLZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UGFyYW1zKCkge1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YVBhcmFtcyA9ICRzZXR0aW5ncy5kYXRhKCdwYXJhbXMnKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBwYXJhbXMgaXMgZW1wdHkgYXJyYXksIGl0IGFscmVhZHkgY29udmVydGVkIHRvIGVtcHR5IGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFQYXJhbXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG5cbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBzdHJGcm9tSnNvbihkYXRhUGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaXhTZXJpYWxpemFibGVTdHIoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFwnL2csICdcIicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ckZyb21Kc29uKHN0cikge1xuICAgICAgICByZXR1cm4gbmcuZnJvbUpzb24oZml4U2VyaWFsaXphYmxlU3RyKHN0cikpO1xuICAgIH1cbn0pKGFuZ3VsYXIsIGpRdWVyeSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
