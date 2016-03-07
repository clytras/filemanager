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
            $scope.folder = {
                loading: true,
                items: [],
                manager: getManagerCookieOrDefault(),
                goTo: doFolderChange
            };

            doFolderChange($scope.folder.manager);
        }

        /**
         * Call page content change
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         * @param {callable|Array} [onSuccess]
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

                if (!name || name === 'null') {
                    name = '';
                }
                manager.name = name;
            }

            $log.debug({getManagerCookieOrDefault: manager});

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
    }
})(angular, window.crip || (window.crip = {}));