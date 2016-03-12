(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'Dir', 'DirResponseService'
    ];

    function RootController($log, $scope, $cookies, Notification, Dir, DirResponseService) {

        activate();

        function activate() {
            $scope.addItem = addItem;
            $scope.removeItem = removeItem;

            $scope.folder = {
                loading: true,
                items: [],
                disableItemsProp: disableItemsProp,
                manager: getManagerCookieOrDefault(),
                goTo: doFolderChange,
                /**
                 * @var {object|boolean} selected
                 */
                selected: false,
                deselect: deselect,
                isSelected: isSelected,
                isSelectedAny: isSelectedAny
            };

            $scope.actions = {};

            doFolderChange($scope.folder.manager);
        }

        /**
         * Call page content change
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         * @param {function|Array} [onSuccess]
         */
        function doFolderChange(folder, onSuccess) {
            Dir.query(folder, function (r) {
                // Append response with required information
                DirResponseService.extend(r);
                onLoadCompleted(r);

                if (ng.isDefined(onSuccess)) {
                    // If passed parameter is array, iterate though it and and call each callback
                    if (ng.isArray(onSuccess)) {
                        ng.forEach(onSuccess, function (arrayCallback) {
                            if (ng.isFunction(arrayCallback))
                                arrayCallback(r);
                            else
                                throw new Error('To change folder, you should pass an array of callbacks!');
                        });
                    }
                    // Call callback if parameter is not an array and is callable
                    else if (ng.isFunction(onSuccess))
                        onSuccess(r);
                    // In other case throw error
                    else
                        throw new Error('To change folder, you should pass an array of callbacks or single callback!');
                }

                updateCookie(folder);
            });
        }

        /**
         * Get manager last location from cache or default root dir
         *
         * @param [manager]
         * @returns {{dir: string, name: string}}
         */
        function getManagerCookieOrDefault(manager) {
            manager = ng.isDefined(manager) ? manager : {dir: '', name: ''};

            var cookieDir = $cookies.get('manager-dir'),
                name = $cookies.get('manager-dir-name');
            if (ng.isDefined(cookieDir) && cookieDir != '') {
                manager.dir = cookieDir;

                if (!name || name === 'null' || name === null) {
                    name = '';
                }
                manager.name = name;
            }

            //$log.debug({getManagerCookieOrDefault: manager});

            return manager;
        }

        /**
         * Grab response data from resource request
         *
         * @param response
         */
        function onLoadCompleted(response) {
            //$log.info(response);
            $scope.folder.items = response.getItems();
            $scope.folder.loading = false;
            deselect();
            //$log.info($scope.folder);
        }

        /**
         * Update cookies for new manager instance, to be opened in same location
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         */
        function updateCookie(folder) {
            $cookies.put('manager-dir', folder.dir || '');
            $cookies.put('manager-dir-name', folder.name || '');
            //$log.debug(folder);
            $scope.folder.manager = folder;
        }

        /**
         * Detect is passed this item is selected
         *
         * @param {object} item
         * @returns {boolean}
         */
        function isSelected(item) {
            if (!$scope.folder.selected)
                return false;

            //$log.info('isSelected', item, $scope.folder.selected);

            return ng.equals(item, $scope.folder.selected);
        }

        /**
         * Determines is there selected item
         *
         * @returns {boolean}
         */
        function isSelectedAny() {
            return !!$scope.folder.selected;
        }

        /**
         * Deselect selected folder item;
         */
        function deselect() {
            //$log.info('deselect', $scope.folder.selected);
            if ($scope.folder.selected !== false) {
                // update selected item all changes if they are presented
                $scope.folder.selected.update();

                $scope.folder.selected = false;
            }

            return true;
        }

        /**
         * Disable all item property by its name
         *
         * @param {...string} prop
         */
        function disableItemsProp(prop) {
            var params = arguments;
            ng.forEach($scope.folder.items, function (item) {
                // update item if it has any changes
                if (ng.isDefined(item.update)) {
                    item.update();
                } else {
                    $log.error('Item has no method `update`');
                }

                for (var i = 0; i < params.length; i++) {
                    if (item.hasOwnProperty(params[i]) && typeof item[params[i]] === 'boolean') {
                        //$log.debug('disableItemsProp', item.identifier, params[i]);
                        item[params[i]] = false;
                    }
                }
            });
        }

        function removeItem(item) {
            $scope.folder.items.splice($scope.folder.items.indexOf(item), 1);
        }

        function addItem(item) {
            if (!ng.isDefined(item.crip_extended)) {
                DirResponseService.extendItem(item);
            }

            $scope.folder.items.push(item);
        }
    }
})(angular, window.crip || (window.crip = {}));