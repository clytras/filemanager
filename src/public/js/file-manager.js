(function (ng, crip) {
    'use strict';

    crip.filemanager = ng.module('crip.file-manager', [
        'crip.core',
        'crip.transparent-progressbar',
        'angular-loading-bar',
        'ngFileUpload',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngMaterial'
    ])
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .config(ManagerGridConfig);

    ManagerGridConfig.$inject = [];

    function ManagerGridConfig() {


    }

})(angular, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .run(Run);

    Run.$inject = [
        '$rootScope'
    ];

    function Run($rootScope) {
        $rootScope.fireBroadcast = broadcast;

        /**
         * Fire event on root scope for all controllers
         *
         * @param {string} eventName
         * @param {Array} args
         */
        function broadcast(eventName, args) {
            $rootScope.$broadcast(eventName, args);
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', '$mdMenu', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation',
        'CripManagerUploader', 'CripPropertiesModal', 'CripManagerContentOrder', 'CripManagerContentFilter',
        'CripManagerSettings'
    ];

    function ActionsController($scope, $mdMenu, focus, Actions, Content, Location,
                               Uploader, PropertiesModal, ContentOrder, ContentFilter,
                               Settings) {
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

            $scope.canUpload = canUpload;
            $scope.hasUploads = hasUploads;
            $scope.addFiles = addFiles;
            $scope.upload = upload;
            $scope.cancelUpload = cancelUpload;
            $scope.allMediaAllowed = allMediaAllowed;

            $scope.order = ContentOrder;
            $scope.filters = ContentFilter;
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
            // close menu if is open when enabling rename function
            $mdMenu.hide();

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
            return Content.hasProperties(Content.getSelectedItem());
        }

        /**
         * Open item properties pop-up
         *
         * @param $event
         */
        function openProperties($event) {
            if (!hasProperties())
                return;

            $event.stopPropagation();
            PropertiesModal.open(Content.getSelectedItem());
        }

        /**
         * Determines if file can be uploaded
         *
         * @returns {boolean}
         */
        function canUpload() {
            // at this moment we can upload to any open dir
            return true;
        }

        /**
         * Determines if there files in queue for upload
         *
         * @returns {boolean}
         */
        function hasUploads() {
            return Uploader.hasFiles();
        }

        /**
         * Add files for upload
         *
         * @param {Array} files
         */
        function addFiles(files) {
            Uploader.add(files);
        }

        /**
         * Start upload files from queue
         */
        function upload() {
            Uploader.start();
        }

        function cancelUpload() {
            Uploader.clean();
        }

        function allMediaAllowed() {
            return Settings.isAllMediaAllowed();
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
        '$log', '$scope', 'CripManagerContent', 'CripManagerContentOrder', 'CripManagerContentFilter'
    ];

    function DirContentController($log, $scope, Content, ContentOrder, ContentFilter) {
        activate();

        function activate() {
            $scope.order = ContentOrder;
            $scope.filter = ContentFilter;

            $scope.getContent = function() {
                return Content.get();
            }
        }

    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('FileUploadController', FileUploadController);

    FileUploadController.$inject = ['$scope', 'CripManagerUploader'];

    function FileUploadController($scope, Uploader) {
        activate();

        function activate() {
            $scope.hasUploads = hasUploads;
            $scope.files = files;
        }

        /**
         * Determines if there files in queue for upload
         *
         * @returns {boolean}
         */
        function hasUploads() {
            return Uploader.hasFiles();
        }

        /**
         * Get files from queue
         *
         * @returns {Array}
         */
        function files() {
            return Uploader.files;
        }

    }

})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('ItemController', ItemController);

    ItemController.$inject = [
        '$log', '$scope', '$mdMenu', 'focus', 'CripManagerContent', 'CripManagerLocation',
        'CripManagerActions', 'CripPropertiesModal'
    ];

    function ItemController($log, $scope, $mdMenu, focus, Content, Location,
                            Actions, PropertiesModal) {
        activate();

        function activate() {
            $scope.click = click;
            $scope.dblclick = dblclick;
            $scope.isSelected = isSelected;
            $scope.enableRename = enableRename;
            $scope.canDelete = canDelete;
            $scope.deleteItem = deleteItem;
            $scope.hasProperties = hasProperties;
            $scope.openProperties = openProperties;
            $scope.openMenu = openMenu;
            $scope.canOpen = canOpen;
            $scope.openDir = openDir;
            $scope.canRename = canRename;
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
            $mdMenu.hide();
        }

        /**
         * On item double click
         *
         * @param e
         * @param item
         */
        function dblclick(e, item) {
            e.stopPropagation();
            //$log.info('dblclick', item);

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
            if ($event.stopPropagation)
                $event.stopPropagation();

            $mdMenu.hide();
            var item;

            if($event.is_extended) {
                item = $event;
                Content.selectSingle(item);
            } else
                item = Content.getSelectedItem();

            Actions.enableRename(item);
            focus('#{identifier} input[name="name"]'.supplant(item));
        }

        function canDelete(item) {
            return Actions.canDelete(item);
        }

        /**
         * Delete item from file system
         *
         * @param {Object} item
         */
        function deleteItem(item) {
            Actions.delete(item);
        }

        function hasProperties(item) {
            return Content.hasProperties(item);
        }

        function openProperties(item) {
            PropertiesModal.open(item);
        }

        function openMenu(item, $event) {
            $mdMenu.hide().then(function () {
                item.menu.$mdOpenMenu($event);
            });
        }

        function canOpen(item) {
            return item.isDir;
        }

        function openDir(dir) {
            if (!canOpen(dir))
                return;

            Location.change(dir);
        }

        function canRename(item) {
            return !item.isDirUp;
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';
    crip.filemanager
        .controller('ItemPropertiesController', ItemPropertiesController);

    ItemPropertiesController.$inject = [
        '$log', '$scope', '$mdDialog', 'CripManagerTrans', 'item'
    ];

    function ItemPropertiesController($log, $scope, $mdDialog, Trans, item) {
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
            $mdDialog.hide();
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
         * @param {string} item.updated_at
         * @param {function} item.getSize
         */
        function defaultDetails(details, item) {
            $log.log('item_properties_modal_file_type_' + item.type);
            details.push({
                name: Trans('item_properties_modal_item_type'),
                value: Trans('item_properties_modal_file_type_' + item.type)
            }, {
                name: Trans('item_properties_modal_name'),
                value: item.full_name
            }, {
                name: Trans('item_properties_modal_date'),
                value: item.updated_at
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
                value: item.extension
            });

            if (item.type === 'image' && ng.hasValue(item.thumbs)) {

                details.push({
                    name: Trans('item_properties_modal_item_url'),
                    value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                        url: item.url,
                        title: Trans('item_properties_modal_size_dim').supplant(item.size)
                    })
                });

                ng.forEach(item.thumbs, function (val, size) {
                    details.push({
                        name: Trans('item_properties_modal_size_url_title').supplant({
                            size: Trans('item_properties_modal_size_key_' + size)
                        }),
                        value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                            url: val.url,
                            title: Trans('item_properties_modal_size_dim').supplant(val.size)
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
        '$scope', '$mdMenu', 'CripManagerLocation', 'CripManagerContent', 'CripManagerTrans', 'CripManagerBreadcrumb'
    ];

    function RootController($scope, $mdMenu, Location, Content, Trans, Breadcrumb) {

        activate();

        function activate() {
            // initialise file manager initial location and load translations
            Trans().init();
            Location.init();

            $scope.deselect = deselect;
            $scope.refreshContent = refreshContent;
        }

        function deselect() {
            Content.deselect();
            $mdMenu.hide();
        }

        function refreshContent() {
            Location.change(Breadcrumb.current());
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$resource', 'CripManagerSettings'
    ];

    function Dir($resource, Settings) {
        return $resource(Settings.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        }, {
            'create': {url: Settings.dirUrl(':dir/:name', 'create'), method: 'POST'},
            'deleteDir': {url: Settings.dirUrl(':dir', 'delete'), method: 'GET'},
            'deleteFile': {url: Settings.fileUrl(':dir/:name', 'delete'), method: 'GET'},
            'renameDir': {url: Settings.dirUrl(':dir', 'rename'), method: 'GET'},
            'renameFile': {url: Settings.fileUrl(':dir', 'rename'), method: 'GET'}
        });
    }
})(window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTranslations', Translations);

    Translations.$inject = [
        '$resource', 'CripManagerSettings'
    ];

    function Translations($resource, Settings) {
        return $resource(Settings.baseUrl('translations'));
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

    Breadcrumb.$inject = ['$location', '$rootScope'];

    function Breadcrumb($location, $rootScope) {
        var breadcrumb = {
            items: [],
            hasItems: hasItems,
            current: current,
            set: setLocation,
            urlChangeIgnore: false,
            resolveUrlObject: resolveUrlObject,
            toString: toString
        };

        /**
         * Watch location change and fire event, if it is changed by user
         */
        $rootScope.$watch(location, onUrlLocationChange);

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
            var string_value = toString.apply(val);
            breadcrumb.items.splice(0, breadcrumb.items.length);
            setUrlLocation(string_value);
            ng.forEach(string_value.split('\/').clean('', null), function (v) {
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
            });

            // mark last item as active, this will help mark item as active
            if (breadcrumb.items.length > 0) {
                breadcrumb.items[breadcrumb.items.length - 1].isActive = true;
            }
        }

        /**
         * Set current location to url
         *
         * @param {Array|String} parts
         */
        function setUrlLocation(parts) {
            breadcrumb.urlChangeIgnore = true;
            var location = typeof parts === 'string' ? parts.split('\/') : parts;
            location.clean();

            if (location.length > 0 && ng.hasValue(location[0])) {
                $location.search('l', location);
            } else {
                $location.search('l', null);
            }
            breadcrumb.urlChangeIgnore = false;
        }

        /**
         * Get current url location object
         *
         * @returns {*|Object}
         */
        function location() {
            return $location.search();
        }

        function onUrlLocationChange(n, o) {
            if (!breadcrumb.urlChangeIgnore && !ng.equals(n, o)) {
                $rootScope.fireBroadcast('url-change', [resolveUrlObject(n)]);
            }
        }

        /**
         * Resolve $location object ro path string
         *
         * @param {Object} location
         * @param {Array|String} location.l
         * @returns {String|null}
         */
        function resolveUrlObject(location) {
            var path = null;
            if (ng.hasValue(location.l)) {
                path = location.l;
                if (typeof path === 'object')
                    path = path.join('/');
            }

            return path;
        }

        /**
         * Convert context to string value
         *
         * @param [value]
         * @returns {string}
         */
        function toString(value) {
            this.dir = this.dir || '';
            this.name = this.name || '';
            value = '{dir}/{name}'.supplant(this);

            return value.split('\/').clean().join('\/');
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContent', Content);

    Content.$inject = ['ItemService', 'SelectService', 'Dir'];

    function Content(ItemService, SelectService, Dir) {
        var content = {
            items: [],
            get: getItems,
            add: add,
            remove: remove,
            removeItems: removeItems,
            hasProperties: hasProperties
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
         * @param {Object} item
         * @returns {Object}
         */
        function add(item) {
            if (!ng.isDefined(item.is_extended)) {
                ItemService.extendItem(item);
            }

            if(typeof item !== 'Dir') {
                item = new Dir(item);
            }

            content.items.push(item);

            return item;
        }

        /**
         * Remove single item
         *
         * @param {object} item
         */
        function remove(item) {
            content.items.splice(content.items.indexOf(item), 1);
        }

        /**
         * Determines is item has properties
         *
         * @param {object} item
         * @returns {boolean}
         */
        function hasProperties(item) {
            if(!item) {
                return false;
            }

            return !item.isDirUp
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContentFilter', ContentFilter);

    ContentFilter.$inject = ['$log', 'CripManagerSettings'];

    function ContentFilter($log, Settings) {
        var filters = {
            dir: dir,
            toggle: toggle,
            image: true,
            media: true,
            document: true
        };

        return filters;

        function dir(value, index, array) {
            // If item is dir, it will be visible
            if (value.isDir)
                return true;

            // if any type is allowed
            if (Settings.isAllMediaAllowed())
                return filters[value.type];

            // if filter enable property is disabled, compare with allowed type
            return Settings.allowedMediaType() == value.type;
        }

        function toggle(field) {
            if (typeof filters[field] === 'boolean')
                filters[field] = !filters[field];
        }
    }
})(angular, window.crip);
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContentOrder', ContentOrder);

    ContentOrder.$inject = ['$log'];

    function ContentOrder($log) {
        var order = {
            by: orderBy,
            isBy: isBy,
            set: setField,
            field: 'full_name',
            isReverse: false,

            full_name: true,
            bytes: false,
            updated_at: false
        };

        var allowed = ['full_name', 'bytes', 'updated_at'];

        return order;

        /**
         *
         * @param item
         * @returns {string|number}
         */
        function orderBy(item) {
            var result = -Number.MAX_VALUE / 2;
            if (typeof item[order.field] === 'number') {
                if (item.isDir) {
                    if (!item.isDirUp)
                        result += item[order.field] + 1;

                    // for reverse sort, dirs should not change position
                    if (order.isReverse) {
                        result *= -1;
                        if (item.isDirUp)
                            result += Number.MAX_VALUE / 2;
                    }

                } else
                    result = item[order.field];
            } else {
                if (order.isReverse)
                    result = '1 {field}';
                else
                    result = 'z {field}';

                if (item.isDir) {
                    // dir up should be on first place
                    if (item.isDirUp) {
                        if (order.isReverse)
                            result = 'zzz';
                        else
                            result = '0 0';
                    }
                    else {
                        if (order.isReverse)
                            result = 'z {field}';
                        else
                            result = '1 {field}';
                    }
                }
                result = result.supplant({field: item[order.field]});
            }

            //$log.info(result);
            return result;
        }

        /**
         * Is current order by field
         *
         * @param {string} field
         * @returns {boolean}
         */
        function isBy(field) {
            if (allowed.indexOf(field) !== -1)
                return !!order[field];

            return false;
        }

        /**
         * Set field as currently sortable
         *
         * @param {string} field
         */
        function setField(field) {
            if (allowed.indexOf(field) !== -1) {
                for (var p in allowed) {
                    if (allowed.hasOwnProperty(p) && allowed[p] != field)
                        order[allowed[p]] = false;
                }

                order.field = field;

                if (!order[field])
                    order[field] = true;
                else
                    order.isReverse = !order.isReverse;
            }
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
            if (this.isDir || this.extension === '')
                return this.name;
            else
                return '{name}.{extension}'.supplant(this);
        }

        /**
         * Save item name if it is changed
         */
        function saveNewName() {
            var self = this,
                key = getKey(self.identifier),
                menu = self.menu;
            self.rename = false;
            if (self.full_name !== self.getFullName()) {
                var method = self.isDir ? '$renameDir' : '$renameFile';
                self[method]({
                    'old': self.full_name,
                    'new': self.getFullName()
                }, function (response) {
                    ng.extend(self, extendItem(response, key), {menu: menu});
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
            return this.bytes.toBytes();
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerLocation', ChangeLocationService);

    ChangeLocationService.$inject = [
        '$cookies', '$location', '$rootScope', 'Dir', 'ItemService', 'CripManagerBreadcrumb', 'CripManagerContent'
    ];

    function ChangeLocationService($cookies, $location, $rootScope, Dir, ItemService, Breadcrumb, Content) {

        $rootScope.$on('url-change', function (event, args) {
            change({dir: args[0]});
        });

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
            var location = {dir: null, name: null},
                url = Breadcrumb.resolveUrlObject($location.search());

            // if url contains location, ignore cookies value
            if (ng.hasValue(url)) {
                location.dir = url;

                return location;
            }

            var cookieDir = $cookies.get('location-dir'),
                name = $cookies.get('location-dir-name');
            if (ng.hasValue(cookieDir) || ng.hasValue(name)) {
                location.dir = cookieDir;
                if (ng.isEmpty(name)) {
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
        .service('CripPropertiesModal', PropertiesModal);

    PropertiesModal.$inject = ['$mdDialog', 'CripManagerSettings', 'CripManagerContent'];

    function PropertiesModal($mdDialog, Settings, Content) {
        return {
            open: open
        };

        /**
         * Open item properties modal
         *
         * @param {object} item
         * @param {string} item.identifier
         * @returns {boolean}
         */
        function open(item) {
            if(!Content.hasProperties(item)) {
                return false;
            }

            $mdDialog.show({
                clickOutsideToClose: true,
                openFrom: '#' + item.identifier,
                closeTo: '#' + item.identifier,
                templateUrl: Settings.templatePath('item-properties-modal'),
                controller: 'ItemPropertiesController',
                locals: {
                    item: item
                }
            });
        }
    }

})(angular, window.crip);
(function (ng, crip, $) {
    'use strict';

    crip.filemanager
        .service('CripManagerSettings', Settings);

    Settings.$inject = ['$log'];

    function Settings($log) {
        var $settings = $('#settings'),
            allowed_media_types = ['image', 'media', 'document'],
            settings = {
                base_url: $settings.data('base-url'),
                public_url: $settings.data('public-url'),
                params: resolveParams($settings, 'params'),
                img_sizes: JSON.parse($settings.data('sizes').replaceAll("'", '"')),
                dirUrl: dirUrl,
                fileUrl: fileUrl,
                baseUrl: appendBase,
                templatePath: templatePath,
                allowedMediaType: allowedMediaType,
                isAllMediaAllowed: isAllMediaAllowed
            };

        return settings;

        /**
         * Get backend parameters if they are presented
         *
         * @param {object} $element
         * @param {string} data_key
         * @returns {object|Array}
         */
        function resolveParams($element, data_key) {
            var params = $element.data(data_key);
            if (params.length > 0)
                params = JSON.parse(params.replaceAll("'", '"'));

            return params;
        }

        /**
         * Get plugin dir action url
         *
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        function dirUrl(dir, action) {
            return actionUrl('dir', dir, action);
        }

        /**
         * Get plugin file action url
         *
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        function fileUrl(dir, action) {
            return actionUrl('file', dir, action);
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

            return appendBase(path);
        }

        /**
         * Get plugin base url
         *
         * @param {string} path
         * @returns {string}
         */
        function appendBase(path) {
            return settings.base_url + path;
        }

        /**
         * Get full path to template
         * @param {String} template_name
         * @param {String} [extension]
         */
        function templatePath(template_name, extension) {
            var tmp = {
                url: publicUrl(),
                name: template_name,
                ext: extension || 'html'
            };

            return '{url}/templates/{name}.{ext}'.supplant(tmp);
        }

        /**
         * Get allowed media type
         *
         * @returns {string}
         */
        function allowedMediaType() {
            if (allowed_media_types.indexOf(settings.params['type']) === -1)
                return 'file';

            return settings.params['type'];
        }

        function isAllMediaAllowed() {
            return allowedMediaType() === 'file';
        }
    }
})(angular, window.crip, jQuery);
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
        .service('CripManagerUploader', Uploader);

    Uploader.$inject = ['CripManagerSettings', 'CripManagerBreadcrumb', 'CripManagerContent', 'Upload'];

    function Uploader(Settings, Breadcrumb, Content, Upload) {

        var uploader = {
            files: [],
            add: addFile,
            hasFiles: hasFiles,
            start: start,
            clean: clean,
            settings: {
                status: 200,
                error: '',
                url: {
                    root: Settings.fileUrl('upload'),
                    dir: ''
                }
            }
        };

        return uploader;

        function addFile(files) {
            ng.forEach(files, function (file) {
                file.progress = 0;
                file.id = uploader.files.length;
                file.isHtml5 = ng.isHtml5;
                file.error = false;
                uploader.files.push(file);
            });
        }

        /**
         * Determines if there files in queue for upload
         *
         * @returns {boolean}
         */
        function hasFiles() {
            return uploader.files.length > 0;
        }

        /**
         * Start upload all files from queue
         *
         * @returns {boolean}
         */
        function start() {
            if (!hasFiles())
                return false;

            // get current dir from Breadcrumb and convert it to string
            uploader.settings.url.dir = Breadcrumb.toString.apply(Breadcrumb.current());

            ng.forEach(uploader.files, onSingleFile);
        }

        /**
         * Upload single file wrapper
         *
         * @param file
         */
        function onSingleFile(file) {
            var upload = Upload.upload({
                url: '{root}/{dir}'.supplant(uploader.settings.url),
                data: {file: file}
            });

            upload.then(function (response) {
                file.progress = 100;
                uploader.files.removeItem(file.id, 'id');
                Content.add(response.data);
            }, function(response) {
                // TODO: add notification about error
                file.error = true;
                file.progress = 100;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(90.0 * evt.loaded / evt.total));
            });
        }

        /**
         * Remove all files from uploads
         */
        function clean() {
            uploader.files = [];
        }
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
                var item = Content.add(r);
                Content.selectSingle(item);

                if (ng.isFunction(callback)) {
                    callback(item);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvbmZpZy5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL0FjdGlvbnNDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvQnJlYWRjcnVtYkNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9EaXJDb250ZW50Q29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL0ZpbGVVcGxvYWRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvSXRlbUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9JdGVtUHJvcGVydGllc0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9Sb290Q29udHJvbGxlci5qcyIsInJlc291cmNlcy9EaXIuanMiLCJyZXNvdXJjZXMvVHJhbnNsYXRpb25zLmpzIiwic2VydmljZXMvQWN0aW9ucy5qcyIsInNlcnZpY2VzL0JyZWFkY3J1bWIuanMiLCJzZXJ2aWNlcy9Db250ZW50LmpzIiwic2VydmljZXMvQ29udGVudEZpbHRlci5qcyIsInNlcnZpY2VzL0NvbnRlbnRPcmRlci5qcyIsInNlcnZpY2VzL0l0ZW1TZXJ2aWNlLmpzIiwic2VydmljZXMvTG9jYXRpb24uanMiLCJzZXJ2aWNlcy9Qcm9wZXJ0aWVzTW9kYWwuanMiLCJzZXJ2aWNlcy9TZXR0aW5ncy5qcyIsInNlcnZpY2VzL1RyYW5zLmpzIiwic2VydmljZXMvVXBsb2FkZXIuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL0NyZWF0ZUZvbGRlclNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL0RlbGV0ZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL1JlbmFtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9jb250ZW50L1NlbGVjdFNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZpbGUtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyID0gbmcubW9kdWxlKCdjcmlwLmZpbGUtbWFuYWdlcicsIFtcclxuICAgICAgICAnY3JpcC5jb3JlJyxcclxuICAgICAgICAnY3JpcC50cmFuc3BhcmVudC1wcm9ncmVzc2JhcicsXHJcbiAgICAgICAgJ2FuZ3VsYXItbG9hZGluZy1iYXInLFxyXG4gICAgICAgICduZ0ZpbGVVcGxvYWQnLFxyXG4gICAgICAgICduZ0Nvb2tpZXMnLFxyXG4gICAgICAgICduZ1Jlc291cmNlJyxcclxuICAgICAgICAnbmdTYW5pdGl6ZScsXHJcbiAgICAgICAgJ25nTWF0ZXJpYWwnXHJcbiAgICBdKVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbmZpZyhNYW5hZ2VyR3JpZENvbmZpZyk7XHJcblxyXG4gICAgTWFuYWdlckdyaWRDb25maWcuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIE1hbmFnZXJHcmlkQ29uZmlnKCkge1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsICQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnJ1bihSdW4pO1xyXG5cclxuICAgIFJ1bi4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSdW4oJHJvb3RTY29wZSkge1xyXG4gICAgICAgICRyb290U2NvcGUuZmlyZUJyb2FkY2FzdCA9IGJyb2FkY2FzdDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZSBldmVudCBvbiByb290IHNjb3BlIGZvciBhbGwgY29udHJvbGxlcnNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0KGV2ZW50TmFtZSwgYXJncykge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoZXZlbnROYW1lLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCAkLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBY3Rpb25zQ29udHJvbGxlcicsIEFjdGlvbnNDb250cm9sbGVyKTtcclxuXHJcbiAgICBBY3Rpb25zQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckc2NvcGUnLCAnJG1kTWVudScsICdmb2N1cycsICdDcmlwTWFuYWdlckFjdGlvbnMnLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyTG9jYXRpb24nLFxyXG4gICAgICAgICdDcmlwTWFuYWdlclVwbG9hZGVyJywgJ0NyaXBQcm9wZXJ0aWVzTW9kYWwnLCAnQ3JpcE1hbmFnZXJDb250ZW50T3JkZXInLCAnQ3JpcE1hbmFnZXJDb250ZW50RmlsdGVyJyxcclxuICAgICAgICAnQ3JpcE1hbmFnZXJTZXR0aW5ncydcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQWN0aW9uc0NvbnRyb2xsZXIoJHNjb3BlLCAkbWRNZW51LCBmb2N1cywgQWN0aW9ucywgQ29udGVudCwgTG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGxvYWRlciwgUHJvcGVydGllc01vZGFsLCBDb250ZW50T3JkZXIsIENvbnRlbnRGaWx0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZXR0aW5ncykge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FuRGVsZXRlU2VsZWN0ZWQgPSBjYW5EZWxldGVTZWxlY3RlZDtcclxuICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZVNlbGVjdGVkID0gZGVsZXRlU2VsZWN0ZWQ7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2FuQ3JlYXRlRm9sZGVyID0gY2FuQ3JlYXRlRm9sZGVyO1xyXG4gICAgICAgICAgICAkc2NvcGUuY3JlYXRlRm9sZGVyID0gY3JlYXRlRm9sZGVyO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNhblJlbmFtZVNlbGVjdGVkID0gY2FuUmVuYW1lU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5lbmFibGVSZW5hbWVTZWxlY3RlZCA9IGVuYWJsZVJlbmFtZVNlbGVjdGVkO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNhbk9wZW5TZWxlY3RlZCA9IGNhbk9wZW5TZWxlY3RlZDtcclxuICAgICAgICAgICAgJHNjb3BlLm9wZW5TZWxlY3RlZCA9IG9wZW5TZWxlY3RlZDtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5oYXNQcm9wZXJ0aWVzID0gaGFzUHJvcGVydGllcztcclxuICAgICAgICAgICAgJHNjb3BlLm9wZW5Qcm9wZXJ0aWVzID0gb3BlblByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2FuVXBsb2FkID0gY2FuVXBsb2FkO1xyXG4gICAgICAgICAgICAkc2NvcGUuaGFzVXBsb2FkcyA9IGhhc1VwbG9hZHM7XHJcbiAgICAgICAgICAgICRzY29wZS5hZGRGaWxlcyA9IGFkZEZpbGVzO1xyXG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkID0gdXBsb2FkO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FuY2VsVXBsb2FkID0gY2FuY2VsVXBsb2FkO1xyXG4gICAgICAgICAgICAkc2NvcGUuYWxsTWVkaWFBbGxvd2VkID0gYWxsTWVkaWFBbGxvd2VkO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gQ29udGVudE9yZGVyO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlsdGVycyA9IENvbnRlbnRGaWx0ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIHNlbGVjdGVkIGl0ZW0gY2FuIGJlIGRlbGV0ZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkRlbGV0ZVNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9ucy5jYW5EZWxldGUoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWxldGUgc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICRldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVNlbGVjdGVkKCRldmVudCkge1xyXG4gICAgICAgICAgICAvLyBpZiBldmVudCBpcyBwcmVzZW50ZWQsIHN0b3AgaXQgcHJvcGFnYXRpb25cclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZCgkZXZlbnQpICYmIG5nLmlzRGVmaW5lZCgkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBBY3Rpb25zLmRlbGV0ZShDb250ZW50LmdldFNlbGVjdGVkSXRlbSgpKTtcclxuICAgICAgICAgICAgQ29udGVudC5kZXNlbGVjdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBjYW4gY3JlYXRlIG5ldyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkNyZWF0ZUZvbGRlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbnMuY2FuQ3JlYXRlRm9sZGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgbmV3IGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVGb2xkZXIobmFtZSkge1xyXG4gICAgICAgICAgICBBY3Rpb25zLmNyZWF0ZUZvbGRlcihuYW1lLCBlbmFibGVSZW5hbWVTZWxlY3RlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIHNlbGVjdGVkIGl0ZW0gY2FuIGJlIHJlbmFtZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhblJlbmFtZVNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9ucy5jYW5SZW5hbWUoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbmFibGUgcmVuYW1lIGZvciBzZWxlY3RlZCBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZW5hYmxlUmVuYW1lU2VsZWN0ZWQoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIGNsb3NlIG1lbnUgaWYgaXMgb3BlbiB3aGVuIGVuYWJsaW5nIHJlbmFtZSBmdW5jdGlvblxyXG4gICAgICAgICAgICAkbWRNZW51LmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGV2ZW50IGlzIHByZXNlbnRlZCwgc3RvcCBpdCBwcm9wYWdhdGlvblxyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKCRldmVudCkgJiYgbmcuaXNEZWZpbmVkKCRldmVudC5zdG9wUHJvcGFnYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBBY3Rpb25zLmVuYWJsZVJlbmFtZShpdGVtKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzKCcje2lkZW50aWZpZXJ9IGlucHV0W25hbWU9XCJuYW1lXCJdJy5zdXBwbGFudChpdGVtKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaWYgY2FuIG9wZW4gc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuT3BlblNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKS5pc0RpcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9wZW4gc2VsZWN0ZWQgZGlyZWN0b3J5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlblNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICBpZiAoIWNhbk9wZW5TZWxlY3RlZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgTG9jYXRpb24uY2hhbmdlKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBzZWxlY3RlZCBpdGVtIGNhbiBwcm92aWRlIHByb3BlcnRpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGhhc1Byb3BlcnRpZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb250ZW50Lmhhc1Byb3BlcnRpZXMoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPcGVuIGl0ZW0gcHJvcGVydGllcyBwb3AtdXBcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvcGVuUHJvcGVydGllcygkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wZXJ0aWVzKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIFByb3BlcnRpZXNNb2RhbC5vcGVuKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBmaWxlIGNhbiBiZSB1cGxvYWRlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuVXBsb2FkKCkge1xyXG4gICAgICAgICAgICAvLyBhdCB0aGlzIG1vbWVudCB3ZSBjYW4gdXBsb2FkIHRvIGFueSBvcGVuIGRpclxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaWYgdGhlcmUgZmlsZXMgaW4gcXVldWUgZm9yIHVwbG9hZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVXBsb2FkcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVwbG9hZGVyLmhhc0ZpbGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgZmlsZXMgZm9yIHVwbG9hZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZmlsZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhZGRGaWxlcyhmaWxlcykge1xyXG4gICAgICAgICAgICBVcGxvYWRlci5hZGQoZmlsZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnQgdXBsb2FkIGZpbGVzIGZyb20gcXVldWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB1cGxvYWQoKSB7XHJcbiAgICAgICAgICAgIFVwbG9hZGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYW5jZWxVcGxvYWQoKSB7XHJcbiAgICAgICAgICAgIFVwbG9hZGVyLmNsZWFuKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhbGxNZWRpYUFsbG93ZWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTZXR0aW5ncy5pc0FsbE1lZGlhQWxsb3dlZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgalF1ZXJ5LCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0JyZWFkY3J1bWJDb250cm9sbGVyJywgQnJlYWRjcnVtYkNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJyZWFkY3J1bWJDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRzY29wZScsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJMb2NhdGlvbidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQnJlYWRjcnVtYkNvbnRyb2xsZXIoJHNjb3BlLCBCcmVhZGNydW1iLCBMb2NhdGlvbikge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ29UbyA9IGdvVG87XHJcbiAgICAgICAgICAgICRzY29wZS5nb1RvUm9vdCA9IGdvVG9Sb290O1xyXG4gICAgICAgICAgICAkc2NvcGUuYnJlYWRjcnVtYkhhc0l0ZW1zID0gYnJlYWRjcnVtYkhhc0l0ZW1zO1xyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0QnJlYWRjcnVtYkl0ZW1zID0gZ2V0QnJlYWRjcnVtYkl0ZW1zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR28gdG8gc3BlY2lmaWVkIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGZvbGRlclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXIuZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlci5uYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ29Ubyhmb2xkZXIpIHtcclxuICAgICAgICAgICAgTG9jYXRpb24uY2hhbmdlKGZvbGRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHbyB0byByb290IGZvbGRlciBsb2NhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdvVG9Sb290KCkge1xyXG4gICAgICAgICAgICBnb1RvKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIEJyZWFkY3J1bWIgYW55IGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJyZWFkY3J1bWJIYXNJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyZWFkY3J1bWIuaGFzSXRlbXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBCcmVhZGNydW1iIGl0ZW0gY29sbGVjdGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEJyZWFkY3J1bWJJdGVtcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyZWFkY3J1bWIuaXRlbXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignRGlyQ29udGVudENvbnRyb2xsZXInLCBEaXJDb250ZW50Q29udHJvbGxlcik7XHJcblxyXG4gICAgRGlyQ29udGVudENvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyQ29udGVudE9yZGVyJywgJ0NyaXBNYW5hZ2VyQ29udGVudEZpbHRlcidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyQ29udGVudENvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCBDb250ZW50LCBDb250ZW50T3JkZXIsIENvbnRlbnRGaWx0ZXIpIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gQ29udGVudE9yZGVyO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlsdGVyID0gQ29udGVudEZpbHRlcjtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5nZXRDb250ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29udGVudC5nZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignRmlsZVVwbG9hZENvbnRyb2xsZXInLCBGaWxlVXBsb2FkQ29udHJvbGxlcik7XHJcblxyXG4gICAgRmlsZVVwbG9hZENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJ0NyaXBNYW5hZ2VyVXBsb2FkZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBGaWxlVXBsb2FkQ29udHJvbGxlcigkc2NvcGUsIFVwbG9hZGVyKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5oYXNVcGxvYWRzID0gaGFzVXBsb2FkcztcclxuICAgICAgICAgICAgJHNjb3BlLmZpbGVzID0gZmlsZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlIGZpbGVzIGluIHF1ZXVlIGZvciB1cGxvYWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGhhc1VwbG9hZHMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBVcGxvYWRlci5oYXNGaWxlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGZpbGVzIGZyb20gcXVldWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBmaWxlcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVwbG9hZGVyLmZpbGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignSXRlbUNvbnRyb2xsZXInLCBJdGVtQ29udHJvbGxlcik7XHJcblxyXG4gICAgSXRlbUNvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnJG1kTWVudScsICdmb2N1cycsICdDcmlwTWFuYWdlckNvbnRlbnQnLCAnQ3JpcE1hbmFnZXJMb2NhdGlvbicsXHJcbiAgICAgICAgJ0NyaXBNYW5hZ2VyQWN0aW9ucycsICdDcmlwUHJvcGVydGllc01vZGFsJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBJdGVtQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRtZE1lbnUsIGZvY3VzLCBDb250ZW50LCBMb2NhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbnMsIFByb3BlcnRpZXNNb2RhbCkge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY2xpY2sgPSBjbGljaztcclxuICAgICAgICAgICAgJHNjb3BlLmRibGNsaWNrID0gZGJsY2xpY2s7XHJcbiAgICAgICAgICAgICRzY29wZS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcclxuICAgICAgICAgICAgJHNjb3BlLmVuYWJsZVJlbmFtZSA9IGVuYWJsZVJlbmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLmNhbkRlbGV0ZSA9IGNhbkRlbGV0ZTtcclxuICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZUl0ZW0gPSBkZWxldGVJdGVtO1xyXG4gICAgICAgICAgICAkc2NvcGUuaGFzUHJvcGVydGllcyA9IGhhc1Byb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICRzY29wZS5vcGVuUHJvcGVydGllcyA9IG9wZW5Qcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAkc2NvcGUub3Blbk1lbnUgPSBvcGVuTWVudTtcclxuICAgICAgICAgICAgJHNjb3BlLmNhbk9wZW4gPSBjYW5PcGVuO1xyXG4gICAgICAgICAgICAkc2NvcGUub3BlbkRpciA9IG9wZW5EaXI7XHJcbiAgICAgICAgICAgICRzY29wZS5jYW5SZW5hbWUgPSBjYW5SZW5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPbiBpdGVtIGNsaWNrXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZVxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xpY2soZSwgaXRlbSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgQ29udGVudC51cGRhdGVTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICBDb250ZW50LmRlc2VsZWN0KCk7XHJcbiAgICAgICAgICAgIENvbnRlbnQuc2VsZWN0U2luZ2xlKGl0ZW0pO1xyXG4gICAgICAgICAgICAkbWRNZW51LmhpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9uIGl0ZW0gZG91YmxlIGNsaWNrXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gZVxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGJsY2xpY2soZSwgaXRlbSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAvLyRsb2cuaW5mbygnZGJsY2xpY2snLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyKSB7XHJcbiAgICAgICAgICAgICAgICBMb2NhdGlvbi5jaGFuZ2UoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgaXRlbSBzZWxlY3RlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc1NlbGVjdGVkKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuaXNTZWxlY3RlZChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVuYWJsZSBpdGVtIHJlbmFtZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICRldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZSgkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCRldmVudC5zdG9wUHJvcGFnYXRpb24pXHJcbiAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAkbWRNZW51LmhpZGUoKTtcclxuICAgICAgICAgICAgdmFyIGl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZigkZXZlbnQuaXNfZXh0ZW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSAkZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICBDb250ZW50LnNlbGVjdFNpbmdsZShpdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgICAgICBpdGVtID0gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKTtcclxuXHJcbiAgICAgICAgICAgIEFjdGlvbnMuZW5hYmxlUmVuYW1lKGl0ZW0pO1xyXG4gICAgICAgICAgICBmb2N1cygnI3tpZGVudGlmaWVyfSBpbnB1dFtuYW1lPVwibmFtZVwiXScuc3VwcGxhbnQoaXRlbSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuRGVsZXRlKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbnMuY2FuRGVsZXRlKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlIGl0ZW0gZnJvbSBmaWxlIHN5c3RlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgQWN0aW9ucy5kZWxldGUoaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYXNQcm9wZXJ0aWVzKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuaGFzUHJvcGVydGllcyhpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9wZW5Qcm9wZXJ0aWVzKGl0ZW0pIHtcclxuICAgICAgICAgICAgUHJvcGVydGllc01vZGFsLm9wZW4oaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcGVuTWVudShpdGVtLCAkZXZlbnQpIHtcclxuICAgICAgICAgICAgJG1kTWVudS5oaWRlKCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLm1lbnUuJG1kT3Blbk1lbnUoJGV2ZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYW5PcGVuKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaXNEaXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcGVuRGlyKGRpcikge1xyXG4gICAgICAgICAgICBpZiAoIWNhbk9wZW4oZGlyKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIExvY2F0aW9uLmNoYW5nZShkaXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICFpdGVtLmlzRGlyVXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignSXRlbVByb3BlcnRpZXNDb250cm9sbGVyJywgSXRlbVByb3BlcnRpZXNDb250cm9sbGVyKTtcclxuXHJcbiAgICBJdGVtUHJvcGVydGllc0NvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckc2NvcGUnLCAnJG1kRGlhbG9nJywgJ0NyaXBNYW5hZ2VyVHJhbnMnLCAnaXRlbSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gSXRlbVByb3BlcnRpZXNDb250cm9sbGVyKCRsb2csICRzY29wZSwgJG1kRGlhbG9nLCBUcmFucywgaXRlbSkge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkbG9nLmluZm8oaXRlbSk7XHJcbiAgICAgICAgICAgICRzY29wZS5pdGVtID0gcmVzb2x2ZUl0ZW1EZXRhaWxzKGl0ZW0pO1xyXG4gICAgICAgICAgICAkc2NvcGUudGh1bWIgPSBpdGVtLnRodW1iO1xyXG4gICAgICAgICAgICAkc2NvcGUubmFtZSA9IGl0ZW0uZnVsbF9uYW1lO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gY2xvc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIaWRlIG1vZGFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgICAgICRtZERpYWxvZy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNvbHZlIGl0ZW0gZGV0YWlsc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZUl0ZW1EZXRhaWxzKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0uaXNEaXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlRGlyRGV0YWlscyhpdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlRmlsZURldGFpbHMoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBpdGVtIGRlZmF1bHQgZGV0YWlsc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZGV0YWlsc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGl0ZW0uZnVsbF9uYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGl0ZW0udXBkYXRlZF9hdFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGl0ZW0uZ2V0U2l6ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRlZmF1bHREZXRhaWxzKGRldGFpbHMsIGl0ZW0pIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9maWxlX3R5cGVfJyArIGl0ZW0udHlwZSk7XHJcbiAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2l0ZW1fdHlwZScpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfZmlsZV90eXBlXycgKyBpdGVtLnR5cGUpXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZnVsbF9uYW1lXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfZGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0udXBkYXRlZF9hdFxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmdldFNpemUoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlc29sdmUgZm9sZGVyIGRldGFpbHNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVEaXJEZXRhaWxzKGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRldGFpbHMgPSBbXTtcclxuICAgICAgICAgICAgZGVmYXVsdERldGFpbHMoZGV0YWlscywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlc29sdmUgZmlsZSBkZXRhaWxzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlRmlsZURldGFpbHMoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgZGV0YWlscyA9IFtdO1xyXG4gICAgICAgICAgICBkZWZhdWx0RGV0YWlscyhkZXRhaWxzLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLmRpciAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX2RpcicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmRpclxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2l0ZW1fZXh0ZW5zaW9uJyksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5leHRlbnNpb25cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnaW1hZ2UnICYmIG5nLmhhc1ZhbHVlKGl0ZW0udGh1bWJzKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX3VybCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnPGEgaHJlZj1cInt1cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3RpdGxlfTwvYT4nLnN1cHBsYW50KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpdGVtLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfc2l6ZV9kaW0nKS5zdXBwbGFudChpdGVtLnNpemUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG5nLmZvckVhY2goaXRlbS50aHVtYnMsIGZ1bmN0aW9uICh2YWwsIHNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemVfdXJsX3RpdGxlJykuc3VwcGxhbnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplX2tleV8nICsgc2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnPGEgaHJlZj1cInt1cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3RpdGxlfTwvYT4nLnN1cHBsYW50KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdmFsLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemVfZGltJykuc3VwcGxhbnQodmFsLnNpemUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRldGFpbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX3VybCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnPGEgaHJlZj1cInt1cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+e2Z1bGxfbmFtZX08L2E+Jy5zdXBwbGFudChpdGVtKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jvb3RDb250cm9sbGVyJywgUm9vdENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJvb3RDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRzY29wZScsICckbWRNZW51JywgJ0NyaXBNYW5hZ2VyTG9jYXRpb24nLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyVHJhbnMnLCAnQ3JpcE1hbmFnZXJCcmVhZGNydW1iJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSb290Q29udHJvbGxlcigkc2NvcGUsICRtZE1lbnUsIExvY2F0aW9uLCBDb250ZW50LCBUcmFucywgQnJlYWRjcnVtYikge1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgLy8gaW5pdGlhbGlzZSBmaWxlIG1hbmFnZXIgaW5pdGlhbCBsb2NhdGlvbiBhbmQgbG9hZCB0cmFuc2xhdGlvbnNcclxuICAgICAgICAgICAgVHJhbnMoKS5pbml0KCk7XHJcbiAgICAgICAgICAgIExvY2F0aW9uLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5kZXNlbGVjdCA9IGRlc2VsZWN0O1xyXG4gICAgICAgICAgICAkc2NvcGUucmVmcmVzaENvbnRlbnQgPSByZWZyZXNoQ29udGVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRlc2VsZWN0KCkge1xyXG4gICAgICAgICAgICBDb250ZW50LmRlc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICRtZE1lbnUuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVmcmVzaENvbnRlbnQoKSB7XHJcbiAgICAgICAgICAgIExvY2F0aW9uLmNoYW5nZShCcmVhZGNydW1iLmN1cnJlbnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHJlc291cmNlJywgJ0NyaXBNYW5hZ2VyU2V0dGluZ3MnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpcigkcmVzb3VyY2UsIFNldHRpbmdzKSB7XHJcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShTZXR0aW5ncy5kaXJVcmwoJzpkaXIvOm5hbWUnKSwge1xyXG4gICAgICAgICAgICBkaXI6ICdAZGlyJyxcclxuICAgICAgICAgICAgbmFtZTogJ0BuYW1lJ1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgJ2NyZWF0ZSc6IHt1cmw6IFNldHRpbmdzLmRpclVybCgnOmRpci86bmFtZScsICdjcmVhdGUnKSwgbWV0aG9kOiAnUE9TVCd9LFxyXG4gICAgICAgICAgICAnZGVsZXRlRGlyJzoge3VybDogU2V0dGluZ3MuZGlyVXJsKCc6ZGlyJywgJ2RlbGV0ZScpLCBtZXRob2Q6ICdHRVQnfSxcclxuICAgICAgICAgICAgJ2RlbGV0ZUZpbGUnOiB7dXJsOiBTZXR0aW5ncy5maWxlVXJsKCc6ZGlyLzpuYW1lJywgJ2RlbGV0ZScpLCBtZXRob2Q6ICdHRVQnfSxcclxuICAgICAgICAgICAgJ3JlbmFtZURpcic6IHt1cmw6IFNldHRpbmdzLmRpclVybCgnOmRpcicsICdyZW5hbWUnKSwgbWV0aG9kOiAnR0VUJ30sXHJcbiAgICAgICAgICAgICdyZW5hbWVGaWxlJzoge3VybDogU2V0dGluZ3MuZmlsZVVybCgnOmRpcicsICdyZW5hbWUnKSwgbWV0aG9kOiAnR0VUJ31cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlclRyYW5zbGF0aW9ucycsIFRyYW5zbGF0aW9ucyk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyZXNvdXJjZScsICdDcmlwTWFuYWdlclNldHRpbmdzJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUcmFuc2xhdGlvbnMoJHJlc291cmNlLCBTZXR0aW5ncykge1xyXG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoU2V0dGluZ3MuYmFzZVVybCgndHJhbnNsYXRpb25zJykpO1xyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyQWN0aW9ucycsIEFjdGlvbnMpO1xyXG5cclxuICAgIEFjdGlvbnMuJGluamVjdCA9IFtcclxuICAgICAgICAnQ3JlYXRlRm9sZGVyU2VydmljZScsICdEZWxldGVTZXJ2aWNlJywgJ1JlbmFtZVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEFjdGlvbnMoQ3JlYXRlRm9sZGVyLCBEZWxldGUsIFJlbmFtZSkge1xyXG4gICAgICAgIHZhciBzY29wZSA9IHt9O1xyXG4gICAgICAgIG5nLmV4dGVuZChzY29wZSwgQ3JlYXRlRm9sZGVyLCBEZWxldGUsIFJlbmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzY29wZTtcclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJCcmVhZGNydW1iJywgQnJlYWRjcnVtYik7XHJcblxyXG4gICAgQnJlYWRjcnVtYi4kaW5qZWN0ID0gWyckbG9jYXRpb24nLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJyZWFkY3J1bWIoJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGJyZWFkY3J1bWIgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgaGFzSXRlbXM6IGhhc0l0ZW1zLFxyXG4gICAgICAgICAgICBjdXJyZW50OiBjdXJyZW50LFxyXG4gICAgICAgICAgICBzZXQ6IHNldExvY2F0aW9uLFxyXG4gICAgICAgICAgICB1cmxDaGFuZ2VJZ25vcmU6IGZhbHNlLFxyXG4gICAgICAgICAgICByZXNvbHZlVXJsT2JqZWN0OiByZXNvbHZlVXJsT2JqZWN0LFxyXG4gICAgICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBXYXRjaCBsb2NhdGlvbiBjaGFuZ2UgYW5kIGZpcmUgZXZlbnQsIGlmIGl0IGlzIGNoYW5nZWQgYnkgdXNlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICRyb290U2NvcGUuJHdhdGNoKGxvY2F0aW9uLCBvblVybExvY2F0aW9uQ2hhbmdlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJyZWFkY3J1bWI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBjdXJyZW50IGZvbGRlciBsb2NhdGlvbiBvYmplY3RcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY3VycmVudCgpIHtcclxuICAgICAgICAgICAgaWYgKGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge2RpcjogJycsIG5hbWU6ICcnfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJyZWFkY3J1bWIuaXRlbXNbYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggLSAxXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlzIHRoZXJlIGFueSBpdGVtIGluIGJyZWFkY3J1bWJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGhhc0l0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFicmVhZGNydW1iLml0ZW1zLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBuZXcgbG9jYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmb2xkZXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLmRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXIubmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvY2F0aW9uKGZvbGRlcikge1xyXG4gICAgICAgICAgICBvbkxvY2F0aW9uQ2hhbmdlKHtkaXI6IGZvbGRlci5kaXIsIG5hbWU6IGZvbGRlci5uYW1lfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgYnJlYWRjcnVtYiBhcnJheSB3aGVuIG1hbmFnZXIgcHJvcGVydHkgaXMgY2hhbmdlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHZhbFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwuZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbC5uYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25Mb2NhdGlvbkNoYW5nZSh2YWwpIHtcclxuICAgICAgICAgICAgdmFyIHN0cmluZ192YWx1ZSA9IHRvU3RyaW5nLmFwcGx5KHZhbCk7XHJcbiAgICAgICAgICAgIGJyZWFkY3J1bWIuaXRlbXMuc3BsaWNlKDAsIGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgc2V0VXJsTG9jYXRpb24oc3RyaW5nX3ZhbHVlKTtcclxuICAgICAgICAgICAgbmcuZm9yRWFjaChzdHJpbmdfdmFsdWUuc3BsaXQoJ1xcLycpLmNsZWFuKCcnLCBudWxsKSwgZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBjdXJyZW50IGRpciBmcm9tIHByZXZpb3VzIGl0ZW0sIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgICAgICAgICAgdmFyIGRpciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG9ubHkgb25lIHByZXZpb3VzIGl0ZW0sIHVzZSBpdGBzIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyID0gYnJlYWRjcnVtYi5pdGVtc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlciB3YXksIGNvbmNhdCBwcmV2IGRpciB3aXRoIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyID0gJ3tkaXJ9L3tuYW1lfScuc3VwcGxhbnQoYnJlYWRjcnVtYi5pdGVtc1ticmVhZGNydW1iLml0ZW1zLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWRjcnVtYi5pdGVtcy5wdXNoKHtuYW1lOiB2LCBkaXI6IGRpciwgaXNBY3RpdmU6IGZhbHNlfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gbWFyayBsYXN0IGl0ZW0gYXMgYWN0aXZlLCB0aGlzIHdpbGwgaGVscCBtYXJrIGl0ZW0gYXMgYWN0aXZlXHJcbiAgICAgICAgICAgIGlmIChicmVhZGNydW1iLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFkY3J1bWIuaXRlbXNbYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggLSAxXS5pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBjdXJyZW50IGxvY2F0aW9uIHRvIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHBhcnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VXJsTG9jYXRpb24ocGFydHMpIHtcclxuICAgICAgICAgICAgYnJlYWRjcnVtYi51cmxDaGFuZ2VJZ25vcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSB0eXBlb2YgcGFydHMgPT09ICdzdHJpbmcnID8gcGFydHMuc3BsaXQoJ1xcLycpIDogcGFydHM7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmNsZWFuKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24ubGVuZ3RoID4gMCAmJiBuZy5oYXNWYWx1ZShsb2NhdGlvblswXSkpIHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ2wnLCBsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24uc2VhcmNoKCdsJywgbnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWRjcnVtYi51cmxDaGFuZ2VJZ25vcmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBjdXJyZW50IHVybCBsb2NhdGlvbiBvYmplY3RcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfE9iamVjdH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRsb2NhdGlvbi5zZWFyY2goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uVXJsTG9jYXRpb25DaGFuZ2Uobiwgbykge1xyXG4gICAgICAgICAgICBpZiAoIWJyZWFkY3J1bWIudXJsQ2hhbmdlSWdub3JlICYmICFuZy5lcXVhbHMobiwgbykpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuZmlyZUJyb2FkY2FzdCgndXJsLWNoYW5nZScsIFtyZXNvbHZlVXJsT2JqZWN0KG4pXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlc29sdmUgJGxvY2F0aW9uIG9iamVjdCBybyBwYXRoIHN0cmluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2F0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IGxvY2F0aW9uLmxcclxuICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVybE9iamVjdChsb2NhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChuZy5oYXNWYWx1ZShsb2NhdGlvbi5sKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IGxvY2F0aW9uLmw7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmpvaW4oJy8nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb252ZXJ0IGNvbnRleHQgdG8gc3RyaW5nIHZhbHVlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gW3ZhbHVlXVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXIgPSB0aGlzLmRpciB8fCAnJztcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lIHx8ICcnO1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICd7ZGlyfS97bmFtZX0nLnN1cHBsYW50KHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCdcXC8nKS5jbGVhbigpLmpvaW4oJ1xcLycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyQ29udGVudCcsIENvbnRlbnQpO1xyXG5cclxuICAgIENvbnRlbnQuJGluamVjdCA9IFsnSXRlbVNlcnZpY2UnLCAnU2VsZWN0U2VydmljZScsICdEaXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb250ZW50KEl0ZW1TZXJ2aWNlLCBTZWxlY3RTZXJ2aWNlLCBEaXIpIHtcclxuICAgICAgICB2YXIgY29udGVudCA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IFtdLFxyXG4gICAgICAgICAgICBnZXQ6IGdldEl0ZW1zLFxyXG4gICAgICAgICAgICBhZGQ6IGFkZCxcclxuICAgICAgICAgICAgcmVtb3ZlOiByZW1vdmUsXHJcbiAgICAgICAgICAgIHJlbW92ZUl0ZW1zOiByZW1vdmVJdGVtcyxcclxuICAgICAgICAgICAgaGFzUHJvcGVydGllczogaGFzUHJvcGVydGllc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChjb250ZW50LCBTZWxlY3RTZXJ2aWNlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBhbGwgY29udGVudCBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEl0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29udGVudC5pdGVtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZSBhbGwgaXRlbXMgaW4gY29udGVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUl0ZW1zKCkge1xyXG4gICAgICAgICAgICBjb250ZW50Lml0ZW1zLnNwbGljZSgwLCBjb250ZW50Lml0ZW1zLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgaXRlbSB0byBjb250ZW50XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFuZy5pc0RlZmluZWQoaXRlbS5pc19leHRlbmRlZCkpIHtcclxuICAgICAgICAgICAgICAgIEl0ZW1TZXJ2aWNlLmV4dGVuZEl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBpdGVtICE9PSAnRGlyJykge1xyXG4gICAgICAgICAgICAgICAgaXRlbSA9IG5ldyBEaXIoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRlbnQuaXRlbXMucHVzaChpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIHNpbmdsZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuaXRlbXMuc3BsaWNlKGNvbnRlbnQuaXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGl0ZW0gaGFzIHByb3BlcnRpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydGllcyhpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmKCFpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJDb250ZW50RmlsdGVyJywgQ29udGVudEZpbHRlcik7XHJcblxyXG4gICAgQ29udGVudEZpbHRlci4kaW5qZWN0ID0gWyckbG9nJywgJ0NyaXBNYW5hZ2VyU2V0dGluZ3MnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb250ZW50RmlsdGVyKCRsb2csIFNldHRpbmdzKSB7XHJcbiAgICAgICAgdmFyIGZpbHRlcnMgPSB7XHJcbiAgICAgICAgICAgIGRpcjogZGlyLFxyXG4gICAgICAgICAgICB0b2dnbGU6IHRvZ2dsZSxcclxuICAgICAgICAgICAgaW1hZ2U6IHRydWUsXHJcbiAgICAgICAgICAgIG1lZGlhOiB0cnVlLFxyXG4gICAgICAgICAgICBkb2N1bWVudDogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBmaWx0ZXJzO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkaXIodmFsdWUsIGluZGV4LCBhcnJheSkge1xyXG4gICAgICAgICAgICAvLyBJZiBpdGVtIGlzIGRpciwgaXQgd2lsbCBiZSB2aXNpYmxlXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5pc0RpcilcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgYW55IHR5cGUgaXMgYWxsb3dlZFxyXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3MuaXNBbGxNZWRpYUFsbG93ZWQoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzW3ZhbHVlLnR5cGVdO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgZmlsdGVyIGVuYWJsZSBwcm9wZXJ0eSBpcyBkaXNhYmxlZCwgY29tcGFyZSB3aXRoIGFsbG93ZWQgdHlwZVxyXG4gICAgICAgICAgICByZXR1cm4gU2V0dGluZ3MuYWxsb3dlZE1lZGlhVHlwZSgpID09IHZhbHVlLnR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB0b2dnbGUoZmllbGQpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJzW2ZpZWxkXSA9PT0gJ2Jvb2xlYW4nKVxyXG4gICAgICAgICAgICAgICAgZmlsdGVyc1tmaWVsZF0gPSAhZmlsdGVyc1tmaWVsZF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJDb250ZW50T3JkZXInLCBDb250ZW50T3JkZXIpO1xyXG5cclxuICAgIENvbnRlbnRPcmRlci4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQ29udGVudE9yZGVyKCRsb2cpIHtcclxuICAgICAgICB2YXIgb3JkZXIgPSB7XHJcbiAgICAgICAgICAgIGJ5OiBvcmRlckJ5LFxyXG4gICAgICAgICAgICBpc0J5OiBpc0J5LFxyXG4gICAgICAgICAgICBzZXQ6IHNldEZpZWxkLFxyXG4gICAgICAgICAgICBmaWVsZDogJ2Z1bGxfbmFtZScsXHJcbiAgICAgICAgICAgIGlzUmV2ZXJzZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICBmdWxsX25hbWU6IHRydWUsXHJcbiAgICAgICAgICAgIGJ5dGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgdXBkYXRlZF9hdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWxsb3dlZCA9IFsnZnVsbF9uYW1lJywgJ2J5dGVzJywgJ3VwZGF0ZWRfYXQnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9yZGVyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ3xudW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb3JkZXJCeShpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAtTnVtYmVyLk1BWF9WQUxVRSAvIDI7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbVtvcmRlci5maWVsZF0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5pc0RpclVwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gaXRlbVtvcmRlci5maWVsZF0gKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgcmV2ZXJzZSBzb3J0LCBkaXJzIHNob3VsZCBub3QgY2hhbmdlIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yZGVyLmlzUmV2ZXJzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKj0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyVXApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gTnVtYmVyLk1BWF9WQUxVRSAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW1bb3JkZXIuZmllbGRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyLmlzUmV2ZXJzZSlcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnMSB7ZmllbGR9JztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAneiB7ZmllbGR9JztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRpciB1cCBzaG91bGQgYmUgb24gZmlyc3QgcGxhY2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc0RpclVwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmRlci5pc1JldmVyc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnenp6JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJzAgMCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JkZXIuaXNSZXZlcnNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJ3oge2ZpZWxkfSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcxIHtmaWVsZH0nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdXBwbGFudCh7ZmllbGQ6IGl0ZW1bb3JkZXIuZmllbGRdfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vJGxvZy5pbmZvKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJcyBjdXJyZW50IG9yZGVyIGJ5IGZpZWxkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmllbGRcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0J5KGZpZWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChhbGxvd2VkLmluZGV4T2YoZmllbGQpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHJldHVybiAhIW9yZGVyW2ZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBmaWVsZCBhcyBjdXJyZW50bHkgc29ydGFibGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNldEZpZWxkKGZpZWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChhbGxvd2VkLmluZGV4T2YoZmllbGQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBhbGxvd2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWQuaGFzT3duUHJvcGVydHkocCkgJiYgYWxsb3dlZFtwXSAhPSBmaWVsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJbYWxsb3dlZFtwXV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcmRlci5maWVsZCA9IGZpZWxkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3JkZXJbZmllbGRdKVxyXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyW2ZpZWxkXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgb3JkZXIuaXNSZXZlcnNlID0gIW9yZGVyLmlzUmV2ZXJzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0l0ZW1TZXJ2aWNlJywgSXRlbVNlcnZpY2UpO1xyXG5cclxuICAgIEl0ZW1TZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHJvb3RTY29wZScsICdDcmlwTWFuYWdlclRyYW5zJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBJdGVtU2VydmljZSgkbG9nLCAkcm9vdFNjb3BlLCBUcmFucykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdleHRlbmQnOiBleHRlbmQsXHJcbiAgICAgICAgICAgICdleHRlbmRJdGVtJzogZXh0ZW5kSXRlbVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4dGVuZCBEaXIgcmVzb3VyY2UgcmVxdWVzdCByZXNwb25zZSB3aXRoIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gcmVzb3VyY2VEYXRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKHJlc291cmNlRGF0YSkge1xyXG4gICAgICAgICAgICBuZy5leHRlbmQocmVzb3VyY2VEYXRhLCB7XHJcbiAgICAgICAgICAgICAgICAnZ2V0SXRlbXMnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbmcuZm9yRWFjaChyZXNvdXJjZURhdGEsIGZ1bmN0aW9uICh2LCBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odiwgayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaCh2KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBpdGVtcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZSBVSSBpZCBmb3IgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGtleVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaWRHZW4oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbGlzdC1pdGVtLScgKyBrZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQga2V5IGZyb20gaWRlbnRpZmllciAocmV2ZXJzZSBtZXRob2QgZnJvbSBpZEdlbilcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZGVudGlmaWVyXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRLZXkoaWRlbnRpZmllcikge1xyXG4gICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllci5zdWJzdHJpbmcoMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lIGlzIGl0ZW0gYSBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNEaXIoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbSAmJiBuZy5pc0RlZmluZWQoaXRlbS50eXBlKSAmJiBpdGVtLnR5cGUgPT09ICdkaXInO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lIGlzIGl0ZW0gYW4gYSBmb2xkZXIgdXBcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNEaXJVcChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpc0RpcihpdGVtKSAmJiAoaXRlbS5uYW1lID09ICcnIHx8IGl0ZW0ubmFtZSA9PSBudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4dGVuZCBzaW5nbGUgaXRlbSB3aXRoIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmRJdGVtKGl0ZW0sIGtleSkge1xyXG4gICAgICAgICAgICBuZy5leHRlbmQoaXRlbSwge1xyXG4gICAgICAgICAgICAgICAgaXNfZXh0ZW5kZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZW5hbWU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjogaWRHZW4oa2V5KSxcclxuICAgICAgICAgICAgICAgIGlzRGlyOiBpc0RpcihpdGVtKSxcclxuICAgICAgICAgICAgICAgIGlzRGlyVXA6IGlzRGlyVXAoaXRlbSksXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHVwZGF0ZSxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZTogZGVsZXRlSXRlbSxcclxuICAgICAgICAgICAgICAgIGdldEZ1bGxOYW1lOiBnZXRGdWxsTmFtZSxcclxuICAgICAgICAgICAgICAgIHNhdmVOZXdOYW1lOiBzYXZlTmV3TmFtZSxcclxuICAgICAgICAgICAgICAgIGdldFNpemU6IGdldFNpemVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgaXRlbSBjaGFuZ2VzIGlmIHRoZXkgYXJlIHByZXNlbnRlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2l0ZW19XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZW5hbWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVOZXdOYW1lKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBpdGVtIG5hbWUgKGlnbm9yaW5nIGZ1bGxfbmFtZSBwcm9wZXJ0eSB2YWx1ZSlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RnVsbE5hbWUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyIHx8IHRoaXMuZXh0ZW5zaW9uID09PSAnJylcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiAne25hbWV9LntleHRlbnNpb259Jy5zdXBwbGFudCh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNhdmUgaXRlbSBuYW1lIGlmIGl0IGlzIGNoYW5nZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzYXZlTmV3TmFtZSgpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAga2V5ID0gZ2V0S2V5KHNlbGYuaWRlbnRpZmllciksXHJcbiAgICAgICAgICAgICAgICBtZW51ID0gc2VsZi5tZW51O1xyXG4gICAgICAgICAgICBzZWxmLnJlbmFtZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5mdWxsX25hbWUgIT09IHNlbGYuZ2V0RnVsbE5hbWUoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1ldGhvZCA9IHNlbGYuaXNEaXIgPyAnJHJlbmFtZURpcicgOiAnJHJlbmFtZUZpbGUnO1xyXG4gICAgICAgICAgICAgICAgc2VsZlttZXRob2RdKHtcclxuICAgICAgICAgICAgICAgICAgICAnb2xkJzogc2VsZi5mdWxsX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ25ldyc6IHNlbGYuZ2V0RnVsbE5hbWUoKVxyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmcuZXh0ZW5kKHNlbGYsIGV4dGVuZEl0ZW0ocmVzcG9uc2UsIGtleSksIHttZW51OiBtZW51fSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWxldGUgaXRlbSBkZXRlY3RpbmcgaXQgdHlwZSAoZmlsZSBvciBkaXIpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlSXRlbSgpIHtcclxuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IHRoaXMuaXNEaXIgPyAnJGRlbGV0ZURpcicgOiAnJGRlbGV0ZUZpbGUnO1xyXG4gICAgICAgICAgICB0aGlzW21ldGhvZF0oe25hbWU6IHRoaXMuZnVsbF9uYW1lfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdXNlciBmcmllbmRseSBpdGVtIHNpemVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRTaXplKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ieXRlcy50b0J5dGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyTG9jYXRpb24nLCBDaGFuZ2VMb2NhdGlvblNlcnZpY2UpO1xyXG5cclxuICAgIENoYW5nZUxvY2F0aW9uU2VydmljZS4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckY29va2llcycsICckbG9jYXRpb24nLCAnJHJvb3RTY29wZScsICdEaXInLCAnSXRlbVNlcnZpY2UnLCAnQ3JpcE1hbmFnZXJCcmVhZGNydW1iJywgJ0NyaXBNYW5hZ2VyQ29udGVudCdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gQ2hhbmdlTG9jYXRpb25TZXJ2aWNlKCRjb29raWVzLCAkbG9jYXRpb24sICRyb290U2NvcGUsIERpciwgSXRlbVNlcnZpY2UsIEJyZWFkY3J1bWIsIENvbnRlbnQpIHtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJ3VybC1jaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcclxuICAgICAgICAgICAgY2hhbmdlKHtkaXI6IGFyZ3NbMF19KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdDogaW5pdGlhbExvYWQsXHJcbiAgICAgICAgICAgIGNoYW5nZTogY2hhbmdlLFxyXG4gICAgICAgICAgICBjdXJyZW50OiB7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoYW5nZSBsb2NhdGlvbiB0byBpbml0aWFsIGZvbGRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxMb2FkKCkge1xyXG4gICAgICAgICAgICBjaGFuZ2UoZ2V0TG9jYXRpb25Gcm9tQ29va2llKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhbmdlIGN1cnJlbnQgbG9jYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbZm9sZGVyXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNoYW5nZShmb2xkZXIpIHtcclxuICAgICAgICAgICAgdmFyIHBhdGggPSB7ZGlyOiBudWxsLCBuYW1lOiBudWxsfTtcclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZChmb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoLmRpciA9IG5nLmlzRW1wdHkoZm9sZGVyLmRpcikgPyBudWxsIDogZm9sZGVyLmRpcjtcclxuICAgICAgICAgICAgICAgIHBhdGgubmFtZSA9IG5nLmlzRW1wdHkoZm9sZGVyLm5hbWUpID8gbnVsbCA6IGZvbGRlci5uYW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXIucXVlcnkocGF0aCwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvb2tpZShwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgcmVzcG9uc2Ugd2l0aCByZXF1aXJlZCBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgSXRlbVNlcnZpY2UuZXh0ZW5kKHIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBvbGQgY29udGVudFxyXG4gICAgICAgICAgICAgICAgQ29udGVudC5yZW1vdmVJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRlc2VsZWN0LCBpZiBhbnkgaXRlbSBpcyBzZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgQ29udGVudC5kZXNlbGVjdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoYW5nZSBicmVhZGNydW1iIHBhdGhcclxuICAgICAgICAgICAgICAgIEJyZWFkY3J1bWIuc2V0KHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCBuZXcgY29udGVudFxyXG4gICAgICAgICAgICAgICAgbmcuZm9yRWFjaChyLmdldEl0ZW1zKCksIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGVudC5hZGQoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgbWFuYWdlciBsYXN0IGxvY2F0aW9uIGZyb20gY29va2llc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge3tkaXI6IHN0cmluZywgbmFtZTogc3RyaW5nfX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbkZyb21Db29raWUoKSB7XHJcbiAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9IHtkaXI6IG51bGwsIG5hbWU6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgdXJsID0gQnJlYWRjcnVtYi5yZXNvbHZlVXJsT2JqZWN0KCRsb2NhdGlvbi5zZWFyY2goKSk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB1cmwgY29udGFpbnMgbG9jYXRpb24sIGlnbm9yZSBjb29raWVzIHZhbHVlXHJcbiAgICAgICAgICAgIGlmIChuZy5oYXNWYWx1ZSh1cmwpKSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5kaXIgPSB1cmw7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgY29va2llRGlyID0gJGNvb2tpZXMuZ2V0KCdsb2NhdGlvbi1kaXInKSxcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAkY29va2llcy5nZXQoJ2xvY2F0aW9uLWRpci1uYW1lJyk7XHJcbiAgICAgICAgICAgIGlmIChuZy5oYXNWYWx1ZShjb29raWVEaXIpIHx8IG5nLmhhc1ZhbHVlKG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5kaXIgPSBjb29raWVEaXI7XHJcbiAgICAgICAgICAgICAgICBpZiAobmcuaXNFbXB0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgY29va2llcyBmb3IgbmV3IG1hbmFnZXIgaW5zdGFuY2UsIHRvIGJlIG9wZW5lZCBpbiBzYW1lIGxvY2F0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gbG9jYXRpb25cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24uZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uLm5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDb29raWUobG9jYXRpb24pIHtcclxuICAgICAgICAgICAgJGNvb2tpZXMucHV0KCdsb2NhdGlvbi1kaXInLCBsb2NhdGlvbi5kaXIgfHwgJycpO1xyXG4gICAgICAgICAgICAkY29va2llcy5wdXQoJ2xvY2F0aW9uLWRpci1uYW1lJywgbG9jYXRpb24ubmFtZSB8fCAnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcFByb3BlcnRpZXNNb2RhbCcsIFByb3BlcnRpZXNNb2RhbCk7XHJcblxyXG4gICAgUHJvcGVydGllc01vZGFsLiRpbmplY3QgPSBbJyRtZERpYWxvZycsICdDcmlwTWFuYWdlclNldHRpbmdzJywgJ0NyaXBNYW5hZ2VyQ29udGVudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFByb3BlcnRpZXNNb2RhbCgkbWREaWFsb2csIFNldHRpbmdzLCBDb250ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb3Blbjogb3BlblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9wZW4gaXRlbSBwcm9wZXJ0aWVzIG1vZGFsXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpdGVtLmlkZW50aWZpZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvcGVuKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYoIUNvbnRlbnQuaGFzUHJvcGVydGllcyhpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgb3BlbkZyb206ICcjJyArIGl0ZW0uaWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgIGNsb3NlVG86ICcjJyArIGl0ZW0uaWRlbnRpZmllcixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBTZXR0aW5ncy50ZW1wbGF0ZVBhdGgoJ2l0ZW0tcHJvcGVydGllcy1tb2RhbCcpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwLCAkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlclNldHRpbmdzJywgU2V0dGluZ3MpO1xyXG5cclxuICAgIFNldHRpbmdzLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZXR0aW5ncygkbG9nKSB7XHJcbiAgICAgICAgdmFyICRzZXR0aW5ncyA9ICQoJyNzZXR0aW5ncycpLFxyXG4gICAgICAgICAgICBhbGxvd2VkX21lZGlhX3R5cGVzID0gWydpbWFnZScsICdtZWRpYScsICdkb2N1bWVudCddLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgIGJhc2VfdXJsOiAkc2V0dGluZ3MuZGF0YSgnYmFzZS11cmwnKSxcclxuICAgICAgICAgICAgICAgIHB1YmxpY191cmw6ICRzZXR0aW5ncy5kYXRhKCdwdWJsaWMtdXJsJyksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHJlc29sdmVQYXJhbXMoJHNldHRpbmdzLCAncGFyYW1zJyksXHJcbiAgICAgICAgICAgICAgICBpbWdfc2l6ZXM6IEpTT04ucGFyc2UoJHNldHRpbmdzLmRhdGEoJ3NpemVzJykucmVwbGFjZUFsbChcIidcIiwgJ1wiJykpLFxyXG4gICAgICAgICAgICAgICAgZGlyVXJsOiBkaXJVcmwsXHJcbiAgICAgICAgICAgICAgICBmaWxlVXJsOiBmaWxlVXJsLFxyXG4gICAgICAgICAgICAgICAgYmFzZVVybDogYXBwZW5kQmFzZSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlUGF0aDogdGVtcGxhdGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dlZE1lZGlhVHlwZTogYWxsb3dlZE1lZGlhVHlwZSxcclxuICAgICAgICAgICAgICAgIGlzQWxsTWVkaWFBbGxvd2VkOiBpc0FsbE1lZGlhQWxsb3dlZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBiYWNrZW5kIHBhcmFtZXRlcnMgaWYgdGhleSBhcmUgcHJlc2VudGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gJGVsZW1lbnRcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YV9rZXlcclxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fEFycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVQYXJhbXMoJGVsZW1lbnQsIGRhdGFfa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSAkZWxlbWVudC5kYXRhKGRhdGFfa2V5KTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgcGFyYW1zID0gSlNPTi5wYXJzZShwYXJhbXMucmVwbGFjZUFsbChcIidcIiwgJ1wiJykpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBwbHVnaW4gZGlyIGFjdGlvbiB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRpclVybChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdkaXInLCBkaXIsIGFjdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgcGx1Z2luIGZpbGUgYWN0aW9uIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYWN0aW9uXVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZmlsZVVybChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdmaWxlJywgZGlyLCBhY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJvb3RcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFthY3Rpb25dXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhY3Rpb25Vcmwocm9vdCwgZGlyLCBhY3Rpb24pIHtcclxuICAgICAgICAgICAgdmFyIHBhdGggPSByb290ICsgJy8nO1xyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKGFjdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHBhdGggKz0gYWN0aW9uICsgJy8nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0aCArPSBkaXI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYXBwZW5kQmFzZShwYXRoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBwbHVnaW4gYmFzZSB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhcHBlbmRCYXNlKHBhdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNldHRpbmdzLmJhc2VfdXJsICsgcGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBmdWxsIHBhdGggdG8gdGVtcGxhdGVcclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVfbmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbZXh0ZW5zaW9uXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHRlbXBsYXRlUGF0aCh0ZW1wbGF0ZV9uYW1lLCBleHRlbnNpb24pIHtcclxuICAgICAgICAgICAgdmFyIHRtcCA9IHtcclxuICAgICAgICAgICAgICAgIHVybDogcHVibGljVXJsKCksXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZW1wbGF0ZV9uYW1lLFxyXG4gICAgICAgICAgICAgICAgZXh0OiBleHRlbnNpb24gfHwgJ2h0bWwnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJ3t1cmx9L3RlbXBsYXRlcy97bmFtZX0ue2V4dH0nLnN1cHBsYW50KHRtcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgYWxsb3dlZCBtZWRpYSB0eXBlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGFsbG93ZWRNZWRpYVR5cGUoKSB7XHJcbiAgICAgICAgICAgIGlmIChhbGxvd2VkX21lZGlhX3R5cGVzLmluZGV4T2Yoc2V0dGluZ3MucGFyYW1zWyd0eXBlJ10pID09PSAtMSlcclxuICAgICAgICAgICAgICAgIHJldHVybiAnZmlsZSc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2V0dGluZ3MucGFyYW1zWyd0eXBlJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc0FsbE1lZGlhQWxsb3dlZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFsbG93ZWRNZWRpYVR5cGUoKSA9PT0gJ2ZpbGUnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAsIGpRdWVyeSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJUcmFucycsIFRyYW5zKTtcclxuXHJcbiAgICBUcmFucy4kaW5qZWN0ID0gW1xyXG4gICAgICAgICdDcmlwTWFuYWdlclRyYW5zbGF0aW9ucydcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gVHJhbnMoVHJhbnNsYXRpb25zKSB7XHJcbiAgICAgICAgdmFyIHRyYW5zbGF0aW9ucyA9IHt9O1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25zW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb25zID0gVHJhbnNsYXRpb25zLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlclVwbG9hZGVyJywgVXBsb2FkZXIpO1xyXG5cclxuICAgIFVwbG9hZGVyLiRpbmplY3QgPSBbJ0NyaXBNYW5hZ2VyU2V0dGluZ3MnLCAnQ3JpcE1hbmFnZXJCcmVhZGNydW1iJywgJ0NyaXBNYW5hZ2VyQ29udGVudCcsICdVcGxvYWQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBVcGxvYWRlcihTZXR0aW5ncywgQnJlYWRjcnVtYiwgQ29udGVudCwgVXBsb2FkKSB7XHJcblxyXG4gICAgICAgIHZhciB1cGxvYWRlciA9IHtcclxuICAgICAgICAgICAgZmlsZXM6IFtdLFxyXG4gICAgICAgICAgICBhZGQ6IGFkZEZpbGUsXHJcbiAgICAgICAgICAgIGhhc0ZpbGVzOiBoYXNGaWxlcyxcclxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgICBjbGVhbjogY2xlYW4sXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDIwMCxcclxuICAgICAgICAgICAgICAgIGVycm9yOiAnJyxcclxuICAgICAgICAgICAgICAgIHVybDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IFNldHRpbmdzLmZpbGVVcmwoJ3VwbG9hZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpcjogJydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB1cGxvYWRlcjtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkRmlsZShmaWxlcykge1xyXG4gICAgICAgICAgICBuZy5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IDA7XHJcbiAgICAgICAgICAgICAgICBmaWxlLmlkID0gdXBsb2FkZXIuZmlsZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5pc0h0bWw1ID0gbmcuaXNIdG1sNTtcclxuICAgICAgICAgICAgICAgIGZpbGUuZXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHVwbG9hZGVyLmZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiB0aGVyZSBmaWxlcyBpbiBxdWV1ZSBmb3IgdXBsb2FkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNGaWxlcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZGVyLmZpbGVzLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTdGFydCB1cGxvYWQgYWxsIGZpbGVzIGZyb20gcXVldWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAoIWhhc0ZpbGVzKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBnZXQgY3VycmVudCBkaXIgZnJvbSBCcmVhZGNydW1iIGFuZCBjb252ZXJ0IGl0IHRvIHN0cmluZ1xyXG4gICAgICAgICAgICB1cGxvYWRlci5zZXR0aW5ncy51cmwuZGlyID0gQnJlYWRjcnVtYi50b1N0cmluZy5hcHBseShCcmVhZGNydW1iLmN1cnJlbnQoKSk7XHJcblxyXG4gICAgICAgICAgICBuZy5mb3JFYWNoKHVwbG9hZGVyLmZpbGVzLCBvblNpbmdsZUZpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBsb2FkIHNpbmdsZSBmaWxlIHdyYXBwZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25TaW5nbGVGaWxlKGZpbGUpIHtcclxuICAgICAgICAgICAgdmFyIHVwbG9hZCA9IFVwbG9hZC51cGxvYWQoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAne3Jvb3R9L3tkaXJ9Jy5zdXBwbGFudCh1cGxvYWRlci5zZXR0aW5ncy51cmwpLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge2ZpbGU6IGZpbGV9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdXBsb2FkLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgdXBsb2FkZXIuZmlsZXMucmVtb3ZlSXRlbShmaWxlLmlkLCAnaWQnKTtcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuYWRkKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIG5vdGlmaWNhdGlvbiBhYm91dCBlcnJvclxyXG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTAwO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCBwYXJzZUludCg5MC4wICogZXZ0LmxvYWRlZCAvIGV2dC50b3RhbCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZSBhbGwgZmlsZXMgZnJvbSB1cGxvYWRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYW4oKSB7XHJcbiAgICAgICAgICAgIHVwbG9hZGVyLmZpbGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyZWF0ZUZvbGRlclNlcnZpY2UnLCBDcmVhdGVGb2xkZXJTZXJ2aWNlKTtcclxuXHJcbiAgICBDcmVhdGVGb2xkZXJTZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJ0RpcicsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ1JlbmFtZVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENyZWF0ZUZvbGRlclNlcnZpY2UoRGlyLCBCcmVhZGNydW1iLCBDb250ZW50LCBSZW5hbWUpIHtcclxuICAgICAgICB2YXIgY3JlYXRlID0ge1xyXG4gICAgICAgICAgICBfY3JlYXRlSW5Qcm9ncmVzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbkNyZWF0ZUZvbGRlcjogY2FuQ3JlYXRlRm9sZGVyLFxyXG4gICAgICAgICAgICBjcmVhdGVGb2xkZXI6IGNyZWF0ZUZvbGRlclxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBjcmVhdGU7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlzIGZvbGRlciBjYW4gYmUgY3JlYXRlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuQ3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWNyZWF0ZS5fY3JlYXRlSW5Qcm9ncmVzc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlIG5ldyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUZvbGRlcihuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAoIWNhbkNyZWF0ZUZvbGRlcigpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY3JlYXRlLl9jcmVhdGVJblByb2dyZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIERpci5jcmVhdGUoQnJlYWRjcnVtYi5jdXJyZW50KCksIHtuYW1lOiBuYW1lfSwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZS5fY3JlYXRlSW5Qcm9ncmVzcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBjb250cm9sbGVycyB0byBoYW5kbGUgVUkgY2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBDb250ZW50LmFkZChyKTtcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuc2VsZWN0U2luZ2xlKGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGVsZXRlU2VydmljZScsIERlbGV0ZVNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIERlbGV0ZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2FuRGVsZXRlOiBjYW5EZWxldGUsXHJcbiAgICAgICAgICAgIGRlbGV0ZTogZGVsZXRlSXRlbVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGFyZSB0aGUgaXRlbSBkZWxldGFibGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGl0ZW0uaXNEaXJVcFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkRlbGV0ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IFtldmVudF1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFjYW5EZWxldGUoaXRlbSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5kZWxldGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnUmVuYW1lU2VydmljZScsIFJlbmFtZVNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlbmFtZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2FuUmVuYW1lOiBjYW5SZW5hbWUsXHJcbiAgICAgICAgICAgIGVuYWJsZVJlbmFtZTogZW5hYmxlUmVuYW1lLFxyXG4gICAgICAgICAgICByZW5hbWU6IHJlbmFtZVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyB0aGUgaXRlbSBjYW4gYmUgcmVuYW1lZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufG9iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXRlbS5pc0RpclVwXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICFpdGVtLmlzRGlyVXA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbmFibGUgaXRlbSByZW5hbWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXRlbS5pZGVudGlmaWVyXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBpdGVtLnJlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuUmVuYW1lKGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChpdGVtLnJlbmFtZSA9IHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuYW1lIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVtLnVwZGF0ZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuUmVuYW1lKGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ1NlbGVjdFNlcnZpY2UnLCBTZWxlY3RTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWxlY3RTZXJ2aWNlKCkge1xyXG4gICAgICAgIHZhciBzZWxlY3QgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkOiBbXSxcclxuICAgICAgICAgICAgc2VsZWN0OiBzZWxlY3RJdGVtLFxyXG4gICAgICAgICAgICBzZWxlY3RTaW5nbGU6IHNlbGVjdFNpbmdsZUl0ZW0sXHJcbiAgICAgICAgICAgIGRlc2VsZWN0OiBkZXNlbGVjdFNlbGVjdGVkSXRlbXMsXHJcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWRJdGVtLFxyXG4gICAgICAgICAgICBpc1NlbGVjdGVkT25lOiBpc1NlbGVjdGVkT25lSXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZEFueTogaXNTZWxlY3RlZEFueUl0ZW0sXHJcbiAgICAgICAgICAgIGdldFNlbGVjdGVkSXRlbTogZ2V0U2VsZWN0ZWRJdGVtLFxyXG4gICAgICAgICAgICBnZXRTZWxlY3RlZEl0ZW1zOiBnZXRTZWxlY3RlZEl0ZW1zLFxyXG4gICAgICAgICAgICB1cGRhdGVTZWxlY3RlZDogdXBkYXRlU2VsZWN0ZWRJdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxlY3Q7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgYW55IGl0ZW0gc2VsZWN0ZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzU2VsZWN0ZWRBbnlJdGVtKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFzZWxlY3Quc2VsZWN0ZWQubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBpdGVtIGluIHNlbGVjdGVkIGl0ZW1zIGNvbGxlY3Rpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNTZWxlY3RlZEl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzU2VsZWN0ZWRBbnlJdGVtKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgbmcuZm9yRWFjaChzZWxlY3Quc2VsZWN0ZWQsIGZ1bmN0aW9uIChzZWxlY3RlZF9pdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmcuZXF1YWxzKGl0ZW0sIHNlbGVjdGVkX2l0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGlzU2VsZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHNlbGVjdGVkIG9ubHkgb25lIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzU2VsZWN0ZWRPbmVJdGVtKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0LnNlbGVjdGVkLmxlbmd0aCA9PT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBzaW5nbGUgc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge29iamVjdHxib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNlbGVjdGVkSXRlbSgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkT25lSXRlbSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdC5zZWxlY3RlZFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBhbGwgc2VsZWN0ZWQgaXRlbXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZEl0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0LnNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIGl0ZW0gdG8gY29sbGVjdGlvbiBvZiBzZWxlY3RlZCBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgc2VsZWN0LnNlbGVjdGVkLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXNlbGVjdCBhbGwgc2VsZWN0ZWQgaXRlbXMgYW5kIHVwZGF0ZSBjaGFuZ2VzIGluIHRoZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZXNlbGVjdFNlbGVjdGVkSXRlbXMoKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZVNlbGVjdGVkSXRlbXMoKTtcclxuICAgICAgICAgICAgc2VsZWN0LnNlbGVjdGVkLnNwbGljZSgwLCBzZWxlY3Quc2VsZWN0ZWQubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlc2VsZWN0IGFsbCBzZWxlY3RlZCBpdGVtcyBhbmQgYWRkIHRoaXMgb25lIGFzIHNlbGVjdGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdFNpbmdsZUl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICBkZXNlbGVjdFNlbGVjdGVkSXRlbXMoKTtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbShpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBjaGFuZ2VzIGluIHNlbGVjdGVkIGl0ZW1zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlU2VsZWN0ZWRJdGVtcygpIHtcclxuICAgICAgICAgICAgbmcuZm9yRWFjaChnZXRTZWxlY3RlZEl0ZW1zKCksIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
