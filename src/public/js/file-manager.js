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
        var $settings = $('#settings'),
            base_url = $settings.data('base-url'),
            public_url = $settings.data('public-url'),
            img_sizes = JSON.parse($settings.data('sizes').replaceAll("'", '"'));

        $rootScope.fireBroadcast = broadcast;
        $rootScope.baseUrl = baseUrl;
        $rootScope.publicUrl = publicUrl;
        $rootScope.imgSizes = imgSizes;
        $rootScope.templatePath = templatePath;

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

        /**
         * Get image sizes
         */
        function imgSizes() {
            return img_sizes;
        }

        /**
         * Get public url
         *
         * @returns {String}
         */
        function publicUrl() {
            return public_url;
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
    }
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', '$mdMenu', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation',
        'CripManagerUploader', 'CripPropertiesModal', 'CripManagerContentOrder'
    ];

    function ActionsController($scope, $mdMenu, focus, Actions, Content, Location,
                               Uploader, PropertiesModal, ContentOrder) {
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

            $scope.order = ContentOrder;
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
        '$log', '$scope', 'CripManagerContent', 'CripManagerContentOrder'
    ];

    function DirContentController($log, $scope, Content, ContentOrder) {
        activate();

        function activate() {
            $scope.folderFilter = folderFilter;
            $scope.order = ContentOrder;
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
         * @returns {string}
         */
        function orderBy(item) {
            var text = 'z {field}';
            if (item.isDir) {
                // dir up should be on first place
                if (item.isDirUp)
                    return -1;
                text = '0 {field}';
            }

            //$log.info($scope.order.field, text.supplant({field: item[$scope.order.field]}), item);
            return text.supplant({field: item[order.field]});
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

    PropertiesModal.$inject = ['$mdDialog', '$rootScope', 'CripManagerContent'];

    function PropertiesModal($mdDialog, $rootScope, Content) {
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
                templateUrl: $rootScope.templatePath('item-properties-modal'),
                controller: 'ItemPropertiesController',
                locals: {
                    item: item
                }
            });
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
        .service('CripManagerUploader', Uploader);

    Uploader.$inject = ['$rootScope', 'CripManagerBreadcrumb', 'CripManagerContent', 'Upload'];

    function Uploader($rootScope, Breadcrumb, Content, Upload) {

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
                    root: $rootScope.fileUrl('upload'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvbmZpZy5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL0FjdGlvbnNDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvQnJlYWRjcnVtYkNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9EaXJDb250ZW50Q29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL0ZpbGVVcGxvYWRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvSXRlbUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9JdGVtUHJvcGVydGllc0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9Sb290Q29udHJvbGxlci5qcyIsInJlc291cmNlcy9EaXIuanMiLCJyZXNvdXJjZXMvVHJhbnNsYXRpb25zLmpzIiwic2VydmljZXMvQWN0aW9ucy5qcyIsInNlcnZpY2VzL0JyZWFkY3J1bWIuanMiLCJzZXJ2aWNlcy9Db250ZW50LmpzIiwic2VydmljZXMvQ29udGVudE9yZGVyLmpzIiwic2VydmljZXMvSXRlbVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9Mb2NhdGlvbi5qcyIsInNlcnZpY2VzL1Byb3BlcnRpZXNNb2RhbC5qcyIsInNlcnZpY2VzL1RyYW5zLmpzIiwic2VydmljZXMvVXBsb2FkZXIuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL0NyZWF0ZUZvbGRlclNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL0RlbGV0ZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hY3Rpb25zL1JlbmFtZVNlcnZpY2UuanMiLCJzZXJ2aWNlcy9jb250ZW50L1NlbGVjdFNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmaWxlLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlciA9IG5nLm1vZHVsZSgnY3JpcC5maWxlLW1hbmFnZXInLCBbXHJcbiAgICAgICAgJ2NyaXAuY29yZScsXHJcbiAgICAgICAgJ2NyaXAudHJhbnNwYXJlbnQtcHJvZ3Jlc3NiYXInLFxyXG4gICAgICAgICdhbmd1bGFyLWxvYWRpbmctYmFyJyxcclxuICAgICAgICAnbmdGaWxlVXBsb2FkJyxcclxuICAgICAgICAnbmdDb29raWVzJyxcclxuICAgICAgICAnbmdSZXNvdXJjZScsXHJcbiAgICAgICAgJ25nU2FuaXRpemUnLFxyXG4gICAgICAgICduZ01hdGVyaWFsJ1xyXG4gICAgXSlcclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb25maWcoTWFuYWdlckdyaWRDb25maWcpO1xyXG5cclxuICAgIE1hbmFnZXJHcmlkQ29uZmlnLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBNYW5hZ2VyR3JpZENvbmZpZygpIHtcclxuXHJcblxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCAkLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5ydW4oUnVuKTtcclxuXHJcbiAgICBSdW4uJGluamVjdCA9IFtcclxuICAgICAgICAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gUnVuKCRyb290U2NvcGUpIHtcclxuICAgICAgICB2YXIgJHNldHRpbmdzID0gJCgnI3NldHRpbmdzJyksXHJcbiAgICAgICAgICAgIGJhc2VfdXJsID0gJHNldHRpbmdzLmRhdGEoJ2Jhc2UtdXJsJyksXHJcbiAgICAgICAgICAgIHB1YmxpY191cmwgPSAkc2V0dGluZ3MuZGF0YSgncHVibGljLXVybCcpLFxyXG4gICAgICAgICAgICBpbWdfc2l6ZXMgPSBKU09OLnBhcnNlKCRzZXR0aW5ncy5kYXRhKCdzaXplcycpLnJlcGxhY2VBbGwoXCInXCIsICdcIicpKTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS5maXJlQnJvYWRjYXN0ID0gYnJvYWRjYXN0O1xyXG4gICAgICAgICRyb290U2NvcGUuYmFzZVVybCA9IGJhc2VVcmw7XHJcbiAgICAgICAgJHJvb3RTY29wZS5wdWJsaWNVcmwgPSBwdWJsaWNVcmw7XHJcbiAgICAgICAgJHJvb3RTY29wZS5pbWdTaXplcyA9IGltZ1NpemVzO1xyXG4gICAgICAgICRyb290U2NvcGUudGVtcGxhdGVQYXRoID0gdGVtcGxhdGVQYXRoO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgcGx1Z2luIGRpciBhY3Rpb24gdXJsXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFthY3Rpb25dXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICAkcm9vdFNjb3BlLmRpclVybCA9IGZ1bmN0aW9uIChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdkaXInLCBkaXIsIGFjdGlvbik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHBsdWdpbiBmaWxlIGFjdGlvbiB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICRyb290U2NvcGUuZmlsZVVybCA9IGZ1bmN0aW9uIChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVXJsKCdmaWxlJywgZGlyLCBhY3Rpb24pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmUgZXZlbnQgb24gcm9vdCBzY29wZSBmb3IgYWxsIGNvbnRyb2xsZXJzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdChldmVudE5hbWUsIGFyZ3MpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KGV2ZW50TmFtZSwgYXJncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vdFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGlvblVybChyb290LCBkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IHJvb3QgKyAnLyc7XHJcbiAgICAgICAgICAgIGlmIChuZy5pc0RlZmluZWQoYWN0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0aCArPSBhY3Rpb24gKyAnLydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXRoICs9IGRpcjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlVXJsKHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHBsdWdpbiBiYXNlIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJhc2VVcmwocGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZV91cmwgKyBwYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGltYWdlIHNpemVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaW1nU2l6ZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWdfc2l6ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgcHVibGljIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBwdWJsaWNVcmwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwdWJsaWNfdXJsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGZ1bGwgcGF0aCB0byB0ZW1wbGF0ZVxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZV9uYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtleHRlbnNpb25dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdGVtcGxhdGVQYXRoKHRlbXBsYXRlX25hbWUsIGV4dGVuc2lvbikge1xyXG4gICAgICAgICAgICB2YXIgdG1wID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBwdWJsaWNVcmwoKSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRlbXBsYXRlX25hbWUsXHJcbiAgICAgICAgICAgICAgICBleHQ6IGV4dGVuc2lvbiB8fCAnaHRtbCdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAne3VybH0vdGVtcGxhdGVzL3tuYW1lfS57ZXh0fScuc3VwcGxhbnQodG1wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCAkLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBY3Rpb25zQ29udHJvbGxlcicsIEFjdGlvbnNDb250cm9sbGVyKTtcclxuXHJcbiAgICBBY3Rpb25zQ29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckc2NvcGUnLCAnJG1kTWVudScsICdmb2N1cycsICdDcmlwTWFuYWdlckFjdGlvbnMnLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyTG9jYXRpb24nLFxyXG4gICAgICAgICdDcmlwTWFuYWdlclVwbG9hZGVyJywgJ0NyaXBQcm9wZXJ0aWVzTW9kYWwnLCAnQ3JpcE1hbmFnZXJDb250ZW50T3JkZXInXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEFjdGlvbnNDb250cm9sbGVyKCRzY29wZSwgJG1kTWVudSwgZm9jdXMsIEFjdGlvbnMsIENvbnRlbnQsIExvY2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXBsb2FkZXIsIFByb3BlcnRpZXNNb2RhbCwgQ29udGVudE9yZGVyKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jYW5EZWxldGVTZWxlY3RlZCA9IGNhbkRlbGV0ZVNlbGVjdGVkO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGVsZXRlU2VsZWN0ZWQgPSBkZWxldGVTZWxlY3RlZDtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jYW5DcmVhdGVGb2xkZXIgPSBjYW5DcmVhdGVGb2xkZXI7XHJcbiAgICAgICAgICAgICRzY29wZS5jcmVhdGVGb2xkZXIgPSBjcmVhdGVGb2xkZXI7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2FuUmVuYW1lU2VsZWN0ZWQgPSBjYW5SZW5hbWVTZWxlY3RlZDtcclxuICAgICAgICAgICAgJHNjb3BlLmVuYWJsZVJlbmFtZVNlbGVjdGVkID0gZW5hYmxlUmVuYW1lU2VsZWN0ZWQ7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2FuT3BlblNlbGVjdGVkID0gY2FuT3BlblNlbGVjdGVkO1xyXG4gICAgICAgICAgICAkc2NvcGUub3BlblNlbGVjdGVkID0gb3BlblNlbGVjdGVkO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmhhc1Byb3BlcnRpZXMgPSBoYXNQcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAkc2NvcGUub3BlblByb3BlcnRpZXMgPSBvcGVuUHJvcGVydGllcztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jYW5VcGxvYWQgPSBjYW5VcGxvYWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5oYXNVcGxvYWRzID0gaGFzVXBsb2FkcztcclxuICAgICAgICAgICAgJHNjb3BlLmFkZEZpbGVzID0gYWRkRmlsZXM7XHJcbiAgICAgICAgICAgICRzY29wZS51cGxvYWQgPSB1cGxvYWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5jYW5jZWxVcGxvYWQgPSBjYW5jZWxVcGxvYWQ7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUub3JkZXIgPSBDb250ZW50T3JkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIHNlbGVjdGVkIGl0ZW0gY2FuIGJlIGRlbGV0ZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkRlbGV0ZVNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9ucy5jYW5EZWxldGUoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWxldGUgc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICRldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVNlbGVjdGVkKCRldmVudCkge1xyXG4gICAgICAgICAgICAvLyBpZiBldmVudCBpcyBwcmVzZW50ZWQsIHN0b3AgaXQgcHJvcGFnYXRpb25cclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZCgkZXZlbnQpICYmIG5nLmlzRGVmaW5lZCgkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBBY3Rpb25zLmRlbGV0ZShDb250ZW50LmdldFNlbGVjdGVkSXRlbSgpKTtcclxuICAgICAgICAgICAgQ29udGVudC5kZXNlbGVjdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBjYW4gY3JlYXRlIG5ldyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkNyZWF0ZUZvbGRlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbnMuY2FuQ3JlYXRlRm9sZGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgbmV3IGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVGb2xkZXIobmFtZSkge1xyXG4gICAgICAgICAgICBBY3Rpb25zLmNyZWF0ZUZvbGRlcihuYW1lLCBlbmFibGVSZW5hbWVTZWxlY3RlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlmIHNlbGVjdGVkIGl0ZW0gY2FuIGJlIHJlbmFtZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhblJlbmFtZVNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9ucy5jYW5SZW5hbWUoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbmFibGUgcmVuYW1lIGZvciBzZWxlY3RlZCBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZW5hYmxlUmVuYW1lU2VsZWN0ZWQoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIGNsb3NlIG1lbnUgaWYgaXMgb3BlbiB3aGVuIGVuYWJsaW5nIHJlbmFtZSBmdW5jdGlvblxyXG4gICAgICAgICAgICAkbWRNZW51LmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGV2ZW50IGlzIHByZXNlbnRlZCwgc3RvcCBpdCBwcm9wYWdhdGlvblxyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKCRldmVudCkgJiYgbmcuaXNEZWZpbmVkKCRldmVudC5zdG9wUHJvcGFnYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBBY3Rpb25zLmVuYWJsZVJlbmFtZShpdGVtKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzKCcje2lkZW50aWZpZXJ9IGlucHV0W25hbWU9XCJuYW1lXCJdJy5zdXBwbGFudChpdGVtKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaWYgY2FuIG9wZW4gc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuT3BlblNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKS5pc0RpcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9wZW4gc2VsZWN0ZWQgZGlyZWN0b3J5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlblNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICBpZiAoIWNhbk9wZW5TZWxlY3RlZCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgTG9jYXRpb24uY2hhbmdlKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBzZWxlY3RlZCBpdGVtIGNhbiBwcm92aWRlIHByb3BlcnRpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGhhc1Byb3BlcnRpZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb250ZW50Lmhhc1Byb3BlcnRpZXMoQ29udGVudC5nZXRTZWxlY3RlZEl0ZW0oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPcGVuIGl0ZW0gcHJvcGVydGllcyBwb3AtdXBcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvcGVuUHJvcGVydGllcygkZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wZXJ0aWVzKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIFByb3BlcnRpZXNNb2RhbC5vcGVuKENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiBmaWxlIGNhbiBiZSB1cGxvYWRlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuVXBsb2FkKCkge1xyXG4gICAgICAgICAgICAvLyBhdCB0aGlzIG1vbWVudCB3ZSBjYW4gdXBsb2FkIHRvIGFueSBvcGVuIGRpclxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaWYgdGhlcmUgZmlsZXMgaW4gcXVldWUgZm9yIHVwbG9hZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzVXBsb2FkcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVwbG9hZGVyLmhhc0ZpbGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgZmlsZXMgZm9yIHVwbG9hZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZmlsZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhZGRGaWxlcyhmaWxlcykge1xyXG4gICAgICAgICAgICBVcGxvYWRlci5hZGQoZmlsZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnQgdXBsb2FkIGZpbGVzIGZyb20gcXVldWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB1cGxvYWQoKSB7XHJcbiAgICAgICAgICAgIFVwbG9hZGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYW5jZWxVcGxvYWQoKSB7XHJcbiAgICAgICAgICAgIFVwbG9hZGVyLmNsZWFuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignQnJlYWRjcnVtYkNvbnRyb2xsZXInLCBCcmVhZGNydW1iQ29udHJvbGxlcik7XHJcblxyXG4gICAgQnJlYWRjcnVtYkNvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHNjb3BlJywgJ0NyaXBNYW5hZ2VyQnJlYWRjcnVtYicsICdDcmlwTWFuYWdlckxvY2F0aW9uJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCcmVhZGNydW1iQ29udHJvbGxlcigkc2NvcGUsIEJyZWFkY3J1bWIsIExvY2F0aW9uKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5nb1RvID0gZ29UbztcclxuICAgICAgICAgICAgJHNjb3BlLmdvVG9Sb290ID0gZ29Ub1Jvb3Q7XHJcbiAgICAgICAgICAgICRzY29wZS5icmVhZGNydW1iSGFzSXRlbXMgPSBicmVhZGNydW1iSGFzSXRlbXM7XHJcbiAgICAgICAgICAgICRzY29wZS5nZXRCcmVhZGNydW1iSXRlbXMgPSBnZXRCcmVhZGNydW1iSXRlbXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHbyB0byBzcGVjaWZpZWQgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZm9sZGVyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlci5kaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLm5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnb1RvKGZvbGRlcikge1xyXG4gICAgICAgICAgICBMb2NhdGlvbi5jaGFuZ2UoZm9sZGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdvIHRvIHJvb3QgZm9sZGVyIGxvY2F0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ29Ub1Jvb3QoKSB7XHJcbiAgICAgICAgICAgIGdvVG8oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgQnJlYWRjcnVtYiBhbnkgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnJlYWRjcnVtYkhhc0l0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQnJlYWRjcnVtYi5oYXNJdGVtcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IEJyZWFkY3J1bWIgaXRlbSBjb2xsZWN0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QnJlYWRjcnVtYkl0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQnJlYWRjcnVtYi5pdGVtcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdEaXJDb250ZW50Q29udHJvbGxlcicsIERpckNvbnRlbnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBEaXJDb250ZW50Q29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICdDcmlwTWFuYWdlckNvbnRlbnQnLCAnQ3JpcE1hbmFnZXJDb250ZW50T3JkZXInXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpckNvbnRlbnRDb250cm9sbGVyKCRsb2csICRzY29wZSwgQ29udGVudCwgQ29udGVudE9yZGVyKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXJGaWx0ZXIgPSBmb2xkZXJGaWx0ZXI7XHJcbiAgICAgICAgICAgICRzY29wZS5vcmRlciA9IENvbnRlbnRPcmRlcjtcclxuICAgICAgICAgICAgJHNjb3BlLmZpbHRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1lZGlhOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmaWxlOiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbnRlbnQuZ2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvbGRlckZpbHRlcih2YWx1ZSwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgIC8vIElmIGl0ZW0gaXMgZGlyLCBpdCB3aWxsIGJlIHZpc2libGVcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmlzRGlyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZmlsdGVyIGVuYWJsZSBwcm9wZXJ0eSBhbmQgY2hlY2sgaXQgaGVyZVxyXG4gICAgICAgICAgICBpZih0cnVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5maWx0ZXJzW3ZhbHVlLnR5cGVdO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgZmlsdGVyIGVuYWJsZSBwcm9wZXJ0eSBpcyBkaXNhYmxlZCwgY29tcGFyZSB3aXRoIGFsbG93ZWQgdHlwZVxyXG4gICAgICAgICAgICAvL2lmIChTZXR0aW5ncy5nZXRUeXBlKCkgPT0gdmFsdWUudHlwZSlcclxuICAgICAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0ZpbGVVcGxvYWRDb250cm9sbGVyJywgRmlsZVVwbG9hZENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEZpbGVVcGxvYWRDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZScsICdDcmlwTWFuYWdlclVwbG9hZGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gRmlsZVVwbG9hZENvbnRyb2xsZXIoJHNjb3BlLCBVcGxvYWRlcikge1xyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuaGFzVXBsb2FkcyA9IGhhc1VwbG9hZHM7XHJcbiAgICAgICAgICAgICRzY29wZS5maWxlcyA9IGZpbGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiB0aGVyZSBmaWxlcyBpbiBxdWV1ZSBmb3IgdXBsb2FkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNVcGxvYWRzKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gVXBsb2FkZXIuaGFzRmlsZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBmaWxlcyBmcm9tIHF1ZXVlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZmlsZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBVcGxvYWRlci5maWxlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0l0ZW1Db250cm9sbGVyJywgSXRlbUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEl0ZW1Db250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyRtZE1lbnUnLCAnZm9jdXMnLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ0NyaXBNYW5hZ2VyTG9jYXRpb24nLFxyXG4gICAgICAgICdDcmlwTWFuYWdlckFjdGlvbnMnLCAnQ3JpcFByb3BlcnRpZXNNb2RhbCdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gSXRlbUNvbnRyb2xsZXIoJGxvZywgJHNjb3BlLCAkbWRNZW51LCBmb2N1cywgQ29udGVudCwgTG9jYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY3Rpb25zLCBQcm9wZXJ0aWVzTW9kYWwpIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNsaWNrID0gY2xpY2s7XHJcbiAgICAgICAgICAgICRzY29wZS5kYmxjbGljayA9IGRibGNsaWNrO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5lbmFibGVSZW5hbWUgPSBlbmFibGVSZW5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS5jYW5EZWxldGUgPSBjYW5EZWxldGU7XHJcbiAgICAgICAgICAgICRzY29wZS5kZWxldGVJdGVtID0gZGVsZXRlSXRlbTtcclxuICAgICAgICAgICAgJHNjb3BlLmhhc1Byb3BlcnRpZXMgPSBoYXNQcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAkc2NvcGUub3BlblByb3BlcnRpZXMgPSBvcGVuUHJvcGVydGllcztcclxuICAgICAgICAgICAgJHNjb3BlLm9wZW5NZW51ID0gb3Blbk1lbnU7XHJcbiAgICAgICAgICAgICRzY29wZS5jYW5PcGVuID0gY2FuT3BlbjtcclxuICAgICAgICAgICAgJHNjb3BlLm9wZW5EaXIgPSBvcGVuRGlyO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FuUmVuYW1lID0gY2FuUmVuYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT24gaXRlbSBjbGlja1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGVcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNsaWNrKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIENvbnRlbnQudXBkYXRlU2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgQ29udGVudC5kZXNlbGVjdCgpO1xyXG4gICAgICAgICAgICBDb250ZW50LnNlbGVjdFNpbmdsZShpdGVtKTtcclxuICAgICAgICAgICAgJG1kTWVudS5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPbiBpdGVtIGRvdWJsZSBjbGlja1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGVcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRibGNsaWNrKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgLy8kbG9nLmluZm8oJ2RibGNsaWNrJywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgTG9jYXRpb24uY2hhbmdlKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGl0ZW0gc2VsZWN0ZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNTZWxlY3RlZChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb250ZW50LmlzU2VsZWN0ZWQoaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbmFibGUgaXRlbSByZW5hbWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBlbmFibGVSZW5hbWUoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICgkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxyXG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgJG1kTWVudS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHZhciBpdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYoJGV2ZW50LmlzX2V4dGVuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtID0gJGV2ZW50O1xyXG4gICAgICAgICAgICAgICAgQ29udGVudC5zZWxlY3RTaW5nbGUoaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICAgICAgaXRlbSA9IENvbnRlbnQuZ2V0U2VsZWN0ZWRJdGVtKCk7XHJcblxyXG4gICAgICAgICAgICBBY3Rpb25zLmVuYWJsZVJlbmFtZShpdGVtKTtcclxuICAgICAgICAgICAgZm9jdXMoJyN7aWRlbnRpZmllcn0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nLnN1cHBsYW50KGl0ZW0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkRlbGV0ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25zLmNhbkRlbGV0ZShpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBpdGVtIGZyb20gZmlsZSBzeXN0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlSXRlbShpdGVtKSB7XHJcbiAgICAgICAgICAgIEFjdGlvbnMuZGVsZXRlKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydGllcyhpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb250ZW50Lmhhc1Byb3BlcnRpZXMoaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcGVuUHJvcGVydGllcyhpdGVtKSB7XHJcbiAgICAgICAgICAgIFByb3BlcnRpZXNNb2RhbC5vcGVuKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3Blbk1lbnUoaXRlbSwgJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICRtZE1lbnUuaGlkZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5tZW51LiRtZE9wZW5NZW51KCRldmVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuT3BlbihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmlzRGlyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlbkRpcihkaXIpIHtcclxuICAgICAgICAgICAgaWYgKCFjYW5PcGVuKGRpcikpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBMb2NhdGlvbi5jaGFuZ2UoZGlyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhblJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0l0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcicsIEl0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcik7XHJcblxyXG4gICAgSXRlbVByb3BlcnRpZXNDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyRtZERpYWxvZycsICdDcmlwTWFuYWdlclRyYW5zJywgJ2l0ZW0nXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEl0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRtZERpYWxvZywgVHJhbnMsIGl0ZW0pIHtcclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJGxvZy5pbmZvKGl0ZW0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXRlbSA9IHJlc29sdmVJdGVtRGV0YWlscyhpdGVtKTtcclxuICAgICAgICAgICAgJHNjb3BlLnRodW1iID0gaXRlbS50aHVtYjtcclxuICAgICAgICAgICAgJHNjb3BlLm5hbWUgPSBpdGVtLmZ1bGxfbmFtZTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jbG9zZSA9IGNsb3NlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGlkZSBtb2RhbFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgICAgICAkbWREaWFsb2cuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVzb2x2ZSBpdGVtIGRldGFpbHNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVJdGVtRGV0YWlscyhpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZURpckRldGFpbHMoaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZpbGVEZXRhaWxzKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgaXRlbSBkZWZhdWx0IGRldGFpbHNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGRldGFpbHNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpdGVtLmZ1bGxfbmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpdGVtLnVwZGF0ZWRfYXRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVtLmdldFNpemVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWZhdWx0RGV0YWlscyhkZXRhaWxzLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICRsb2cubG9nKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfZmlsZV90eXBlXycgKyBpdGVtLnR5cGUpO1xyXG4gICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX3R5cGUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2ZpbGVfdHlwZV8nICsgaXRlbS50eXBlKVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX25hbWUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLmZ1bGxfbmFtZVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX2RhdGUnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLnVwZGF0ZWRfYXRcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplJyksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5nZXRTaXplKClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNvbHZlIGZvbGRlciBkZXRhaWxzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlRGlyRGV0YWlscyhpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXRhaWxzID0gW107XHJcbiAgICAgICAgICAgIGRlZmF1bHREZXRhaWxzKGRldGFpbHMsIGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNvbHZlIGZpbGUgZGV0YWlsc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZUZpbGVEZXRhaWxzKGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRldGFpbHMgPSBbXTtcclxuICAgICAgICAgICAgZGVmYXVsdERldGFpbHMoZGV0YWlscywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbS5kaXIgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfaXRlbV9kaXInKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5kaXJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9pdGVtX2V4dGVuc2lvbicpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0uZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2ltYWdlJyAmJiBuZy5oYXNWYWx1ZShpdGVtLnRodW1icykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfaXRlbV91cmwnKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJzxhIGhyZWY9XCJ7dXJsfVwiIHRhcmdldD1cIl9ibGFua1wiPnt0aXRsZX08L2E+Jy5zdXBwbGFudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaXRlbS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBUcmFucygnaXRlbV9wcm9wZXJ0aWVzX21vZGFsX3NpemVfZGltJykuc3VwcGxhbnQoaXRlbS5zaXplKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZy5mb3JFYWNoKGl0ZW0udGh1bWJzLCBmdW5jdGlvbiAodmFsLCBzaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplX3VybF90aXRsZScpLnN1cHBsYW50KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfc2l6ZV9rZXlfJyArIHNpemUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJzxhIGhyZWY9XCJ7dXJsfVwiIHRhcmdldD1cIl9ibGFua1wiPnt0aXRsZX08L2E+Jy5zdXBwbGFudCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHZhbC51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogVHJhbnMoJ2l0ZW1fcHJvcGVydGllc19tb2RhbF9zaXplX2RpbScpLnN1cHBsYW50KHZhbC5zaXplKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFRyYW5zKCdpdGVtX3Byb3BlcnRpZXNfbW9kYWxfaXRlbV91cmwnKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJzxhIGhyZWY9XCJ7dXJsfVwiIHRhcmdldD1cIl9ibGFua1wiPntmdWxsX25hbWV9PC9hPicuc3VwcGxhbnQoaXRlbSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSb290Q29udHJvbGxlcicsIFJvb3RDb250cm9sbGVyKTtcclxuXHJcbiAgICBSb290Q29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckc2NvcGUnLCAnJG1kTWVudScsICdDcmlwTWFuYWdlckxvY2F0aW9uJywgJ0NyaXBNYW5hZ2VyQ29udGVudCcsICdDcmlwTWFuYWdlclRyYW5zJywgJ0NyaXBNYW5hZ2VyQnJlYWRjcnVtYidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gUm9vdENvbnRyb2xsZXIoJHNjb3BlLCAkbWRNZW51LCBMb2NhdGlvbiwgQ29udGVudCwgVHJhbnMsIEJyZWFkY3J1bWIpIHtcclxuXHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgIC8vIGluaXRpYWxpc2UgZmlsZSBtYW5hZ2VyIGluaXRpYWwgbG9jYXRpb24gYW5kIGxvYWQgdHJhbnNsYXRpb25zXHJcbiAgICAgICAgICAgIFRyYW5zKCkuaW5pdCgpO1xyXG4gICAgICAgICAgICBMb2NhdGlvbi5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZGVzZWxlY3QgPSBkZXNlbGVjdDtcclxuICAgICAgICAgICAgJHNjb3BlLnJlZnJlc2hDb250ZW50ID0gcmVmcmVzaENvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBkZXNlbGVjdCgpIHtcclxuICAgICAgICAgICAgQ29udGVudC5kZXNlbGVjdCgpO1xyXG4gICAgICAgICAgICAkbWRNZW51LmhpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlZnJlc2hDb250ZW50KCkge1xyXG4gICAgICAgICAgICBMb2NhdGlvbi5jaGFuZ2UoQnJlYWRjcnVtYi5jdXJyZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0RpcicsIERpcik7XHJcblxyXG4gICAgRGlyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyZXNvdXJjZScsICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBEaXIoJHJlc291cmNlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZSgkcm9vdFNjb3BlLmRpclVybCgnOmRpci86bmFtZScpLCB7XHJcbiAgICAgICAgICAgIGRpcjogJ0BkaXInLFxyXG4gICAgICAgICAgICBuYW1lOiAnQG5hbWUnXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAnY3JlYXRlJzoge3VybDogJHJvb3RTY29wZS5kaXJVcmwoJzpkaXIvOm5hbWUnLCAnY3JlYXRlJyksIG1ldGhvZDogJ1BPU1QnfSxcclxuICAgICAgICAgICAgJ2RlbGV0ZURpcic6IHt1cmw6ICRyb290U2NvcGUuZGlyVXJsKCc6ZGlyJywgJ2RlbGV0ZScpLCBtZXRob2Q6ICdHRVQnfSxcclxuICAgICAgICAgICAgJ2RlbGV0ZUZpbGUnOiB7dXJsOiAkcm9vdFNjb3BlLmZpbGVVcmwoJzpkaXIvOm5hbWUnLCAnZGVsZXRlJyksIG1ldGhvZDogJ0dFVCd9LFxyXG4gICAgICAgICAgICAncmVuYW1lRGlyJzoge3VybDogJHJvb3RTY29wZS5kaXJVcmwoJzpkaXInLCAncmVuYW1lJyksIG1ldGhvZDogJ0dFVCd9LFxyXG4gICAgICAgICAgICAncmVuYW1lRmlsZSc6IHt1cmw6ICRyb290U2NvcGUuZmlsZVVybCgnOmRpcicsICdyZW5hbWUnKSwgbWV0aG9kOiAnR0VUJ31cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlclRyYW5zbGF0aW9ucycsIFRyYW5zbGF0aW9ucyk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyZXNvdXJjZScsICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUcmFuc2xhdGlvbnMoJHJlc291cmNlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZSgkcm9vdFNjb3BlLmJhc2VVcmwoJ3RyYW5zbGF0aW9ucycpKTtcclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyQWN0aW9ucycsIEFjdGlvbnMpO1xyXG5cclxuICAgIEFjdGlvbnMuJGluamVjdCA9IFtcclxuICAgICAgICAnQ3JlYXRlRm9sZGVyU2VydmljZScsICdEZWxldGVTZXJ2aWNlJywgJ1JlbmFtZVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEFjdGlvbnMoQ3JlYXRlRm9sZGVyLCBEZWxldGUsIFJlbmFtZSkge1xyXG4gICAgICAgIHZhciBzY29wZSA9IHt9O1xyXG4gICAgICAgIG5nLmV4dGVuZChzY29wZSwgQ3JlYXRlRm9sZGVyLCBEZWxldGUsIFJlbmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzY29wZTtcclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJCcmVhZGNydW1iJywgQnJlYWRjcnVtYik7XHJcblxyXG4gICAgQnJlYWRjcnVtYi4kaW5qZWN0ID0gWyckbG9jYXRpb24nLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJyZWFkY3J1bWIoJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGJyZWFkY3J1bWIgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgaGFzSXRlbXM6IGhhc0l0ZW1zLFxyXG4gICAgICAgICAgICBjdXJyZW50OiBjdXJyZW50LFxyXG4gICAgICAgICAgICBzZXQ6IHNldExvY2F0aW9uLFxyXG4gICAgICAgICAgICB1cmxDaGFuZ2VJZ25vcmU6IGZhbHNlLFxyXG4gICAgICAgICAgICByZXNvbHZlVXJsT2JqZWN0OiByZXNvbHZlVXJsT2JqZWN0LFxyXG4gICAgICAgICAgICB0b1N0cmluZzogdG9TdHJpbmdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBXYXRjaCBsb2NhdGlvbiBjaGFuZ2UgYW5kIGZpcmUgZXZlbnQsIGlmIGl0IGlzIGNoYW5nZWQgYnkgdXNlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICRyb290U2NvcGUuJHdhdGNoKGxvY2F0aW9uLCBvblVybExvY2F0aW9uQ2hhbmdlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJyZWFkY3J1bWI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBjdXJyZW50IGZvbGRlciBsb2NhdGlvbiBvYmplY3RcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY3VycmVudCgpIHtcclxuICAgICAgICAgICAgaWYgKGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge2RpcjogJycsIG5hbWU6ICcnfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJyZWFkY3J1bWIuaXRlbXNbYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggLSAxXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlzIHRoZXJlIGFueSBpdGVtIGluIGJyZWFkY3J1bWJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGhhc0l0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFicmVhZGNydW1iLml0ZW1zLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBuZXcgbG9jYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmb2xkZXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLmRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXIubmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvY2F0aW9uKGZvbGRlcikge1xyXG4gICAgICAgICAgICBvbkxvY2F0aW9uQ2hhbmdlKHtkaXI6IGZvbGRlci5kaXIsIG5hbWU6IGZvbGRlci5uYW1lfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgYnJlYWRjcnVtYiBhcnJheSB3aGVuIG1hbmFnZXIgcHJvcGVydHkgaXMgY2hhbmdlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHZhbFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwuZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbC5uYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25Mb2NhdGlvbkNoYW5nZSh2YWwpIHtcclxuICAgICAgICAgICAgdmFyIHN0cmluZ192YWx1ZSA9IHRvU3RyaW5nLmFwcGx5KHZhbCk7XHJcbiAgICAgICAgICAgIGJyZWFkY3J1bWIuaXRlbXMuc3BsaWNlKDAsIGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgc2V0VXJsTG9jYXRpb24oc3RyaW5nX3ZhbHVlKTtcclxuICAgICAgICAgICAgbmcuZm9yRWFjaChzdHJpbmdfdmFsdWUuc3BsaXQoJ1xcLycpLmNsZWFuKCcnLCBudWxsKSwgZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBjdXJyZW50IGRpciBmcm9tIHByZXZpb3VzIGl0ZW0sIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgICAgICAgICAgdmFyIGRpciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJyZWFkY3J1bWIuaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG9ubHkgb25lIHByZXZpb3VzIGl0ZW0sIHVzZSBpdGBzIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyID0gYnJlYWRjcnVtYi5pdGVtc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlciB3YXksIGNvbmNhdCBwcmV2IGRpciB3aXRoIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyID0gJ3tkaXJ9L3tuYW1lfScuc3VwcGxhbnQoYnJlYWRjcnVtYi5pdGVtc1ticmVhZGNydW1iLml0ZW1zLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWRjcnVtYi5pdGVtcy5wdXNoKHtuYW1lOiB2LCBkaXI6IGRpciwgaXNBY3RpdmU6IGZhbHNlfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gbWFyayBsYXN0IGl0ZW0gYXMgYWN0aXZlLCB0aGlzIHdpbGwgaGVscCBtYXJrIGl0ZW0gYXMgYWN0aXZlXHJcbiAgICAgICAgICAgIGlmIChicmVhZGNydW1iLml0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFkY3J1bWIuaXRlbXNbYnJlYWRjcnVtYi5pdGVtcy5sZW5ndGggLSAxXS5pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBjdXJyZW50IGxvY2F0aW9uIHRvIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHBhcnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VXJsTG9jYXRpb24ocGFydHMpIHtcclxuICAgICAgICAgICAgYnJlYWRjcnVtYi51cmxDaGFuZ2VJZ25vcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSB0eXBlb2YgcGFydHMgPT09ICdzdHJpbmcnID8gcGFydHMuc3BsaXQoJ1xcLycpIDogcGFydHM7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmNsZWFuKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24ubGVuZ3RoID4gMCAmJiBuZy5oYXNWYWx1ZShsb2NhdGlvblswXSkpIHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ2wnLCBsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24uc2VhcmNoKCdsJywgbnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWRjcnVtYi51cmxDaGFuZ2VJZ25vcmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBjdXJyZW50IHVybCBsb2NhdGlvbiBvYmplY3RcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfE9iamVjdH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRsb2NhdGlvbi5zZWFyY2goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uVXJsTG9jYXRpb25DaGFuZ2Uobiwgbykge1xyXG4gICAgICAgICAgICBpZiAoIWJyZWFkY3J1bWIudXJsQ2hhbmdlSWdub3JlICYmICFuZy5lcXVhbHMobiwgbykpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuZmlyZUJyb2FkY2FzdCgndXJsLWNoYW5nZScsIFtyZXNvbHZlVXJsT2JqZWN0KG4pXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlc29sdmUgJGxvY2F0aW9uIG9iamVjdCBybyBwYXRoIHN0cmluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2F0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IGxvY2F0aW9uLmxcclxuICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVybE9iamVjdChsb2NhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChuZy5oYXNWYWx1ZShsb2NhdGlvbi5sKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IGxvY2F0aW9uLmw7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmpvaW4oJy8nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb252ZXJ0IGNvbnRleHQgdG8gc3RyaW5nIHZhbHVlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gW3ZhbHVlXVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXIgPSB0aGlzLmRpciB8fCAnJztcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lIHx8ICcnO1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICd7ZGlyfS97bmFtZX0nLnN1cHBsYW50KHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCdcXC8nKS5jbGVhbigpLmpvaW4oJ1xcLycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyQ29udGVudCcsIENvbnRlbnQpO1xyXG5cclxuICAgIENvbnRlbnQuJGluamVjdCA9IFsnSXRlbVNlcnZpY2UnLCAnU2VsZWN0U2VydmljZScsICdEaXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDb250ZW50KEl0ZW1TZXJ2aWNlLCBTZWxlY3RTZXJ2aWNlLCBEaXIpIHtcclxuICAgICAgICB2YXIgY29udGVudCA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IFtdLFxyXG4gICAgICAgICAgICBnZXQ6IGdldEl0ZW1zLFxyXG4gICAgICAgICAgICBhZGQ6IGFkZCxcclxuICAgICAgICAgICAgcmVtb3ZlOiByZW1vdmUsXHJcbiAgICAgICAgICAgIHJlbW92ZUl0ZW1zOiByZW1vdmVJdGVtcyxcclxuICAgICAgICAgICAgaGFzUHJvcGVydGllczogaGFzUHJvcGVydGllc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5nLmV4dGVuZChjb250ZW50LCBTZWxlY3RTZXJ2aWNlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBhbGwgY29udGVudCBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEl0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29udGVudC5pdGVtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZSBhbGwgaXRlbXMgaW4gY29udGVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUl0ZW1zKCkge1xyXG4gICAgICAgICAgICBjb250ZW50Lml0ZW1zLnNwbGljZSgwLCBjb250ZW50Lml0ZW1zLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgaXRlbSB0byBjb250ZW50XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFuZy5pc0RlZmluZWQoaXRlbS5pc19leHRlbmRlZCkpIHtcclxuICAgICAgICAgICAgICAgIEl0ZW1TZXJ2aWNlLmV4dGVuZEl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBpdGVtICE9PSAnRGlyJykge1xyXG4gICAgICAgICAgICAgICAgaXRlbSA9IG5ldyBEaXIoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRlbnQuaXRlbXMucHVzaChpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIHNpbmdsZSBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuaXRlbXMuc3BsaWNlKGNvbnRlbnQuaXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIGl0ZW0gaGFzIHByb3BlcnRpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaGFzUHJvcGVydGllcyhpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmKCFpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJDb250ZW50T3JkZXInLCBDb250ZW50T3JkZXIpO1xyXG5cclxuICAgIENvbnRlbnRPcmRlci4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQ29udGVudE9yZGVyKCRsb2cpIHtcclxuICAgICAgICB2YXIgb3JkZXIgPSB7XHJcbiAgICAgICAgICAgIGJ5OiBvcmRlckJ5LFxyXG4gICAgICAgICAgICBpc0J5OiBpc0J5LFxyXG4gICAgICAgICAgICBzZXQ6IHNldEZpZWxkLFxyXG4gICAgICAgICAgICBmaWVsZDogJ2Z1bGxfbmFtZScsXHJcbiAgICAgICAgICAgIGlzUmV2ZXJzZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICBmdWxsX25hbWU6IHRydWUsXHJcbiAgICAgICAgICAgIGJ5dGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgdXBkYXRlZF9hdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWxsb3dlZCA9IFsnZnVsbF9uYW1lJywgJ2J5dGVzJywgJ3VwZGF0ZWRfYXQnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9yZGVyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBvcmRlckJ5KGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRleHQgPSAneiB7ZmllbGR9JztcclxuICAgICAgICAgICAgaWYgKGl0ZW0uaXNEaXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRpciB1cCBzaG91bGQgYmUgb24gZmlyc3QgcGxhY2VcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyVXApXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICAgICAgdGV4dCA9ICcwIHtmaWVsZH0nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyRsb2cuaW5mbygkc2NvcGUub3JkZXIuZmllbGQsIHRleHQuc3VwcGxhbnQoe2ZpZWxkOiBpdGVtWyRzY29wZS5vcmRlci5maWVsZF19KSwgaXRlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnN1cHBsYW50KHtmaWVsZDogaXRlbVtvcmRlci5maWVsZF19KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElzIGN1cnJlbnQgb3JkZXIgYnkgZmllbGRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzQnkoZmllbGQpIHtcclxuICAgICAgICAgICAgaWYgKGFsbG93ZWQuaW5kZXhPZihmaWVsZCkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEhb3JkZXJbZmllbGRdO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IGZpZWxkIGFzIGN1cnJlbnRseSBzb3J0YWJsZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpZWxkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0RmllbGQoZmllbGQpIHtcclxuICAgICAgICAgICAgaWYgKGFsbG93ZWQuaW5kZXhPZihmaWVsZCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwIGluIGFsbG93ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dlZC5oYXNPd25Qcm9wZXJ0eShwKSAmJiBhbGxvd2VkW3BdICE9IGZpZWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlclthbGxvd2VkW3BdXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG9yZGVyLmZpZWxkID0gZmllbGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcmRlcltmaWVsZF0pXHJcbiAgICAgICAgICAgICAgICAgICAgb3JkZXJbZmllbGRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBvcmRlci5pc1JldmVyc2UgPSAhb3JkZXIuaXNSZXZlcnNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnSXRlbVNlcnZpY2UnLCBJdGVtU2VydmljZSk7XHJcblxyXG4gICAgSXRlbVNlcnZpY2UuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcm9vdFNjb3BlJywgJ0NyaXBNYW5hZ2VyVHJhbnMnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIEl0ZW1TZXJ2aWNlKCRsb2csICRyb290U2NvcGUsIFRyYW5zKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2V4dGVuZCc6IGV4dGVuZCxcclxuICAgICAgICAgICAgJ2V4dGVuZEl0ZW0nOiBleHRlbmRJdGVtXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXh0ZW5kIERpciByZXNvdXJjZSByZXF1ZXN0IHJlc3BvbnNlIHdpdGggcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSByZXNvdXJjZURhdGFcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmQocmVzb3VyY2VEYXRhKSB7XHJcbiAgICAgICAgICAgIG5nLmV4dGVuZChyZXNvdXJjZURhdGEsIHtcclxuICAgICAgICAgICAgICAgICdnZXRJdGVtcyc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBuZy5mb3JFYWNoKHJlc291cmNlRGF0YSwgZnVuY3Rpb24gKHYsIGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kSXRlbSh2LCBrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoKHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGl0ZW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlIFVJIGlkIGZvciBpdGVtXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpZEdlbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdsaXN0LWl0ZW0tJyArIGtleTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBrZXkgZnJvbSBpZGVudGlmaWVyIChyZXZlcnNlIG1ldGhvZCBmcm9tIGlkR2VuKVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkZW50aWZpZXJcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEtleShpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyLnN1YnN0cmluZygxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpcihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtICYmIG5nLmlzRGVmaW5lZChpdGVtLnR5cGUpICYmIGl0ZW0udHlwZSA9PT0gJ2Rpcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhbiBhIGZvbGRlciB1cFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpclVwKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGlyKGl0ZW0pICYmIChpdGVtLm5hbWUgPT0gJycgfHwgaXRlbS5uYW1lID09IG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXh0ZW5kIHNpbmdsZSBpdGVtIHdpdGggcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIGtleVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGV4dGVuZEl0ZW0oaXRlbSwga2V5KSB7XHJcbiAgICAgICAgICAgIG5nLmV4dGVuZChpdGVtLCB7XHJcbiAgICAgICAgICAgICAgICBpc19leHRlbmRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlbmFtZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpZGVudGlmaWVyOiBpZEdlbihrZXkpLFxyXG4gICAgICAgICAgICAgICAgaXNEaXI6IGlzRGlyKGl0ZW0pLFxyXG4gICAgICAgICAgICAgICAgaXNEaXJVcDogaXNEaXJVcChpdGVtKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgICAgICAgICAgICAgZGVsZXRlOiBkZWxldGVJdGVtLFxyXG4gICAgICAgICAgICAgICAgZ2V0RnVsbE5hbWU6IGdldEZ1bGxOYW1lLFxyXG4gICAgICAgICAgICAgICAgc2F2ZU5ld05hbWU6IHNhdmVOZXdOYW1lLFxyXG4gICAgICAgICAgICAgICAgZ2V0U2l6ZTogZ2V0U2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBpdGVtIGNoYW5nZXMgaWYgdGhleSBhcmUgcHJlc2VudGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7aXRlbX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbmFtZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5ld05hbWUoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGl0ZW0gbmFtZSAoaWdub3JpbmcgZnVsbF9uYW1lIHByb3BlcnR5IHZhbHVlKVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRGdWxsTmFtZSgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXIgfHwgdGhpcy5leHRlbnNpb24gPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICd7bmFtZX0ue2V4dGVuc2lvbn0nLnN1cHBsYW50KHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2F2ZSBpdGVtIG5hbWUgaWYgaXQgaXMgY2hhbmdlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNhdmVOZXdOYW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBnZXRLZXkoc2VsZi5pZGVudGlmaWVyKSxcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBzZWxmLm1lbnU7XHJcbiAgICAgICAgICAgIHNlbGYucmVuYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmZ1bGxfbmFtZSAhPT0gc2VsZi5nZXRGdWxsTmFtZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWV0aG9kID0gc2VsZi5pc0RpciA/ICckcmVuYW1lRGlyJyA6ICckcmVuYW1lRmlsZSc7XHJcbiAgICAgICAgICAgICAgICBzZWxmW21ldGhvZF0oe1xyXG4gICAgICAgICAgICAgICAgICAgICdvbGQnOiBzZWxmLmZ1bGxfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAnbmV3Jzogc2VsZi5nZXRGdWxsTmFtZSgpXHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZy5leHRlbmQoc2VsZiwgZXh0ZW5kSXRlbShyZXNwb25zZSwga2V5KSwge21lbnU6IG1lbnV9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBpdGVtIGRldGVjdGluZyBpdCB0eXBlIChmaWxlIG9yIGRpcilcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVJdGVtKCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gdGhpcy5pc0RpciA/ICckZGVsZXRlRGlyJyA6ICckZGVsZXRlRmlsZSc7XHJcbiAgICAgICAgICAgIHRoaXNbbWV0aG9kXSh7bmFtZTogdGhpcy5mdWxsX25hbWV9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCB1c2VyIGZyaWVuZGx5IGl0ZW0gc2l6ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNpemUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ5dGVzLnRvQnl0ZXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnQ3JpcE1hbmFnZXJMb2NhdGlvbicsIENoYW5nZUxvY2F0aW9uU2VydmljZSk7XHJcblxyXG4gICAgQ2hhbmdlTG9jYXRpb25TZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRjb29raWVzJywgJyRsb2NhdGlvbicsICckcm9vdFNjb3BlJywgJ0RpcicsICdJdGVtU2VydmljZScsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJDb250ZW50J1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBDaGFuZ2VMb2NhdGlvblNlcnZpY2UoJGNvb2tpZXMsICRsb2NhdGlvbiwgJHJvb3RTY29wZSwgRGlyLCBJdGVtU2VydmljZSwgQnJlYWRjcnVtYiwgQ29udGVudCkge1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbigndXJsLWNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgYXJncykge1xyXG4gICAgICAgICAgICBjaGFuZ2Uoe2RpcjogYXJnc1swXX0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0OiBpbml0aWFsTG9hZCxcclxuICAgICAgICAgICAgY2hhbmdlOiBjaGFuZ2UsXHJcbiAgICAgICAgICAgIGN1cnJlbnQ6IHt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhbmdlIGxvY2F0aW9uIHRvIGluaXRpYWwgZm9sZGVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbExvYWQoKSB7XHJcbiAgICAgICAgICAgIGNoYW5nZShnZXRMb2NhdGlvbkZyb21Db29raWUoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGFuZ2UgY3VycmVudCBsb2NhdGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IFtmb2xkZXJdXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2hhbmdlKGZvbGRlcikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9IHtkaXI6IG51bGwsIG5hbWU6IG51bGx9O1xyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKGZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgIHBhdGguZGlyID0gbmcuaXNFbXB0eShmb2xkZXIuZGlyKSA/IG51bGwgOiBmb2xkZXIuZGlyO1xyXG4gICAgICAgICAgICAgICAgcGF0aC5uYW1lID0gbmcuaXNFbXB0eShmb2xkZXIubmFtZSkgPyBudWxsIDogZm9sZGVyLm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIERpci5xdWVyeShwYXRoLCBmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29va2llKHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCByZXNwb25zZSB3aXRoIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBJdGVtU2VydmljZS5leHRlbmQocik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG9sZCBjb250ZW50XHJcbiAgICAgICAgICAgICAgICBDb250ZW50LnJlbW92ZUl0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZGVzZWxlY3QsIGlmIGFueSBpdGVtIGlzIHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICBDb250ZW50LmRlc2VsZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hhbmdlIGJyZWFkY3J1bWIgcGF0aFxyXG4gICAgICAgICAgICAgICAgQnJlYWRjcnVtYi5zZXQocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIG5ldyBjb250ZW50XHJcbiAgICAgICAgICAgICAgICBuZy5mb3JFYWNoKHIuZ2V0SXRlbXMoKSwgZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBDb250ZW50LmFkZChpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBtYW5hZ2VyIGxhc3QgbG9jYXRpb24gZnJvbSBjb29raWVzXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7e2Rpcjogc3RyaW5nLCBuYW1lOiBzdHJpbmd9fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldExvY2F0aW9uRnJvbUNvb2tpZSgpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0ge2RpcjogbnVsbCwgbmFtZTogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICB1cmwgPSBCcmVhZGNydW1iLnJlc29sdmVVcmxPYmplY3QoJGxvY2F0aW9uLnNlYXJjaCgpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIHVybCBjb250YWlucyBsb2NhdGlvbiwgaWdub3JlIGNvb2tpZXMgdmFsdWVcclxuICAgICAgICAgICAgaWYgKG5nLmhhc1ZhbHVlKHVybCkpIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmRpciA9IHVybDtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjb29raWVEaXIgPSAkY29va2llcy5nZXQoJ2xvY2F0aW9uLWRpcicpLFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICRjb29raWVzLmdldCgnbG9jYXRpb24tZGlyLW5hbWUnKTtcclxuICAgICAgICAgICAgaWYgKG5nLmhhc1ZhbHVlKGNvb2tpZURpcikgfHwgbmcuaGFzVmFsdWUobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmRpciA9IGNvb2tpZURpcjtcclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc0VtcHR5KG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBjb29raWVzIGZvciBuZXcgbWFuYWdlciBpbnN0YW5jZSwgdG8gYmUgb3BlbmVkIGluIHNhbWUgbG9jYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbi5kaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24ubmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvb2tpZShsb2NhdGlvbikge1xyXG4gICAgICAgICAgICAkY29va2llcy5wdXQoJ2xvY2F0aW9uLWRpcicsIGxvY2F0aW9uLmRpciB8fCAnJyk7XHJcbiAgICAgICAgICAgICRjb29raWVzLnB1dCgnbG9jYXRpb24tZGlyLW5hbWUnLCBsb2NhdGlvbi5uYW1lIHx8ICcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwUHJvcGVydGllc01vZGFsJywgUHJvcGVydGllc01vZGFsKTtcclxuXHJcbiAgICBQcm9wZXJ0aWVzTW9kYWwuJGluamVjdCA9IFsnJG1kRGlhbG9nJywgJyRyb290U2NvcGUnLCAnQ3JpcE1hbmFnZXJDb250ZW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gUHJvcGVydGllc01vZGFsKCRtZERpYWxvZywgJHJvb3RTY29wZSwgQ29udGVudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9wZW46IG9wZW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPcGVuIGl0ZW0gcHJvcGVydGllcyBtb2RhbFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXRlbS5pZGVudGlmaWVyXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmKCFDb250ZW50Lmhhc1Byb3BlcnRpZXMoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coe1xyXG4gICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG9wZW5Gcm9tOiAnIycgKyBpdGVtLmlkZW50aWZpZXIsXHJcbiAgICAgICAgICAgICAgICBjbG9zZVRvOiAnIycgKyBpdGVtLmlkZW50aWZpZXIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJHJvb3RTY29wZS50ZW1wbGF0ZVBhdGgoJ2l0ZW0tcHJvcGVydGllcy1tb2RhbCcpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1Qcm9wZXJ0aWVzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICBsb2NhbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdDcmlwTWFuYWdlclRyYW5zJywgVHJhbnMpO1xyXG5cclxuICAgIFRyYW5zLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJ0NyaXBNYW5hZ2VyVHJhbnNsYXRpb25zJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBUcmFucyhUcmFuc2xhdGlvbnMpIHtcclxuICAgICAgICB2YXIgdHJhbnNsYXRpb25zID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbnMgPSBUcmFuc2xhdGlvbnMuZ2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyaXBNYW5hZ2VyVXBsb2FkZXInLCBVcGxvYWRlcik7XHJcblxyXG4gICAgVXBsb2FkZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ1VwbG9hZCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFVwbG9hZGVyKCRyb290U2NvcGUsIEJyZWFkY3J1bWIsIENvbnRlbnQsIFVwbG9hZCkge1xyXG5cclxuICAgICAgICB2YXIgdXBsb2FkZXIgPSB7XHJcbiAgICAgICAgICAgIGZpbGVzOiBbXSxcclxuICAgICAgICAgICAgYWRkOiBhZGRGaWxlLFxyXG4gICAgICAgICAgICBoYXNGaWxlczogaGFzRmlsZXMsXHJcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgICAgY2xlYW46IGNsZWFuLFxyXG4gICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogJycsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHtcclxuICAgICAgICAgICAgICAgICAgICByb290OiAkcm9vdFNjb3BlLmZpbGVVcmwoJ3VwbG9hZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpcjogJydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB1cGxvYWRlcjtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkRmlsZShmaWxlcykge1xyXG4gICAgICAgICAgICBuZy5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IDA7XHJcbiAgICAgICAgICAgICAgICBmaWxlLmlkID0gdXBsb2FkZXIuZmlsZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5pc0h0bWw1ID0gbmcuaXNIdG1sNTtcclxuICAgICAgICAgICAgICAgIGZpbGUuZXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHVwbG9hZGVyLmZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpZiB0aGVyZSBmaWxlcyBpbiBxdWV1ZSBmb3IgdXBsb2FkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBoYXNGaWxlcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZGVyLmZpbGVzLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTdGFydCB1cGxvYWQgYWxsIGZpbGVzIGZyb20gcXVldWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICBpZiAoIWhhc0ZpbGVzKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBnZXQgY3VycmVudCBkaXIgZnJvbSBCcmVhZGNydW1iIGFuZCBjb252ZXJ0IGl0IHRvIHN0cmluZ1xyXG4gICAgICAgICAgICB1cGxvYWRlci5zZXR0aW5ncy51cmwuZGlyID0gQnJlYWRjcnVtYi50b1N0cmluZy5hcHBseShCcmVhZGNydW1iLmN1cnJlbnQoKSk7XHJcblxyXG4gICAgICAgICAgICBuZy5mb3JFYWNoKHVwbG9hZGVyLmZpbGVzLCBvblNpbmdsZUZpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBsb2FkIHNpbmdsZSBmaWxlIHdyYXBwZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25TaW5nbGVGaWxlKGZpbGUpIHtcclxuICAgICAgICAgICAgdmFyIHVwbG9hZCA9IFVwbG9hZC51cGxvYWQoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAne3Jvb3R9L3tkaXJ9Jy5zdXBwbGFudCh1cGxvYWRlci5zZXR0aW5ncy51cmwpLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge2ZpbGU6IGZpbGV9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdXBsb2FkLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgdXBsb2FkZXIuZmlsZXMucmVtb3ZlSXRlbShmaWxlLmlkLCAnaWQnKTtcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuYWRkKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIG5vdGlmaWNhdGlvbiBhYm91dCBlcnJvclxyXG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTAwO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCBwYXJzZUludCg5MC4wICogZXZ0LmxvYWRlZCAvIGV2dC50b3RhbCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZSBhbGwgZmlsZXMgZnJvbSB1cGxvYWRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYW4oKSB7XHJcbiAgICAgICAgICAgIHVwbG9hZGVyLmZpbGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ0NyZWF0ZUZvbGRlclNlcnZpY2UnLCBDcmVhdGVGb2xkZXJTZXJ2aWNlKTtcclxuXHJcbiAgICBDcmVhdGVGb2xkZXJTZXJ2aWNlLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJ0RpcicsICdDcmlwTWFuYWdlckJyZWFkY3J1bWInLCAnQ3JpcE1hbmFnZXJDb250ZW50JywgJ1JlbmFtZVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIENyZWF0ZUZvbGRlclNlcnZpY2UoRGlyLCBCcmVhZGNydW1iLCBDb250ZW50LCBSZW5hbWUpIHtcclxuICAgICAgICB2YXIgY3JlYXRlID0ge1xyXG4gICAgICAgICAgICBfY3JlYXRlSW5Qcm9ncmVzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbkNyZWF0ZUZvbGRlcjogY2FuQ3JlYXRlRm9sZGVyLFxyXG4gICAgICAgICAgICBjcmVhdGVGb2xkZXI6IGNyZWF0ZUZvbGRlclxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBjcmVhdGU7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlzIGZvbGRlciBjYW4gYmUgY3JlYXRlZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuQ3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWNyZWF0ZS5fY3JlYXRlSW5Qcm9ncmVzc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlIG5ldyBmb2xkZXJcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUZvbGRlcihuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAoIWNhbkNyZWF0ZUZvbGRlcigpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY3JlYXRlLl9jcmVhdGVJblByb2dyZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIERpci5jcmVhdGUoQnJlYWRjcnVtYi5jdXJyZW50KCksIHtuYW1lOiBuYW1lfSwgZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZS5fY3JlYXRlSW5Qcm9ncmVzcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBjb250cm9sbGVycyB0byBoYW5kbGUgVUkgY2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBDb250ZW50LmFkZChyKTtcclxuICAgICAgICAgICAgICAgIENvbnRlbnQuc2VsZWN0U2luZ2xlKGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChuZy5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGVsZXRlU2VydmljZScsIERlbGV0ZVNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIERlbGV0ZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2FuRGVsZXRlOiBjYW5EZWxldGUsXHJcbiAgICAgICAgICAgIGRlbGV0ZTogZGVsZXRlSXRlbVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGFyZSB0aGUgaXRlbSBkZWxldGFibGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGl0ZW0uaXNEaXJVcFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGNhbkRlbGV0ZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhaXRlbS5pc0RpclVwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IFtldmVudF1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZWxldGVJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFjYW5EZWxldGUoaXRlbSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5kZWxldGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnUmVuYW1lU2VydmljZScsIFJlbmFtZVNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlbmFtZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2FuUmVuYW1lOiBjYW5SZW5hbWUsXHJcbiAgICAgICAgICAgIGVuYWJsZVJlbmFtZTogZW5hYmxlUmVuYW1lLFxyXG4gICAgICAgICAgICByZW5hbWU6IHJlbmFtZVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpcyB0aGUgaXRlbSBjYW4gYmUgcmVuYW1lZFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufG9iamVjdH0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXRlbS5pc0RpclVwXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuUmVuYW1lKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICFpdGVtLmlzRGlyVXA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbmFibGUgaXRlbSByZW5hbWVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXRlbS5pZGVudGlmaWVyXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBpdGVtLnJlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGVuYWJsZVJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuUmVuYW1lKGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChpdGVtLnJlbmFtZSA9IHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuYW1lIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVtLnVwZGF0ZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmFtZShpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FuUmVuYW1lKGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSkoYW5ndWxhciwgd2luZG93LmNyaXApOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnNlcnZpY2UoJ1NlbGVjdFNlcnZpY2UnLCBTZWxlY3RTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWxlY3RTZXJ2aWNlKCkge1xyXG4gICAgICAgIHZhciBzZWxlY3QgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkOiBbXSxcclxuICAgICAgICAgICAgc2VsZWN0OiBzZWxlY3RJdGVtLFxyXG4gICAgICAgICAgICBzZWxlY3RTaW5nbGU6IHNlbGVjdFNpbmdsZUl0ZW0sXHJcbiAgICAgICAgICAgIGRlc2VsZWN0OiBkZXNlbGVjdFNlbGVjdGVkSXRlbXMsXHJcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWRJdGVtLFxyXG4gICAgICAgICAgICBpc1NlbGVjdGVkT25lOiBpc1NlbGVjdGVkT25lSXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZEFueTogaXNTZWxlY3RlZEFueUl0ZW0sXHJcbiAgICAgICAgICAgIGdldFNlbGVjdGVkSXRlbTogZ2V0U2VsZWN0ZWRJdGVtLFxyXG4gICAgICAgICAgICBnZXRTZWxlY3RlZEl0ZW1zOiBnZXRTZWxlY3RlZEl0ZW1zLFxyXG4gICAgICAgICAgICB1cGRhdGVTZWxlY3RlZDogdXBkYXRlU2VsZWN0ZWRJdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxlY3Q7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZXMgaXMgYW55IGl0ZW0gc2VsZWN0ZWRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzU2VsZWN0ZWRBbnlJdGVtKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFzZWxlY3Quc2VsZWN0ZWQubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZXJtaW5lcyBpcyBpdGVtIGluIHNlbGVjdGVkIGl0ZW1zIGNvbGxlY3Rpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaXNTZWxlY3RlZEl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzU2VsZWN0ZWRBbnlJdGVtKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgbmcuZm9yRWFjaChzZWxlY3Quc2VsZWN0ZWQsIGZ1bmN0aW9uIChzZWxlY3RlZF9pdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmcuZXF1YWxzKGl0ZW0sIHNlbGVjdGVkX2l0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGlzU2VsZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmVzIGlzIHNlbGVjdGVkIG9ubHkgb25lIGl0ZW1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzU2VsZWN0ZWRPbmVJdGVtKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0LnNlbGVjdGVkLmxlbmd0aCA9PT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBzaW5nbGUgc2VsZWN0ZWQgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge29iamVjdHxib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNlbGVjdGVkSXRlbSgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1NlbGVjdGVkT25lSXRlbSgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdC5zZWxlY3RlZFswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBhbGwgc2VsZWN0ZWQgaXRlbXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZEl0ZW1zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0LnNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIGl0ZW0gdG8gY29sbGVjdGlvbiBvZiBzZWxlY3RlZCBpdGVtc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RJdGVtKGl0ZW0pIHtcclxuICAgICAgICAgICAgc2VsZWN0LnNlbGVjdGVkLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXNlbGVjdCBhbGwgc2VsZWN0ZWQgaXRlbXMgYW5kIHVwZGF0ZSBjaGFuZ2VzIGluIHRoZW1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBkZXNlbGVjdFNlbGVjdGVkSXRlbXMoKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZVNlbGVjdGVkSXRlbXMoKTtcclxuICAgICAgICAgICAgc2VsZWN0LnNlbGVjdGVkLnNwbGljZSgwLCBzZWxlY3Quc2VsZWN0ZWQubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlc2VsZWN0IGFsbCBzZWxlY3RlZCBpdGVtcyBhbmQgYWRkIHRoaXMgb25lIGFzIHNlbGVjdGVkXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdFNpbmdsZUl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICBkZXNlbGVjdFNlbGVjdGVkSXRlbXMoKTtcclxuICAgICAgICAgICAgc2VsZWN0SXRlbShpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBjaGFuZ2VzIGluIHNlbGVjdGVkIGl0ZW1zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlU2VsZWN0ZWRJdGVtcygpIHtcclxuICAgICAgICAgICAgbmcuZm9yRWFjaChnZXRTZWxlY3RlZEl0ZW1zKCksIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
