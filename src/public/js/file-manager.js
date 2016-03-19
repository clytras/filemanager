(function (ng, crip) {
    'use strict';

    crip.filemanager = ng.module('crip.file-manager', [
        'crip.core',
        'angular-loading-bar',
        'angularFileUpload',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui-notification',
        'io.dennis.contextmenu'
    ])
})(angular, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .run(Run);

    Run.$inject = [
        '$rootScope'
    ];

    function Run($rootScope) {
        var $settings = $('#settings'),
            base_url = $settings.data('base-url'),
            img_sizes = JSON.parse($settings.data('sizes').replaceAll("'", '"'));

        $rootScope.fireBroadcast = broadcast;
        $rootScope.baseUrl = baseUrl;
        $rootScope.imgSizes = imgSizes;

        /**
         * Get plugin dir action url
         *
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        $rootScope.dirUrl = function (dir, action) {
            return actionUrl('dir', dir, action);
        };

        /**
         * Get plugin file action url
         *
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        $rootScope.fileUrl = function (dir, action) {
            return actionUrl('file', dir, action);
        };

        /**
         * Fire event on root scope for all controllers
         *
         * @param {string} eventName
         * @param {Array} args
         */
        function broadcast(eventName, args) {
            $rootScope.$broadcast(eventName, args);
        }

        /**
         * @param {string} root
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        function actionUrl(root, dir, action) {
            var path = root + '/';
            if (ng.isDefined(action)) {
                path += action + '/'
            }
            path += dir;

            return baseUrl(path);
        }

        /**
         * Get plugin base url
         *
         * @param {string} path
         * @returns {string}
         */
        function baseUrl(path) {
            return base_url + path;
        }

        function imgSizes() {
            return img_sizes;
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', '$uibModal', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation'
    ];

    function ActionsController($scope, $uibModal, focus, Actions, Content, Location) {
        activate();

        function activate() {
            $scope.canDeleteSelected = canDeleteSelected;
            $scope.deleteSelected = deleteSelected;

            $scope.canCreateFolder = canCreateFolder;
            $scope.createFolder = createFolder;

            $scope.canRenameSelected = canRenameSelected;
            $scope.enableRenameSelected = enableRenameSelected;

            $scope.canOpenSelected = canOpenSelected;
            $scope.openSelected = openSelected;

            $scope.hasProperties = hasProperties;
            $scope.openProperties = openProperties;
        }

        /**
         * Determines if selected item can be deleted
         *
         * @returns {boolean}
         */
        function canDeleteSelected() {
            return Actions.canDelete(Content.getSelectedItem());
        }

        /**
         * Delete selected item
         *
         * @param $event
         */
        function deleteSelected($event) {
            // if event is presented, stop it propagation
            if (ng.isDefined($event) && ng.isDefined($event.stopPropagation)) {
                $event.stopPropagation();
            }

            Actions.delete(Content.getSelectedItem());
            Content.deselect();
        }

        /**
         * Determines if can create new folder
         *
         * @returns {boolean}
         */
        function canCreateFolder() {
            return Actions.canCreateFolder();
        }

        /**
         * Create new folder
         *
         * @param {string} name
         */
        function createFolder(name) {
            Actions.createFolder(name, enableRenameSelected);
        }

        /**
         * Determines if selected item can be renamed
         *
         * @returns {boolean}
         */
        function canRenameSelected() {
            return Actions.canRename(Content.getSelectedItem());
        }

        /**
         * Enable rename for selected item
         *
         * @param $event
         */
        function enableRenameSelected($event) {
            var item = Content.getSelectedItem();

            // if event is presented, stop it propagation
            if (ng.isDefined($event) && ng.isDefined($event.stopPropagation)) {
                $event.stopPropagation();
            }

            if (item) {
                Actions.enableRename(item);
                focus('#{identifier} input[name="name"]'.supplant(item));
            }
        }

        /**
         * Determines if can open selected item
         *
         * @returns {boolean}
         */
        function canOpenSelected() {
            return Content.getSelectedItem().isDir;
        }

        /**
         * Open selected directory
         */
        function openSelected() {
            if (!canOpenSelected())
                return;

            Location.change(Content.getSelectedItem());
        }

        /**
         * Determines is selected item can provide properties
         *
         * @returns {boolean}
         */
        function hasProperties() {
            var item = Content.getSelectedItem();

            return item && !item.isDirUp;
        }

        function openProperties($event) {
            if (!hasProperties())
                return;

            $event.stopPropagation();

            $uibModal.open({
                animation: true,
                templateUrl: 'item-properties-modal.html',
                controller: 'ItemPropertiesController',
                size: 'lg',
                resolve: {
                    item: function () {
                        return Content.getSelectedItem();
                    }
                }
            });
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('BreadcrumbController', BreadcrumbController);

    BreadcrumbController.$inject = [
        '$scope', 'CripManagerBreadcrumb', 'CripManagerLocation'
    ];

    function BreadcrumbController($scope, Breadcrumb, Location) {
        activate();

        function activate() {
            $scope.goTo = goTo;
            $scope.goToRoot = goToRoot;
            $scope.breadcrumbHasItems = breadcrumbHasItems;
            $scope.getBreadcrumbItems = getBreadcrumbItems;
        }

        /**
         * Go to specified folder
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         */
        function goTo(folder) {
            Location.change(folder);
        }

        /**
         * Go to root folder location
         */
        function goToRoot() {
            goTo();
        }

        /**
         * Determines is Breadcrumb any item
         *
         * @returns {boolean}
         */
        function breadcrumbHasItems() {
            return Breadcrumb.hasItems();
        }

        /**
         * Get Breadcrumb item collection
         *
         * @returns {Array}
         */
        function getBreadcrumbItems() {
            return Breadcrumb.items;
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirContentController', DirContentController);

    DirContentController.$inject = [
        '$log', '$scope', 'CripManagerContent'
    ];

    function DirContentController($log, $scope, Content) {
        activate();

        function activate() {
            $scope.folderFilter = folderFilter;
            $scope.order = {
                by: orderBy,
                field: 'full_name',
                isReverse: false,

                full_name: true,
                size: false,
                date: false
            };
            $scope.filters = {
                image: true,
                media: true,
                document: true,
                file: true
            };

            $scope.getContent = function() {
                return Content.get();
            }
        }

        function orderBy(item) {
            var text = 'z {field}';
            if (item.isDir) {
                // dir up should be on first place
                if (item.isDirUp)
                    return -1;
                text = '0 {field}';
            }

            //$log.info($scope.order.field, text.supplant({field: item[$scope.order.field]}), item);
            return text.supplant({field: item[$scope.order.field]});
        }

        function folderFilter(value, index, array) {
            // If item is dir, it will be visible
            if (value.isDir)
                return true;

            // TODO: add filter enable property and check it here
            if(true)
                return $scope.filters[value.type];

            // if filter enable property is disabled, compare with allowed type
            //if (Settings.getType() == value.type)
            //    return true;

            return false;
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('ItemController', ItemController);

    ItemController.$inject = [
        '$log', '$scope', 'focus', 'CripManagerContent', 'CripManagerLocation', 'CripManagerActions'
    ];

    function ItemController($log, $scope, focus, Content, Location, Actions) {
        activate();

        function activate() {
            $scope.click = click;
            $scope.dblclick = dblclick;
            $scope.isSelected = isSelected;
            $scope.enableRename = enableRename;
        }

        /**
         * On item click
         *
         * @param e
         * @param item
         */
        function click(e, item) {
            e.stopPropagation();

            Content.updateSelected();
            Content.deselect();
            Content.selectSingle(item);
        }

        /**
         * On item double click
         *
         * @param e
         * @param item
         */
        function dblclick(e, item) {
            e.stopPropagation();
            $log.info('dblclick', item);

            if (item.isDir) {
                Location.change(item);
            }
        }

        /**
         * Determines is item selected
         *
         * @param {object} item
         * @returns {boolean}
         */
        function isSelected(item) {
            return Content.isSelected(item);
        }

        /**
         * Enable item rename
         *
         * @param $event
         */
        function enableRename($event) {
            $event.stopPropagation();
            var item = Content.getSelectedItem();
            Actions.enableRename(item);
            focus('#{identifier} input[name="name"]'.supplant(item));
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';
    crip.filemanager
        .controller('ItemPropertiesController', ItemPropertiesController);

    ItemPropertiesController.$inject = [
        '$log', '$scope', '$uibModalInstance', 'CripManagerTrans', 'item'
    ];

    function ItemPropertiesController($log, $scope, $uibModalInstance, Trans, item) {
        activate();

        function activate() {
            $log.info(item);
            $scope.item = resolveItemDetails(item);
            $scope.thumb = item.thumb;
            $scope.name = item.full_name;

            $scope.close = close;
        }

        /**
         * Hide modal
         */
        function close() {
            $uibModalInstance.close();
        }

        /**
         * Resolve item details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveItemDetails(item) {
            if (item.isDir) {
                return resolveDirDetails(item);
            } else {
                return resolveFileDetails(item);
            }
        }

        /**
         * Get item default details
         *
         * @param {Array} details
         * @param {object} item
         * @param {string} item.full_name
         * @param {string} item.date
         * @param {function} item.getSize
         */
        function defaultDetails(details, item) {
            details.push({
                name: Trans('item_properties_modal_item_type'),
                value: Trans('item_properties_modal_file_type_' + item.type)
            }, {
                name: Trans('item_properties_modal_name'),
                value: item.full_name
            }, {
                name: Trans('item_properties_modal_date'),
                value: item.date
            }, {
                name: Trans('item_properties_modal_size'),
                value: item.getSize()
            });
        }

        /**
         * Resolve folder details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveDirDetails(item) {
            var details = [];
            defaultDetails(details, item);

            return details;
        }

        /**
         * Resolve file details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveFileDetails(item) {
            var details = [];
            defaultDetails(details, item);

            if (item.dir !== '') {
                details.push({
                    name: Trans('item_properties_modal_item_dir'),
                    value: item.dir
                });
            }

            details.push({
                name: Trans('item_properties_modal_item_extension'),
                value: item.ext
            });

            if (item.type === 'image') {

                details.push({
                    name: Trans('item_properties_modal_item_url'),
                    value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                        url: item.url,
                        title: Trans('item_properties_modal_size_dim').supplant(item.dimensions)
                    })
                });

                ng.forEach($scope.imgSizes(), function (arr, size) {
                    details.push({
                        name: Trans('item_properties_modal_size_url_title').supplant({
                            size: Trans('item_properties_modal_size_key_' + size)
                        }),
                        value: '<a href="{url}?thumb={size}" target="_blank">{title}</a>'.supplant({
                            url: item.url,
                            size: size,
                            title: Trans('item_properties_modal_size_dim').supplant(arr)
                        })
                    });
                });
            } else {
                details.push({
                    name: Trans('item_properties_modal_item_url'),
                    value: '<a href="{url}" target="_blank">{full_name}</a>'.supplant(item)
                });
            }

            return details;
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$scope', 'CripManagerLocation', 'CripManagerContent', 'CripManagerTrans'
    ];

    function RootController($scope, Location, Content, Trans) {

        activate();

        function activate() {
            // initialise file manager initial location and load translations
            Trans().init();
            Location.init();

            $scope.deselect = deselect;
        }

        function deselect() {
            Content.deselect();
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$resource', '$rootScope'
    ];

    function Dir($resource, $rootScope) {
        return $resource($rootScope.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        }, {
            'create': {url: $rootScope.dirUrl(':dir/:name', 'create'), method: 'POST'},
            'deleteDir': {url: $rootScope.dirUrl(':dir', 'delete'), method: 'GET'},
            'deleteFile': {url: $rootScope.fileUrl(':dir/:name', 'delete'), method: 'GET'},
            'renameDir': {url: $rootScope.dirUrl(':dir', 'rename'), method: 'GET'},
            'renameFile': {url: $rootScope.fileUrl(':dir', 'rename'), method: 'GET'}
        });
    }
})(window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTranslations', Translations);

    Translations.$inject = [
        '$resource', '$rootScope'
    ];

    function Translations($resource, $rootScope) {
        return $resource($rootScope.baseUrl('translations'));
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerActions', Actions);

    Actions.$inject = [
        'CreateFolderService', 'DeleteService', 'RenameService'
    ];

    function Actions(CreateFolder, Delete, Rename) {
        var scope = {};
        ng.extend(scope, CreateFolder, Delete, Rename);

        return scope;
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';
    crip.filemanager
        .service('CripManagerBreadcrumb', Breadcrumb);

    Breadcrumb.$inject = [];

    function Breadcrumb() {
        var breadcrumb = {
            items: [],
            hasItems: hasItems,
            current: current,
            set: setLocation
        };

        return breadcrumb;

        /**
         * Get current folder location object
         *
         * @returns {object}
         */
        function current() {
            if (breadcrumb.items.length === 0) {
                return {dir: '', name: ''};
            }

            return breadcrumb.items[breadcrumb.items.length - 1];
        }

        /**
         * Check is there any item in breadcrumb
         *
         * @returns {boolean}
         */
        function hasItems() {
            return !!breadcrumb.items.length;
        }

        /**
         * Set new location
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         */
        function setLocation(folder) {
            onLocationChange({dir: folder.dir, name: folder.name});
        }

        /**
         * Update breadcrumb array when manager property is changed
         *
         * @param {object} val
         * @param {string} val.dir
         * @param {string} val.name
         */
        function onLocationChange(val) {
            var string_value = val.dir || '';
            breadcrumb.items.splice(0, breadcrumb.items.length);

            if (val.name !== '' && val.name !== null) {
                string_value += '/' + val.name;
            }

            ng.forEach(string_value.split('\/'), function (v) {
                if (v !== '' && v !== null) {

                    // create current dir from previous item, if it exists
                    var dir = '';
                    if (breadcrumb.items.length > 0) {
                        // if only one previous item, use it`s name
                        if (breadcrumb.items.length === 1) {
                            dir = breadcrumb.items[0].name;
                        }
                        // other way, concat prev dir with name
                        else {
                            dir = '{dir}/{name}'.supplant(breadcrumb.items[breadcrumb.items.length - 1]);
                        }
                    }

                    breadcrumb.items.push({name: v, dir: dir, isActive: false});
                }
            });

            // mark last item as active, this will help mark item as active
            if (breadcrumb.items.length > 0) {
                breadcrumb.items[breadcrumb.items.length - 1].isActive = true;
            }
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContent', Content);

    Content.$inject = ['ItemService', 'SelectService'];

    function Content(ItemService, SelectService) {
        var content = {
            items: [],
            get: getItems,
            add: add,
            remove: remove,
            removeItems: removeItems
        };

        ng.extend(content, SelectService);

        return content;

        /**
         * Get all content items
         *
         * @returns {Array}
         */
        function getItems() {
            return content.items;
        }

        /**
         * Remove all items in content
         */
        function removeItems() {
            content.items.splice(0, content.items.length);
        }

        /**
         * Add item to content
         *
         * @param item
         */
        function add(item) {
            if (!ng.isDefined(item.is_extended)) {
                ItemService.extendItem(item);
            }

            content.items.push(item);
        }

        /**
         * Remove single item
         *
         * @param {object} item
         */
        function remove(item) {
            content.items.splice(content.items.indexOf(item), 1);
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('ItemService', ItemService);

    ItemService.$inject = [
        '$log', '$rootScope', 'CripManagerTrans'
    ];

    function ItemService($log, $rootScope, Trans) {
        return {
            'extend': extend,
            'extendItem': extendItem
        };

        /**
         * Extend Dir resource request response with required information
         *
         * @param resourceData
         */
        function extend(resourceData) {
            ng.extend(resourceData, {
                'getItems': function () {
                    var items = [];
                    ng.forEach(resourceData, function (v, k) {
                        extendItem(v, k);
                        this.push(v);
                    }, items);

                    return items;
                }
            });
        }

        /**
         * Generate UI id for item
         *
         * @param key
         * @returns {string}
         */
        function idGen(key) {
            return 'list-item-' + key;
        }

        /**
         * Get key from identifier (reverse method from idGen)
         *
         * @param {string} identifier
         * @returns {string}
         */
        function getKey(identifier) {
            return identifier.substring(10);
        }

        /**
         * Determine is item a folder
         *
         * @param item
         * @returns {boolean}
         */
        function isDir(item) {
            return item && ng.isDefined(item.type) && item.type === 'dir';
        }

        /**
         * Determine is item an a folder up
         *
         * @param item
         * @returns {boolean}
         */
        function isDirUp(item) {
            return isDir(item) && (item.name == '' || item.name == null);
        }

        /**
         * Extend single item with required information
         *
         * @param item
         * @param key
         */
        function extendItem(item, key) {
            ng.extend(item, {
                is_extended: true,
                rename: false,
                identifier: idGen(key),
                isDir: isDir(item),
                isDirUp: isDirUp(item),
                update: update,
                delete: deleteItem,
                getFullName: getFullName,
                saveNewName: saveNewName,
                getSize: getSize
            });
        }

        /**
         * Update item changes if they are presented
         *
         * @returns {item}
         */
        function update() {
            if (this.rename)
                this.saveNewName();

            return this;
        }

        /**
         * Get item name (ignoring full_name property value)
         *
         * @returns {string}
         */
        function getFullName() {
            if (this.isDir || this.ext === '')
                return this.name;
            else
                return '{name}.{ext}'.supplant(this);
        }

        /**
         * Save item name if it is changed
         */
        function saveNewName() {
            var self = this,
                key = getKey(self.identifier);
            self.rename = false;
            if (self.full_name !== self.getFullName()) {
                var method = self.isDir ? '$renameDir' : '$renameFile';
                self[method]({
                    'old': self.full_name,
                    'new': self.getFullName()
                }, function (response) {
                    ng.extend(self, extendItem(response, key));
                })
            }
        }

        /**
         * Delete item detecting it type (file or dir)
         */
        function deleteItem() {
            var method = this.isDir ? '$deleteDir' : '$deleteFile';
            this[method]({name: this.full_name});
        }

        /**
         * Get user friendly item size
         */
        function getSize() {
            return this.size.toBytes();
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerLocation', ChangeLocationService);

    ChangeLocationService.$inject = [
        '$cookies', 'Dir', 'ItemService', 'CripManagerBreadcrumb', 'CripManagerContent'
    ];

    function ChangeLocationService($cookies, Dir, ItemService, Breadcrumb, Content) {
        return {
            init: initialLoad,
            change: change,
            current: {}
        };

        /**
         * Change location to initial folder
         */
        function initialLoad() {
            change(getLocationFromCookie());
        }

        /**
         * Change current location
         *
         * @param {object} [folder]
         */
        function change(folder) {
            var path = {dir: null, name: null};
            if (ng.isDefined(folder)) {
                path.dir = ng.isEmpty(folder.dir) ? null : folder.dir;
                path.name = ng.isEmpty(folder.name) ? null : folder.name;
            }

            Dir.query(path, function (r) {
                updateCookie(path);

                // Append response with required information
                ItemService.extend(r);

                // Remove old content
                Content.removeItems();

                // deselect, if any item is selected
                Content.deselect();

                // Change breadcrumb path
                Breadcrumb.set(path);

                // Add new content
                ng.forEach(r.getItems(), function (item) {
                    Content.add(item);
                });
            });
        }

        /**
         * Get manager last location from cookies
         *
         * @returns {{dir: string, name: string}}
         */
        function getLocationFromCookie() {
            var location = {dir: null, name: null};

            var cookieDir = $cookies.get('location-dir'),
                name = $cookies.get('location-dir-name');
            if (ng.hasValue(cookieDir) || ng.hasValue(name)) {
                location.dir = cookieDir;

                if (!name || name === 'null' || name === null) {
                    name = '';
                }
                location.name = name;
            }

            return location;
        }

        /**
         * Update cookies for new manager instance, to be opened in same location
         *
         * @param {object} location
         * @param {string} location.dir
         * @param {string} location.name
         */
        function updateCookie(location) {
            $cookies.put('location-dir', location.dir || '');
            $cookies.put('location-dir-name', location.name || '');
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTrans', Trans);

    Trans.$inject = [
        'CripManagerTranslations'
    ];

    function Trans(Translations) {
        var translations = {};

        return function (key) {
            if (key) {
                return translations[key];
            }

            return {
                init: function () {
                    translations = Translations.get();
                }
            }
        };
    }

})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CreateFolderService', CreateFolderService);

    CreateFolderService.$inject = [
        'Dir', 'CripManagerBreadcrumb', 'CripManagerContent', 'RenameService'
    ];

    function CreateFolderService(Dir, Breadcrumb, Content, Rename) {
        var create = {
            _createInProgress: false,
            canCreateFolder: canCreateFolder,
            createFolder: createFolder
        };

        return create;

        /**
         * Check is folder can be created
         *
         * @returns {boolean}
         */
        function canCreateFolder() {
            return !create._createInProgress
        }

        /**
         * Create new folder
         *
         * @param {string} name
         * @param {function} [callback]
         */
        function createFolder(name, callback) {
            if (!canCreateFolder())
                return false;

            create._createInProgress = true;

            Dir.create(Breadcrumb.current(), {name: name}, function (r) {
                create._createInProgress = false;

                // Notify controllers to handle UI changes
                Content.add(r);
                Content.selectSingle(r);
                if (ng.isDefined(callback) && ng.isFunction(callback)) {
                    callback(r);
                }
            });
        }

    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('DeleteService', DeleteService);

    function DeleteService() {
        return {
            canDelete: canDelete,
            delete: deleteItem
        };

        /**
         * Check are the item deletable
         *
         * @param {boolean|object} item
         * @param {boolean} item.isDirUp
         * @returns {boolean}
         */
        function canDelete(item) {
            if (!item)
                return false;

            return !item.isDirUp;
        }

        /**
         * Delete item
         *
         * @param {object} item
         * @param {object} [event]
         * @returns {boolean}
         */
        function deleteItem(item) {
            if (!canDelete(item))
                return false;

            return item.delete();
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('RenameService', RenameService);

    function RenameService() {
        return {
            canRename: canRename,
            enableRename: enableRename,
            rename: rename
        };


        /**
         * Check is the item can be renamed
         *
         * @param {boolean|object} item
         * @param {boolean} item.isDirUp
         * @returns {boolean}
         */
        function canRename(item) {
            if (!item)
                return false;

            return !item.isDirUp;
        }

        /**
         * Enable item rename
         *
         * @param {boolean|object} item
         * @param {string} item.identifier
         * @param {boolean} item.rename
         * @returns {boolean}
         */
        function enableRename(item) {
            if (!canRename(item))
                return false;

            return (item.rename = true);
        }

        /**
         * Rename item
         *
         * @param {boolean|object} item
         * @param {function} item.update
         * @returns {boolean}
         */
        function rename(item) {
            if (!canRename(item))
                return false;

            return item.update();
        }

    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('SelectService', SelectService);

    function SelectService() {
        var select = {
            selected: [],
            select: selectItem,
            selectSingle: selectSingleItem,
            deselect: deselectSelectedItems,
            isSelected: isSelectedItem,
            isSelectedOne: isSelectedOneItem,
            isSelectedAny: isSelectedAnyItem,
            getSelectedItem: getSelectedItem,
            getSelectedItems: getSelectedItems,
            updateSelected: updateSelectedItems
        };

        return select;

        /**
         * Determines is any item selected
         *
         * @returns {boolean}
         */
        function isSelectedAnyItem() {
            return !!select.selected.length;
        }

        /**
         * Determines is item in selected items collection
         *
         * @param {object} item
         * @returns {boolean}
         */
        function isSelectedItem(item) {
            if (!isSelectedAnyItem())
                return false;

            var isSelected = false;

            ng.forEach(select.selected, function (selected_item) {
                if (ng.equals(item, selected_item)) {
                    isSelected = true;
                }
            });

            return isSelected;
        }

        /**
         * Determines is selected only one item
         *
         * @returns {boolean}
         */
        function isSelectedOneItem() {
            return select.selected.length === 1;
        }

        /**
         * Get single selected item
         *
         * @returns {object|boolean}
         */
        function getSelectedItem() {
            if (!isSelectedOneItem())
                return false;

            return select.selected[0];
        }

        /**
         * Get all selected items
         *
         * @returns {Array}
         */
        function getSelectedItems() {
            return select.selected;
        }

        /**
         * Add item to collection of selected items
         *
         * @param {object} item
         */
        function selectItem(item) {
            select.selected.push(item);
        }

        /**
         * Deselect all selected items and update changes in them
         */
        function deselectSelectedItems() {
            updateSelectedItems();
            select.selected.splice(0, select.selected.length);
        }

        /**
         * Deselect all selected items and add this one as selected
         *
         * @param {object} item
         */
        function selectSingleItem(item) {
            deselectSelectedItems();
            selectItem(item);
        }

        /**
         * Update changes in selected items
         */
        function updateSelectedItems() {
            ng.forEach(getSelectedItems(), function (item) {
                item.update();
            });
        }

    }
})(angular, window.crip);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL0FjdGlvbnNDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvQnJlYWRjcnVtYkNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9EaXJDb250ZW50Q29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL0l0ZW1Db250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvSXRlbVByb3BlcnRpZXNDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvUm9vdENvbnRyb2xsZXIuanMiLCJyZXNvdXJjZXMvRGlyLmpzIiwicmVzb3VyY2VzL1RyYW5zbGF0aW9ucy5qcyIsInNlcnZpY2VzL0FjdGlvbnMuanMiLCJzZXJ2aWNlcy9CcmVhZGNydW1iLmpzIiwic2VydmljZXMvQ29udGVudC5qcyIsInNlcnZpY2VzL0l0ZW1TZXJ2aWNlLmpzIiwic2VydmljZXMvTG9jYXRpb24uanMiLCJzZXJ2aWNlcy9UcmFucy5qcyIsInNlcnZpY2VzL2FjdGlvbnMvQ3JlYXRlRm9sZGVyU2VydmljZS5qcyIsInNlcnZpY2VzL2FjdGlvbnMvRGVsZXRlU2VydmljZS5qcyIsInNlcnZpY2VzL2FjdGlvbnMvUmVuYW1lU2VydmljZS5qcyIsInNlcnZpY2VzL2NvbnRlbnQvU2VsZWN0U2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmlsZS1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXIgPSBuZy5tb2R1bGUoJ2NyaXAuZmlsZS1tYW5hZ2VyJywgW1xyXG4gICAgICAgICdjcmlwLmNvcmUnLFxyXG4gICAgICAgICdhbmd1bGFyLWxvYWRpbmctYmFyJyxcclxuICAgICAgICAnYW5ndWxhckZpbGVVcGxvYWQnLFxyXG4gICAgICAgICduZ0Nvb2tpZXMnLFxyXG4gICAgICAgICduZ1Jlc291cmNlJyxcclxuICAgICAgICAnbmdTYW5pdGl6ZScsXHJcbiAgICAgICAgJ3VpLmJvb3RzdHJhcCcsXHJcbiAgICAgICAgJ3VpLW5vdGlmaWNhdGlvbicsXHJcbiAgICAgICAgJ2lvLmRlbm5pcy5jb250ZXh0bWVudSdcclxuICAgIF0pXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgJCwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAucnVuKFJ1bik7XHJcblxyXG4gICAgUnVuLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJ1bigkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdmFyICRzZXR0aW5ncyA9ICQoJyNzZXR0aW5ncycpLFxyXG4gICAgICAgICAgICBiYXNlX3VybCA9ICRzZXR0aW5ncy5kYXRhKCdiYXNlLXVybCcpLFxyXG4gICAgICAgICAgICBpbWdfc2l6ZXMgPSBKU09OLnBhcnNlKCRzZXR0aW5ncy5kYXRhKCdzaXplcycpLnJlcGxhY2VBbGwoXCInXCIsICdcIicpKTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS5maXJlQnJvYWRjYXN0ID0gYnJvYWRjYXN0O1xyXG4gICAgICAgICRyb290U2NvcGUuYmFzZVVybCA9IGJhc2VVcmw7XHJcbiAgICAgICAgJHJvb3RTY29wZS5pbWdTaXplcyA9IGltZ1NpemVzO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgcGx1Z2luIGRpciBhY3Rpb24gdXJsXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFthY3Rpb25dXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICAkcm9vdFNjb3BlLmRpclVybCA9IGZ1bmN0aW9uIChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdkaXInLCBkaXIsIGFjdGlvbik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHBsdWdpbiBmaWxlIGFjdGlvbiB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICRyb290U2NvcGUuZmlsZVVybCA9IGZ1bmN0aW9uIChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdmaWxlJywgZGlyLCBhY3Rpb24pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmUgZXZlbnQgb24gcm9vdCBzY29wZSBmb3IgYWxsIGNvbnRyb2xsZXJzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdChldmVudE5hbWUsIGFyZ3MpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KGV2ZW50TmFtZSwgYXJncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vdFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGlvblVybChyb290LCBkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IHJvb3QgKyAnLyc7XHJcbiAgICAgICAgICAgIGlmIChuZy5pc0RlZmluZWQoYWN0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0aCArPSBhY3Rpb24gKyAnLydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXRoICs9IGRpcjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlVXJsKHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHBsdWdpbiBiYXNlIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJhc2VVcmwocGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZV91cmwgKyBwYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW1nU2l6ZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWdfc2l6ZXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgJCwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignQWN0aW9uc0NvbnRyb2xsZXInLCBBY3Rpb25zQ29udHJvbGxlcik7XHJcblxyXG4gICAgQWN0aW9uc0NvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHNjb3BlJywgJyR1aWJNb2RhbCcsICdmb2N1cycsICdDcmlwTWFuYWdlckFjdGlvbnMnLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyTG9jYXRpb24nXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEFjdGlvbnNDb250cm9sbGVyKCRzY29wZSwgJHVpYk1vZGFsLCBmb2N1cywgQWN0aW9ucywgQ29udGVudCwgTG9jYXRpb24pIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNhbkRlbGV0ZVNlbGVjdGVkID0gY2FuRGVsZXRlU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5kZWxldGVTZWxlY3RlZCA9IGRlbGV0ZVNlbGVjdGVkO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNhbkNyZWF0ZUZvbGRlciA9IGNhbkNyZWF0ZUZvbGRlcjtcclxuICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUZvbGRlciA9IGNyZWF0ZUZvbGRlcjtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jYW5SZW5hbWVTZWxlY3RlZCA9IGNhblJlbmFtZVNlbGVjdGVkO1xyXG4gICAgICAgICAgICAkc2NvcGUuZW5hYmxlUmVuYW1lU2VsZWN0ZWQgPSBlbmFibGVSZW5hbWVTZWxlY3RlZDtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jYW5PcGVuU2VsZWN0ZWQgPSBjYW5PcGVuU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5vcGVuU2VsZWN0ZWQgPSBvcGVuU2VsZWN0ZWQ7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuaGFzUHJvcGVydGllcyA9IGhhc1Byb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICRzY29wZS5vcGVuUHJvcGVydGllcyA9IG9wZW5Qcm9wZXJ0aWVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBzZWxlY3RlZCBpdGVtIGNhbiBiZSBkZWxldGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjYW5EZWxldGVTZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbnMuY2FuRGVsZXRlKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlIHNlbGVjdGVkIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVTZWxlY3RlZCgkZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gaWYgZXZlbnQgaXMgcHJlc2VudGVkLCBzdG9wIGl0IHByb3BhZ2F0aW9uXHJcbiAgICAgICAgICAgIGlmIChuZy5pc0RlZmluZWQoJGV2ZW50KSAmJiBuZy5pc0RlZmluZWQoJGV2ZW50LnN0b3BQcm9wYWdhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQWN0aW9ucy5kZWxldGUoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgICAgIENvbnRlbnQuZGVzZWxlY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaWYgY2FuIGNyZWF0ZSBuZXcgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjYW5DcmVhdGVGb2xkZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25zLmNhbkNyZWF0ZUZvbGRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlIG5ldyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRm9sZGVyKG5hbWUpIHtcclxuICAgICAgICAgICAgQWN0aW9ucy5jcmVhdGVGb2xkZXIobmFtZSwgZW5hYmxlUmVuYW1lU2VsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBzZWxlY3RlZCBpdGVtIGNhbiBiZSByZW5hbWVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjYW5SZW5hbWVTZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbnMuY2FuUmVuYW1lKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRW5hYmxlIHJlbmFtZSBmb3Igc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICRldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZVNlbGVjdGVkKCRldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBldmVudCBpcyBwcmVzZW50ZWQsIHN0b3AgaXQgcHJvcGFnYXRpb25cclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZCgkZXZlbnQpICYmIG5nLmlzRGVmaW5lZCgkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgQWN0aW9ucy5lbmFibGVSZW5hbWUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBmb2N1cygnI3tpZGVudGlmaWVyfSBpbnB1dFtuYW1lPVwibmFtZVwiXScuc3VwcGxhbnQoaXRlbSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIGNhbiBvcGVuIHNlbGVjdGVkIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbk9wZW5TZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkuaXNEaXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPcGVuIHNlbGVjdGVkIGRpcmVjdG9yeVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG9wZW5TZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgaWYgKCFjYW5PcGVuU2VsZWN0ZWQoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIExvY2F0aW9uLmNoYW5nZShDb250ZW50LmdldFNlbGVjdGVkSXRlbSgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgc2VsZWN0ZWQgaXRlbSBjYW4gcHJvdmlkZSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNQcm9wZXJ0aWVzKCkge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaXRlbSAmJiAhaXRlbS5pc0RpclVwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlblByb3BlcnRpZXMoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICghaGFzUHJvcGVydGllcygpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdpdGVtLXByb3BlcnRpZXMtbW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSXRlbVByb3BlcnRpZXNDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0JyZWFkY3J1bWJDb250cm9sbGVyJywgQnJlYWRjcnVtYkNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJyZWFkY3J1bWJDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRzY29wZScsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJMb2NhdGlvbidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQnJlYWRjcnVtYkNvbnRyb2xsZXIoJHNjb3BlLCBCcmVhZGNydW1iLCBMb2NhdGlvbikge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ29UbyA9IGdvVG87XHJcbiAgICAgICAgICAgICRzY29wZS5nb1RvUm9vdCA9IGdvVG9Sb290O1xyXG4gICAgICAgICAgICAkc2NvcGUuYnJlYWRjcnVtYkhhc0l0ZW1zID0gYnJlYWRjcnVtYkhhc0l0ZW1zO1xyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0QnJlYWRjcnVtYkl0ZW1zID0gZ2V0QnJlYWRjcnVtYkl0ZW1zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR28gdG8gc3BlY2lmaWVkIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGZvbGRlclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXIuZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlci5uYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ29Ubyhmb2xkZXIpIHtcclxuICAgICAgICAgICAgTG9jYXRpb24uY2hhbmdlKGZvbGRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHbyB0byByb290IGZvbGRlciBsb2NhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdvVG9Sb290KCkge1xyXG4gICAgICAgICAgICBnb1RvKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIEJyZWFkY3J1bWIgYW55IGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJyZWFkY3J1bWJIYXNJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyZWFkY3J1bWIuaGFzSXRlbXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBCcmVhZGNydW1iIGl0ZW0gY29sbGVjdGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEJyZWFkY3J1bWJJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyZWFkY3J1bWIuaXRlbXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignRGlyQ29udGVudENvbnRyb2xsZXInLCBEaXJDb250ZW50Q29udHJvbGxlcik7XHJcblxyXG4gICAgRGlyQ29udGVudENvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnQ3JpcE1hbmFnZXJDb250ZW50J1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBEaXJDb250ZW50Q29udHJvbGxlcigkbG9nLCAkc2NvcGUsIENvbnRlbnQpIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlckZpbHRlciA9IGZvbGRlckZpbHRlcjtcclxuICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0ge1xyXG4gICAgICAgICAgICAgICAgYnk6IG9yZGVyQnksXHJcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2Z1bGxfbmFtZScsXHJcbiAgICAgICAgICAgICAgICBpc1JldmVyc2U6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bGxfbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLmZpbHRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1lZGlhOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmaWxlOiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuZ2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9yZGVyQnkoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgdGV4dCA9ICd6IHtmaWVsZH0nO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgLy8gZGlyIHVwIHNob3VsZCBiZSBvbiBmaXJzdCBwbGFjZVxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXNEaXJVcClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJzAge2ZpZWxkfSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vJGxvZy5pbmZvKCRzY29wZS5vcmRlci5maWVsZCwgdGV4dC5zdXBwbGFudCh7ZmllbGQ6IGl0ZW1bJHNjb3BlLm9yZGVyLmZpZWxkXX0pLCBpdGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHQuc3VwcGxhbnQoe2ZpZWxkOiBpdGVtWyRzY29wZS5vcmRlci5maWVsZF19KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvbGRlckZpbHRlcih2YWx1ZSwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgIC8vIElmIGl0ZW0gaXMgZGlyLCBpdCB3aWxsIGJlIHZpc2libGVcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzRGlyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZmlsdGVyIGVuYWJsZSBwcm9wZXJ0eSBhbmQgY2hlY2sgaXQgaGVyZVxyXG4gICAgICAgICAgICBpZih0cnVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5maWx0ZXJzW3ZhbHVlLnR5cGVdO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgZmlsdGVyIGVuYWJsZSBwcm9wZXJ0eSBpcyBkaXNhYmxlZCwgY29tcGFyZSB3aXRoIGFsbG93ZWQgdHlwZVxyXG4gICAgICAgICAgICAvL2lmIChTZXR0aW5ncy5nZXRUeXBlKCkgPT0gdmFsdWUudHlwZSlcclxuICAgICAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0l0ZW1Db250cm9sbGVyJywgSXRlbUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEl0ZW1Db250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJ2ZvY3VzJywgJ0NyaXBNYW5hZ2VyQ29udGVudCcsICdDcmlwTWFuYWdlckxvY2F0aW9uJywgJ0NyaXBNYW5hZ2VyQWN0aW9ucydcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gSXRlbUNvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCBmb2N1cywgQ29udGVudCwgTG9jYXRpb24sIEFjdGlvbnMpIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNsaWNrID0gY2xpY2s7XHJcbiAgICAgICAgICAgICRzY29wZS5kYmxjbGljayA9IGRibGNsaWNrO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5lbmFibGVSZW5hbWUgPSBlbmFibGVSZW5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPbiBpdGVtIGNsaWNrXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZVxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xpY2soZSwgaXRlbSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgQ29udGVudC51cGRhdGVTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICBDb250ZW50LmRlc2VsZWN0KCk7XHJcbiAgICAgICAgICAgIENvbnRlbnQuc2VsZWN0U2luZ2xlKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT24gaXRlbSBkb3VibGUgY2xpY2tcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBlXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkYmxjbGljayhlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICRsb2cuaW5mbygnZGJsY2xpY2snLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyKSB7XHJcbiAgICAgICAgICAgICAgICBMb2NhdGlvbi5jaGFuZ2UoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgaXRlbSBzZWxlY3RlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc1NlbGVjdGVkKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuaXNTZWxlY3RlZChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVuYWJsZSBpdGVtIHJlbmFtZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICRldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZSgkZXZlbnQpIHtcclxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCk7XHJcbiAgICAgICAgICAgIEFjdGlvbnMuZW5hYmxlUmVuYW1lKGl0ZW0pO1xyXG4gICAgICAgICAgICBmb2N1cygnI3tpZGVudGlmaWVyfSBpbnB1dFtuYW1lPVwibmFtZVwiXScuc3VwcGxhbnQoaXRlbSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0l0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcicsIEl0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcik7XHJcblxyXG4gICAgSXRlbVByb3BlcnRpZXNDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyR1aWJNb2RhbEluc3RhbmNlJywgJ0NyaXBNYW5hZ2VyVHJhbnMnLCAnaXRlbSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gSXRlbVByb3BlcnRpZXNDb250cm9sbGVyKCRsb2csICRzY29wZSwgJHVpYk1vZGFsSW5zdGFuY2UsIFRyYW5zLCBpdGVtKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRsb2cuaW5mbyhpdGVtKTtcclxuICAgICAgICAgICAgJHNjb3BlLml0ZW0gPSByZXNvbHZlSXRlbURldGFpbHMoaXRlbSk7XHJcbiAgICAgICAgICAgICRzY29wZS50aHVtYiA9IGl0ZW0udGh1bWI7XHJcbiAgICAgICAgICAgICRzY29wZS5uYW1lID0gaXRlbS5mdWxsX25hbWU7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2UgPSBjbG9zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhpZGUgbW9kYWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICAgICAgJHVpYk1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlc29sdmUgaXRlbSBkZXRhaWxzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlSXRlbURldGFpbHMoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVEaXJEZXRhaWxzKGl0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVGaWxlRGV0YWlscyhpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGl0ZW0gZGVmYXVsdCBkZXRhaWxzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBkZXRhaWxzXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXRlbS5mdWxsX25hbWVcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXRlbS5kYXRlXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlbS5nZXRTaXplXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGVmYXVsdERldGFpbHMoZGV0YWlscywgaXRlbSkge1xyXG4gICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX3R5cGUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2ZpbGVfdHlwZV8nICsgaXRlbS50eXBlKVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX25hbWUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmZ1bGxfbmFtZVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2RhdGUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRhdGVcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplJyksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5nZXRTaXplKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNvbHZlIGZvbGRlciBkZXRhaWxzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlRGlyRGV0YWlscyhpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXRhaWxzID0gW107XHJcbiAgICAgICAgICAgIGRlZmF1bHREZXRhaWxzKGRldGFpbHMsIGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNvbHZlIGZpbGUgZGV0YWlsc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZUZpbGVEZXRhaWxzKGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRldGFpbHMgPSBbXTtcclxuICAgICAgICAgICAgZGVmYXVsdERldGFpbHMoZGV0YWlscywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbS5kaXIgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfaXRlbV9kaXInKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kaXJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX2V4dGVuc2lvbicpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZXh0XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2ltYWdlJykge1xyXG5cclxuICAgICAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX3VybCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnPGEgaHJlZj1cInt1cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3RpdGxlfTwvYT4nLnN1cHBsYW50KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpdGVtLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfc2l6ZV9kaW0nKS5zdXBwbGFudChpdGVtLmRpbWVuc2lvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG5nLmZvckVhY2goJHNjb3BlLmltZ1NpemVzKCksIGZ1bmN0aW9uIChhcnIsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemVfdXJsX3RpdGxlJykuc3VwcGxhbnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplX2tleV8nICsgc2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnPGEgaHJlZj1cInt1cmx9P3RodW1iPXtzaXplfVwiIHRhcmdldD1cIl9ibGFua1wiPnt0aXRsZX08L2E+Jy5zdXBwbGFudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGl0ZW0udXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemVfZGltJykuc3VwcGxhbnQoYXJyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfaXRlbV91cmwnKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJzxhIGhyZWY9XCJ7dXJsfVwiIHRhcmdldD1cIl9ibGFua1wiPntmdWxsX25hbWV9PC9hPicuc3VwcGxhbnQoaXRlbSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSb290Q29udHJvbGxlcicsIFJvb3RDb250cm9sbGVyKTtcclxuXHJcbiAgICBSb290Q29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckc2NvcGUnLCAnQ3JpcE1hbmFnZXJMb2NhdGlvbicsICdDcmlwTWFuYWdlckNvbnRlbnQnLCAnQ3JpcE1hbmFnZXJUcmFucydcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gUm9vdENvbnRyb2xsZXIoJHNjb3BlLCBMb2NhdGlvbiwgQ29udGVudCwgVHJhbnMpIHtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgIC8vIGluaXRpYWxpc2UgZmlsZSBtYW5hZ2VyIGluaXRpYWwgbG9jYXRpb24gYW5kIGxvYWQgdHJhbnNsYXRpb25zXHJcbiAgICAgICAgICAgIFRyYW5zKCkuaW5pdCgpO1xyXG4gICAgICAgICAgICBMb2NhdGlvbi5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZGVzZWxlY3QgPSBkZXNlbGVjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlc2VsZWN0KCkge1xyXG4gICAgICAgICAgICBDb250ZW50LmRlc2VsZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHJlc291cmNlJywgJyRyb290U2NvcGUnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpcigkcmVzb3VyY2UsICRyb290U2NvcGUpIHtcclxuICAgICAgICByZXR1cm4gJHJlc291cmNlKCRyb290U2NvcGUuZGlyVXJsKCc6ZGlyLzpuYW1lJyksIHtcclxuICAgICAgICAgICAgZGlyOiAnQGRpcicsXHJcbiAgICAgICAgICAgIG5hbWU6ICdAbmFtZSdcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICdjcmVhdGUnOiB7dXJsOiAkcm9vdFNjb3BlLmRpclVybCgnOmRpci86bmFtZScsICdjcmVhdGUnKSwgbWV0aG9kOiAnUE9TVCd9LFxyXG4gICAgICAgICAgICAnZGVsZXRlRGlyJzoge3VybDogJHJvb3RTY29wZS5kaXJVcmwoJzpkaXInLCAnZGVsZXRlJyksIG1ldGhvZDogJ0dFVCd9LFxyXG4gICAgICAgICAgICAnZGVsZXRlRmlsZSc6IHt1cmw6ICRyb290U2NvcGUuZmlsZVVybCgnOmRpci86bmFtZScsICdkZWxldGUnKSwgbWV0aG9kOiAnR0VUJ30sXHJcbiAgICAgICAgICAgICdyZW5hbWVEaXInOiB7dXJsOiAkcm9vdFNjb3BlLmRpclVybCgnOmRpcicsICdyZW5hbWUnKSwgbWV0aG9kOiAnR0VUJ30sXHJcbiAgICAgICAgICAgICdyZW5hbWVGaWxlJzoge3VybDogJHJvb3RTY29wZS5maWxlVXJsKCc6ZGlyJywgJ3JlbmFtZScpLCBtZXRob2Q6ICdHRVQnfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyVHJhbnNsYXRpb25zJywgVHJhbnNsYXRpb25zKTtcclxuXHJcbiAgICBUcmFuc2xhdGlvbnMuJGluamVjdCA9IFtcclxuICAgICAgICAnJHJlc291cmNlJywgJyRyb290U2NvcGUnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRyYW5zbGF0aW9ucygkcmVzb3VyY2UsICRyb290U2NvcGUpIHtcclxuICAgICAgICByZXR1cm4gJHJlc291cmNlKCRyb290U2NvcGUuYmFzZVVybCgndHJhbnNsYXRpb25zJykpO1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJBY3Rpb25zJywgQWN0aW9ucyk7XHJcblxyXG4gICAgQWN0aW9ucy4kaW5qZWN0ID0gW1xyXG4gICAgICAgICdDcmVhdGVGb2xkZXJTZXJ2aWNlJywgJ0RlbGV0ZVNlcnZpY2UnLCAnUmVuYW1lU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQWN0aW9ucyhDcmVhdGVGb2xkZXIsIERlbGV0ZSwgUmVuYW1lKSB7XHJcbiAgICAgICAgdmFyIHNjb3BlID0ge307XHJcbiAgICAgICAgbmcuZXh0ZW5kKHNjb3BlLCBDcmVhdGVGb2xkZXIsIERlbGV0ZSwgUmVuYW1lKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNjb3BlO1xyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCBCcmVhZGNydW1iKTtcclxuXHJcbiAgICBCcmVhZGNydW1iLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCcmVhZGNydW1iKCkge1xyXG4gICAgICAgIHZhciBicmVhZGNydW1iID0ge1xyXG4gICAgICAgICAgICBpdGVtczogW10sXHJcbiAgICAgICAgICAgIGhhc0l0ZW1zOiBoYXNJdGVtcyxcclxuICAgICAgICAgICAgY3VycmVudDogY3VycmVudCxcclxuICAgICAgICAgICAgc2V0OiBzZXRMb2NhdGlvblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBicmVhZGNydW1iO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgY3VycmVudCBmb2xkZXIgbG9jYXRpb24gb2JqZWN0XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGN1cnJlbnQoKSB7XHJcbiAgICAgICAgICAgIGlmIChicmVhZGNydW1iLml0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtkaXI6ICcnLCBuYW1lOiAnJ307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBicmVhZGNydW1iLml0ZW1zW2JyZWFkY3J1bWIuaXRlbXMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyB0aGVyZSBhbnkgaXRlbSBpbiBicmVhZGNydW1iXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgbmV3IGxvY2F0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZm9sZGVyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlci5kaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLm5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzZXRMb2NhdGlvbihmb2xkZXIpIHtcclxuICAgICAgICAgICAgb25Mb2NhdGlvbkNoYW5nZSh7ZGlyOiBmb2xkZXIuZGlyLCBuYW1lOiBmb2xkZXIubmFtZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIGJyZWFkY3J1bWIgYXJyYXkgd2hlbiBtYW5hZ2VyIHByb3BlcnR5IGlzIGNoYW5nZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2YWxcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsLmRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwubmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG9uTG9jYXRpb25DaGFuZ2UodmFsKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHJpbmdfdmFsdWUgPSB2YWwuZGlyIHx8ICcnO1xyXG4gICAgICAgICAgICBicmVhZGNydW1iLml0ZW1zLnNwbGljZSgwLCBicmVhZGNydW1iLml0ZW1zLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFsLm5hbWUgIT09ICcnICYmIHZhbC5uYW1lICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJpbmdfdmFsdWUgKz0gJy8nICsgdmFsLm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5nLmZvckVhY2goc3RyaW5nX3ZhbHVlLnNwbGl0KCdcXC8nKSwgZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2ICE9PSAnJyAmJiB2ICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBjdXJyZW50IGRpciBmcm9tIHByZXZpb3VzIGl0ZW0sIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXIgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIG9ubHkgb25lIHByZXZpb3VzIGl0ZW0sIHVzZSBpdGBzIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXIgPSBicmVhZGNydW1iLml0ZW1zWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXIgd2F5LCBjb25jYXQgcHJldiBkaXIgd2l0aCBuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyID0gJ3tkaXJ9L3tuYW1lfScuc3VwcGxhbnQoYnJlYWRjcnVtYi5pdGVtc1ticmVhZGNydW1iLml0ZW1zLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWRjcnVtYi5pdGVtcy5wdXNoKHtuYW1lOiB2LCBkaXI6IGRpciwgaXNBY3RpdmU6IGZhbHNlfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gbWFyayBsYXN0IGl0ZW0gYXMgYWN0aXZlLCB0aGlzIHdpbGwgaGVscCBtYXJrIGl0ZW0gYXMgYWN0aXZlXHJcbiAgICAgICAgICAgIGlmIChicmVhZGNydW1iLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFkY3J1bWIuaXRlbXNbYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggLSAxXS5pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlckNvbnRlbnQnLCBDb250ZW50KTtcclxuXHJcbiAgICBDb250ZW50LiRpbmplY3QgPSBbJ0l0ZW1TZXJ2aWNlJywgJ1NlbGVjdFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb250ZW50KEl0ZW1TZXJ2aWNlLCBTZWxlY3RTZXJ2aWNlKSB7XHJcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgZ2V0OiBnZXRJdGVtcyxcclxuICAgICAgICAgICAgYWRkOiBhZGQsXHJcbiAgICAgICAgICAgIHJlbW92ZTogcmVtb3ZlLFxyXG4gICAgICAgICAgICByZW1vdmVJdGVtczogcmVtb3ZlSXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBuZy5leHRlbmQoY29udGVudCwgU2VsZWN0U2VydmljZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjb250ZW50O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgYWxsIGNvbnRlbnQgaXRlbXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQuaXRlbXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmUgYWxsIGl0ZW1zIGluIGNvbnRlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVJdGVtcygpIHtcclxuICAgICAgICAgICAgY29udGVudC5pdGVtcy5zcGxpY2UoMCwgY29udGVudC5pdGVtcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIGl0ZW0gdG8gY29udGVudFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhZGQoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIW5nLmlzRGVmaW5lZChpdGVtLmlzX2V4dGVuZGVkKSkge1xyXG4gICAgICAgICAgICAgICAgSXRlbVNlcnZpY2UuZXh0ZW5kSXRlbShpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29udGVudC5pdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIHNpbmdsZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuaXRlbXMuc3BsaWNlKGNvbnRlbnQuaXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnSXRlbVNlcnZpY2UnLCBJdGVtU2VydmljZSk7XHJcblxyXG4gICAgSXRlbVNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcm9vdFNjb3BlJywgJ0NyaXBNYW5hZ2VyVHJhbnMnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEl0ZW1TZXJ2aWNlKCRsb2csICRyb290U2NvcGUsIFRyYW5zKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2V4dGVuZCc6IGV4dGVuZCxcclxuICAgICAgICAgICAgJ2V4dGVuZEl0ZW0nOiBleHRlbmRJdGVtXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXh0ZW5kIERpciByZXNvdXJjZSByZXF1ZXN0IHJlc3BvbnNlIHdpdGggcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSByZXNvdXJjZURhdGFcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmQocmVzb3VyY2VEYXRhKSB7XHJcbiAgICAgICAgICAgIG5nLmV4dGVuZChyZXNvdXJjZURhdGEsIHtcclxuICAgICAgICAgICAgICAgICdnZXRJdGVtcyc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBuZy5mb3JFYWNoKHJlc291cmNlRGF0YSwgZnVuY3Rpb24gKHYsIGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kSXRlbSh2LCBrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoKHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGl0ZW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlIFVJIGlkIGZvciBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpZEdlbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdsaXN0LWl0ZW0tJyArIGtleTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBrZXkgZnJvbSBpZGVudGlmaWVyIChyZXZlcnNlIG1ldGhvZCBmcm9tIGlkR2VuKVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkZW50aWZpZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEtleShpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyLnN1YnN0cmluZygxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpcihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtICYmIG5nLmlzRGVmaW5lZChpdGVtLnR5cGUpICYmIGl0ZW0udHlwZSA9PT0gJ2Rpcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhbiBhIGZvbGRlciB1cFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpclVwKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGlyKGl0ZW0pICYmIChpdGVtLm5hbWUgPT0gJycgfHwgaXRlbS5uYW1lID09IG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXh0ZW5kIHNpbmdsZSBpdGVtIHdpdGggcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIGtleVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGV4dGVuZEl0ZW0oaXRlbSwga2V5KSB7XHJcbiAgICAgICAgICAgIG5nLmV4dGVuZChpdGVtLCB7XHJcbiAgICAgICAgICAgICAgICBpc19leHRlbmRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlbmFtZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpZGVudGlmaWVyOiBpZEdlbihrZXkpLFxyXG4gICAgICAgICAgICAgICAgaXNEaXI6IGlzRGlyKGl0ZW0pLFxyXG4gICAgICAgICAgICAgICAgaXNEaXJVcDogaXNEaXJVcChpdGVtKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgICAgICAgICAgICAgZGVsZXRlOiBkZWxldGVJdGVtLFxyXG4gICAgICAgICAgICAgICAgZ2V0RnVsbE5hbWU6IGdldEZ1bGxOYW1lLFxyXG4gICAgICAgICAgICAgICAgc2F2ZU5ld05hbWU6IHNhdmVOZXdOYW1lLFxyXG4gICAgICAgICAgICAgICAgZ2V0U2l6ZTogZ2V0U2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBpdGVtIGNoYW5nZXMgaWYgdGhleSBhcmUgcHJlc2VudGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7aXRlbX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbmFtZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5ld05hbWUoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGl0ZW0gbmFtZSAoaWdub3JpbmcgZnVsbF9uYW1lIHByb3BlcnR5IHZhbHVlKVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRGdWxsTmFtZSgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXIgfHwgdGhpcy5leHQgPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICd7bmFtZX0ue2V4dH0nLnN1cHBsYW50KHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2F2ZSBpdGVtIG5hbWUgaWYgaXQgaXMgY2hhbmdlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNhdmVOZXdOYW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBnZXRLZXkoc2VsZi5pZGVudGlmaWVyKTtcclxuICAgICAgICAgICAgc2VsZi5yZW5hbWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHNlbGYuZnVsbF9uYW1lICE9PSBzZWxmLmdldEZ1bGxOYW1lKCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZXRob2QgPSBzZWxmLmlzRGlyID8gJyRyZW5hbWVEaXInIDogJyRyZW5hbWVGaWxlJztcclxuICAgICAgICAgICAgICAgIHNlbGZbbWV0aG9kXSh7XHJcbiAgICAgICAgICAgICAgICAgICAgJ29sZCc6IHNlbGYuZnVsbF9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICduZXcnOiBzZWxmLmdldEZ1bGxOYW1lKClcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5nLmV4dGVuZChzZWxmLCBleHRlbmRJdGVtKHJlc3BvbnNlLCBrZXkpKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBpdGVtIGRldGVjdGluZyBpdCB0eXBlIChmaWxlIG9yIGRpcilcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVJdGVtKCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gdGhpcy5pc0RpciA/ICckZGVsZXRlRGlyJyA6ICckZGVsZXRlRmlsZSc7XHJcbiAgICAgICAgICAgIHRoaXNbbWV0aG9kXSh7bmFtZTogdGhpcy5mdWxsX25hbWV9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB1c2VyIGZyaWVuZGx5IGl0ZW0gc2l6ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNpemUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNpemUudG9CeXRlcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlckxvY2F0aW9uJywgQ2hhbmdlTG9jYXRpb25TZXJ2aWNlKTtcclxuXHJcbiAgICBDaGFuZ2VMb2NhdGlvblNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnJGNvb2tpZXMnLCAnRGlyJywgJ0l0ZW1TZXJ2aWNlJywgJ0NyaXBNYW5hZ2VyQnJlYWRjcnVtYicsICdDcmlwTWFuYWdlckNvbnRlbnQnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENoYW5nZUxvY2F0aW9uU2VydmljZSgkY29va2llcywgRGlyLCBJdGVtU2VydmljZSwgQnJlYWRjcnVtYiwgQ29udGVudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluaXQ6IGluaXRpYWxMb2FkLFxyXG4gICAgICAgICAgICBjaGFuZ2U6IGNoYW5nZSxcclxuICAgICAgICAgICAgY3VycmVudDoge31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGFuZ2UgbG9jYXRpb24gdG8gaW5pdGlhbCBmb2xkZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpbml0aWFsTG9hZCgpIHtcclxuICAgICAgICAgICAgY2hhbmdlKGdldExvY2F0aW9uRnJvbUNvb2tpZSgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoYW5nZSBjdXJyZW50IGxvY2F0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW2ZvbGRlcl1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2UoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoID0ge2RpcjogbnVsbCwgbmFtZTogbnVsbH07XHJcbiAgICAgICAgICAgIGlmIChuZy5pc0RlZmluZWQoZm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0aC5kaXIgPSBuZy5pc0VtcHR5KGZvbGRlci5kaXIpID8gbnVsbCA6IGZvbGRlci5kaXI7XHJcbiAgICAgICAgICAgICAgICBwYXRoLm5hbWUgPSBuZy5pc0VtcHR5KGZvbGRlci5uYW1lKSA/IG51bGwgOiBmb2xkZXIubmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGlyLnF1ZXJ5KHBhdGgsIGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb29raWUocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHJlc3BvbnNlIHdpdGggcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIEl0ZW1TZXJ2aWNlLmV4dGVuZChyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgb2xkIGNvbnRlbnRcclxuICAgICAgICAgICAgICAgIENvbnRlbnQucmVtb3ZlSXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkZXNlbGVjdCwgaWYgYW55IGl0ZW0gaXMgc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuZGVzZWxlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGFuZ2UgYnJlYWRjcnVtYiBwYXRoXHJcbiAgICAgICAgICAgICAgICBCcmVhZGNydW1iLnNldChwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgbmV3IGNvbnRlbnRcclxuICAgICAgICAgICAgICAgIG5nLmZvckVhY2goci5nZXRJdGVtcygpLCBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnRlbnQuYWRkKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IG1hbmFnZXIgbGFzdCBsb2NhdGlvbiBmcm9tIGNvb2tpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHt7ZGlyOiBzdHJpbmcsIG5hbWU6IHN0cmluZ319XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb25Gcm9tQ29va2llKCkge1xyXG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSB7ZGlyOiBudWxsLCBuYW1lOiBudWxsfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb29raWVEaXIgPSAkY29va2llcy5nZXQoJ2xvY2F0aW9uLWRpcicpLFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICRjb29raWVzLmdldCgnbG9jYXRpb24tZGlyLW5hbWUnKTtcclxuICAgICAgICAgICAgaWYgKG5nLmhhc1ZhbHVlKGNvb2tpZURpcikgfHwgbmcuaGFzVmFsdWUobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmRpciA9IGNvb2tpZURpcjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUgfHwgbmFtZSA9PT0gJ251bGwnIHx8IG5hbWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIGNvb2tpZXMgZm9yIG5ldyBtYW5hZ2VyIGluc3RhbmNlLCB0byBiZSBvcGVuZWQgaW4gc2FtZSBsb2NhdGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGxvY2F0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uLmRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbi5uYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ29va2llKGxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgICRjb29raWVzLnB1dCgnbG9jYXRpb24tZGlyJywgbG9jYXRpb24uZGlyIHx8ICcnKTtcclxuICAgICAgICAgICAgJGNvb2tpZXMucHV0KCdsb2NhdGlvbi1kaXItbmFtZScsIGxvY2F0aW9uLm5hbWUgfHwgJycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyVHJhbnMnLCBUcmFucyk7XHJcblxyXG4gICAgVHJhbnMuJGluamVjdCA9IFtcclxuICAgICAgICAnQ3JpcE1hbmFnZXJUcmFuc2xhdGlvbnMnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRyYW5zKFRyYW5zbGF0aW9ucykge1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGlvbnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uc1trZXldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyA9IFRyYW5zbGF0aW9ucy5nZXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JlYXRlRm9sZGVyU2VydmljZScsIENyZWF0ZUZvbGRlclNlcnZpY2UpO1xyXG5cclxuICAgIENyZWF0ZUZvbGRlclNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnRGlyJywgJ0NyaXBNYW5hZ2VyQnJlYWRjcnVtYicsICdDcmlwTWFuYWdlckNvbnRlbnQnLCAnUmVuYW1lU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQ3JlYXRlRm9sZGVyU2VydmljZShEaXIsIEJyZWFkY3J1bWIsIENvbnRlbnQsIFJlbmFtZSkge1xyXG4gICAgICAgIHZhciBjcmVhdGUgPSB7XHJcbiAgICAgICAgICAgIF9jcmVhdGVJblByb2dyZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FuQ3JlYXRlRm9sZGVyOiBjYW5DcmVhdGVGb2xkZXIsXHJcbiAgICAgICAgICAgIGNyZWF0ZUZvbGRlcjogY3JlYXRlRm9sZGVyXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgZm9sZGVyIGNhbiBiZSBjcmVhdGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjYW5DcmVhdGVGb2xkZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhY3JlYXRlLl9jcmVhdGVJblByb2dyZXNzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgbmV3IGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRm9sZGVyKG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuQ3JlYXRlRm9sZGVyKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBjcmVhdGUuX2NyZWF0ZUluUHJvZ3Jlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlyLmNyZWF0ZShCcmVhZGNydW1iLmN1cnJlbnQoKSwge25hbWU6IG5hbWV9LCBmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlLl9jcmVhdGVJblByb2dyZXNzID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTm90aWZ5IGNvbnRyb2xsZXJzIHRvIGhhbmRsZSBVSSBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICBDb250ZW50LmFkZChyKTtcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuc2VsZWN0U2luZ2xlKHIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZChjYWxsYmFjaykgJiYgbmcuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0RlbGV0ZVNlcnZpY2UnLCBEZWxldGVTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBEZWxldGVTZXJ2aWNlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNhbkRlbGV0ZTogY2FuRGVsZXRlLFxyXG4gICAgICAgICAgICBkZWxldGU6IGRlbGV0ZUl0ZW1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBhcmUgdGhlIGl0ZW0gZGVsZXRhYmxlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW58b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBpdGVtLmlzRGlyVXBcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjYW5EZWxldGUoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIWl0ZW0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gIWl0ZW0uaXNEaXJVcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbZXZlbnRdXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlSXRlbShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuRGVsZXRlKGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZGVsZXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ1JlbmFtZVNlcnZpY2UnLCBSZW5hbWVTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBSZW5hbWVTZXJ2aWNlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNhblJlbmFtZTogY2FuUmVuYW1lLFxyXG4gICAgICAgICAgICBlbmFibGVSZW5hbWU6IGVuYWJsZVJlbmFtZSxcclxuICAgICAgICAgICAgcmVuYW1lOiByZW5hbWVcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2sgaXMgdGhlIGl0ZW0gY2FuIGJlIHJlbmFtZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGl0ZW0uaXNEaXJVcFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhblJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRW5hYmxlIGl0ZW0gcmVuYW1lXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW58b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGl0ZW0uaWRlbnRpZmllclxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXRlbS5yZW5hbWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBlbmFibGVSZW5hbWUoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIWNhblJlbmFtZShpdGVtKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoaXRlbS5yZW5hbWUgPSB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbmFtZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW58b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gaXRlbS51cGRhdGVcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5hbWUoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIWNhblJlbmFtZShpdGVtKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdTZWxlY3RTZXJ2aWNlJywgU2VsZWN0U2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gU2VsZWN0U2VydmljZSgpIHtcclxuICAgICAgICB2YXIgc2VsZWN0ID0ge1xyXG4gICAgICAgICAgICBzZWxlY3RlZDogW10sXHJcbiAgICAgICAgICAgIHNlbGVjdDogc2VsZWN0SXRlbSxcclxuICAgICAgICAgICAgc2VsZWN0U2luZ2xlOiBzZWxlY3RTaW5nbGVJdGVtLFxyXG4gICAgICAgICAgICBkZXNlbGVjdDogZGVzZWxlY3RTZWxlY3RlZEl0ZW1zLFxyXG4gICAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkSXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZE9uZTogaXNTZWxlY3RlZE9uZUl0ZW0sXHJcbiAgICAgICAgICAgIGlzU2VsZWN0ZWRBbnk6IGlzU2VsZWN0ZWRBbnlJdGVtLFxyXG4gICAgICAgICAgICBnZXRTZWxlY3RlZEl0ZW06IGdldFNlbGVjdGVkSXRlbSxcclxuICAgICAgICAgICAgZ2V0U2VsZWN0ZWRJdGVtczogZ2V0U2VsZWN0ZWRJdGVtcyxcclxuICAgICAgICAgICAgdXBkYXRlU2VsZWN0ZWQ6IHVwZGF0ZVNlbGVjdGVkSXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZWN0O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGFueSBpdGVtIHNlbGVjdGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc1NlbGVjdGVkQW55SXRlbSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhc2VsZWN0LnNlbGVjdGVkLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgaXRlbSBpbiBzZWxlY3RlZCBpdGVtcyBjb2xsZWN0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzU2VsZWN0ZWRJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkQW55SXRlbSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIG5nLmZvckVhY2goc2VsZWN0LnNlbGVjdGVkLCBmdW5jdGlvbiAoc2VsZWN0ZWRfaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5nLmVxdWFscyhpdGVtLCBzZWxlY3RlZF9pdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpc1NlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBzZWxlY3RlZCBvbmx5IG9uZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc1NlbGVjdGVkT25lSXRlbSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdC5zZWxlY3RlZC5sZW5ndGggPT09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgc2luZ2xlIHNlbGVjdGVkIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R8Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZEl0ZW0oKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNTZWxlY3RlZE9uZUl0ZW0oKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Quc2VsZWN0ZWRbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgYWxsIHNlbGVjdGVkIGl0ZW1zXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdC5zZWxlY3RlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZCBpdGVtIHRvIGNvbGxlY3Rpb24gb2Ygc2VsZWN0ZWQgaXRlbXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0SXRlbShpdGVtKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdC5zZWxlY3RlZC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVzZWxlY3QgYWxsIHNlbGVjdGVkIGl0ZW1zIGFuZCB1cGRhdGUgY2hhbmdlcyBpbiB0aGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGVzZWxlY3RTZWxlY3RlZEl0ZW1zKCkge1xyXG4gICAgICAgICAgICB1cGRhdGVTZWxlY3RlZEl0ZW1zKCk7XHJcbiAgICAgICAgICAgIHNlbGVjdC5zZWxlY3RlZC5zcGxpY2UoMCwgc2VsZWN0LnNlbGVjdGVkLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXNlbGVjdCBhbGwgc2VsZWN0ZWQgaXRlbXMgYW5kIGFkZCB0aGlzIG9uZSBhcyBzZWxlY3RlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RTaW5nbGVJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgZGVzZWxlY3RTZWxlY3RlZEl0ZW1zKCk7XHJcbiAgICAgICAgICAgIHNlbGVjdEl0ZW0oaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgY2hhbmdlcyBpbiBzZWxlY3RlZCBpdGVtc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGVkSXRlbXMoKSB7XHJcbiAgICAgICAgICAgIG5nLmZvckVhY2goZ2V0U2VsZWN0ZWRJdGVtcygpLCBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS51cGRhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
