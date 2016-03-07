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
        var $settings = $('#settings');

        $rootScope.fireBroadcast = broadcast;
        $rootScope.baseUrl = baseUrl;

        /**
         * Get plugin dir action url
         *
         * @param {string} dir
         * @param {string} [action]
         * @returns {string}
         */
        $rootScope.dirUrl = function (dir, action) {
            var path = 'dir/';
            if (ng.isDefined(action)) {
                path += action + '/'
            }
            path += dir;

            return baseUrl(path);
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
         * Get plugin base url
         *
         * @param {string} path
         * @returns {string}
         */
        function baseUrl(path) {
            return $settings.data('base-url') + path;
        }

    }
})(angular, jQuery, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirContentController', DirContentController);

    DirContentController.$inject = [
        '$scope', 'focus', 'Dir'
    ];

    function DirContentController($scope, focus, Dir) {
        activate();

        function activate() {
            $scope.folderFilter = folderFilter;
            $scope.order = {
                by: orderBy,
                field: 'name',
                isReverse: false,

                name: true,
                size: false,
                date: false
            };
            $scope.filters = {
                image: true,
                media: true,
                document: true,
                file: true
            };
        }

        function orderBy(item) {
            var text = 'z {field}';
            if (item.isDir) {
                // dir up should be on first place
                if (item.isDirUp)
                    return -1;
                text = '0 {field}';
            }

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
        .controller('DirItemController', DirItemController);

    DirItemController.$inject = ['$scope'];

    function DirItemController($scope) {
        activate();

        function activate() {
            $scope.click = click;
        }

        function click(item) {
            if (item.isDir) {
                $scope.folder.goTo(item);
            }
        }
    }
})(angular, window.crip || (window.crip = {}));
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
        });
    }
})(window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('DirResponseService', DirResponseService);

    DirResponseService.$inject = [
        '$rootScope'
    ];

    function DirResponseService($rootScope) {
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
            return isDir(item) && item.name == '';
        }

        /**
         * Extend single item with required information
         *
         * @param item
         * @param key
         */
        function extendItem(item, key) {
            item.identifier = idGen(key);
            item.isDir = isDir(item);
            item.isDirUp = isDirUp(item);
        }
    }
})(angular, window.crip || (window.crip = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL0RpckNvbnRlbnRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvRGlySXRlbUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9Sb290Q29udHJvbGxlci5qcyIsInJlc291cmNlcy9EaXIuanMiLCJzZXJ2aWNlcy9EaXJSZXNwb25zZVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmaWxlLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlciA9IG5nLm1vZHVsZSgnY3JpcC5maWxlLW1hbmFnZXInLCBbXHJcbiAgICAgICAgJ2NyaXAuY29yZScsXHJcbiAgICAgICAgJ2FuZ3VsYXItbG9hZGluZy1iYXInLFxyXG4gICAgICAgICdhbmd1bGFyRmlsZVVwbG9hZCcsXHJcbiAgICAgICAgJ25nQ29va2llcycsXHJcbiAgICAgICAgJ25nUmVzb3VyY2UnLFxyXG4gICAgICAgICduZ1Nhbml0aXplJyxcclxuICAgICAgICAndWkuYm9vdHN0cmFwJyxcclxuICAgICAgICAndWktbm90aWZpY2F0aW9uJyxcclxuICAgICAgICAnaW8uZGVubmlzLmNvbnRleHRtZW51J1xyXG4gICAgXSlcclxufSkoYW5ndWxhciwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCAkLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5ydW4oUnVuKTtcclxuXHJcbiAgICBSdW4uJGluamVjdCA9IFtcclxuICAgICAgICAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gUnVuKCRyb290U2NvcGUpIHtcclxuICAgICAgICB2YXIgJHNldHRpbmdzID0gJCgnI3NldHRpbmdzJyk7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuZmlyZUJyb2FkY2FzdCA9IGJyb2FkY2FzdDtcclxuICAgICAgICAkcm9vdFNjb3BlLmJhc2VVcmwgPSBiYXNlVXJsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgcGx1Z2luIGRpciBhY3Rpb24gdXJsXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFthY3Rpb25dXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICAkcm9vdFNjb3BlLmRpclVybCA9IGZ1bmN0aW9uIChkaXIsIGFjdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgcGF0aCA9ICdkaXIvJztcclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZChhY3Rpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoICs9IGFjdGlvbiArICcvJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhdGggKz0gZGlyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VVcmwocGF0aCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZSBldmVudCBvbiByb290IHNjb3BlIGZvciBhbGwgY29udHJvbGxlcnNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0KGV2ZW50TmFtZSwgYXJncykge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoZXZlbnROYW1lLCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBwbHVnaW4gYmFzZSB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBiYXNlVXJsKHBhdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzZXR0aW5ncy5kYXRhKCdiYXNlLXVybCcpICsgcGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59KShhbmd1bGFyLCBqUXVlcnksIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignRGlyQ29udGVudENvbnRyb2xsZXInLCBEaXJDb250ZW50Q29udHJvbGxlcik7XHJcblxyXG4gICAgRGlyQ29udGVudENvbnRyb2xsZXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHNjb3BlJywgJ2ZvY3VzJywgJ0RpcidcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyQ29udGVudENvbnRyb2xsZXIoJHNjb3BlLCBmb2N1cywgRGlyKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXJGaWx0ZXIgPSBmb2xkZXJGaWx0ZXI7XHJcbiAgICAgICAgICAgICRzY29wZS5vcmRlciA9IHtcclxuICAgICAgICAgICAgICAgIGJ5OiBvcmRlckJ5LFxyXG4gICAgICAgICAgICAgICAgZmllbGQ6ICduYW1lJyxcclxuICAgICAgICAgICAgICAgIGlzUmV2ZXJzZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgbmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLmZpbHRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1lZGlhOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmaWxlOiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcmRlckJ5KGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRleHQgPSAneiB7ZmllbGR9JztcclxuICAgICAgICAgICAgaWYgKGl0ZW0uaXNEaXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRpciB1cCBzaG91bGQgYmUgb24gZmlyc3QgcGxhY2VcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmlzRGlyVXApXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICAgICAgdGV4dCA9ICcwIHtmaWVsZH0nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGV4dC5zdXBwbGFudCh7ZmllbGQ6IGl0ZW1bJHNjb3BlLm9yZGVyLmZpZWxkXX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9sZGVyRmlsdGVyKHZhbHVlLCBpbmRleCwgYXJyYXkpIHtcclxuICAgICAgICAgICAgLy8gSWYgaXRlbSBpcyBkaXIsIGl0IHdpbGwgYmUgdmlzaWJsZVxyXG4gICAgICAgICAgICBpZiAodmFsdWUuaXNEaXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBmaWx0ZXIgZW5hYmxlIHByb3BlcnR5IGFuZCBjaGVjayBpdCBoZXJlXHJcbiAgICAgICAgICAgIGlmKHRydWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmZpbHRlcnNbdmFsdWUudHlwZV07XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBmaWx0ZXIgZW5hYmxlIHByb3BlcnR5IGlzIGRpc2FibGVkLCBjb21wYXJlIHdpdGggYWxsb3dlZCB0eXBlXHJcbiAgICAgICAgICAgIC8vaWYgKFNldHRpbmdzLmdldFR5cGUoKSA9PSB2YWx1ZS50eXBlKVxyXG4gICAgICAgICAgICAvLyAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuY29udHJvbGxlcignRGlySXRlbUNvbnRyb2xsZXInLCBEaXJJdGVtQ29udHJvbGxlcik7XHJcblxyXG4gICAgRGlySXRlbUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gRGlySXRlbUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jbGljayA9IGNsaWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xpY2soaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5pc0Rpcikge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5nb1RvKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jvb3RDb250cm9sbGVyJywgUm9vdENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJvb3RDb250cm9sbGVyLiRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRsb2cnLCAnJHNjb3BlJywgJyRjb29raWVzJywgJ05vdGlmaWNhdGlvbicsICdEaXInLCAnRGlyUmVzcG9uc2VTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSb290Q29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRjb29raWVzLCBOb3RpZmljYXRpb24sIERpciwgRGlyUmVzcG9uc2VTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyID0ge1xyXG4gICAgICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgIG1hbmFnZXI6IGdldE1hbmFnZXJDb29raWVPckRlZmF1bHQoKSxcclxuICAgICAgICAgICAgICAgIGdvVG86IGRvRm9sZGVyQ2hhbmdlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkb0ZvbGRlckNoYW5nZSgkc2NvcGUuZm9sZGVyLm1hbmFnZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsbCBwYWdlIGNvbnRlbnQgY2hhbmdlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZm9sZGVyXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlci5kaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLm5hbWVcclxuICAgICAgICAgKiBAcGFyYW0ge2NhbGxhYmxlfEFycmF5fSBbb25TdWNjZXNzXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGRvRm9sZGVyQ2hhbmdlKGZvbGRlciwgb25TdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIERpci5xdWVyeShmb2xkZXIsIGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgcmVzcG9uc2Ugd2l0aCByZXF1aXJlZCBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgRGlyUmVzcG9uc2VTZXJ2aWNlLmV4dGVuZChyKTtcclxuICAgICAgICAgICAgICAgIG9uTG9hZENvbXBsZXRlZChyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKG9uU3VjY2VzcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBwYXNzZWQgcGFyYW1ldGVyIGlzIGFycmF5LCBpdGVyYXRlIHRob3VnaCBpdCBhbmQgYW5kIGNhbGwgZWFjaCBjYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZy5pc0FycmF5KG9uU3VjY2VzcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmcuZm9yRWFjaChvblN1Y2Nlc3MsIGZ1bmN0aW9uIChhcnJheUNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmcuaXNGdW5jdGlvbihhcnJheUNhbGxiYWNrKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheUNhbGxiYWNrKHIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVG8gY2hhbmdlIGZvbGRlciwgeW91IHNob3VsZCBwYXNzIGFuIGFycmF5IG9mIGNhbGxiYWNrcyEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbGwgY2FsbGJhY2sgaWYgcGFyYW1ldGVyIGlzIG5vdCBhbiBhcnJheSBhbmQgaXMgY2FsbGFibGVcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChuZy5pc0Z1bmN0aW9uKG9uU3VjY2VzcykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlIHRocm93IGVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvIGNoYW5nZSBmb2xkZXIsIHlvdSBzaG91bGQgcGFzcyBhbiBhcnJheSBvZiBjYWxsYmFja3Mgb3Igc2luZ2xlIGNhbGxiYWNrIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvb2tpZShmb2xkZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBtYW5hZ2VyIGxhc3QgbG9jYXRpb24gZnJvbSBjYWNoZSBvciBkZWZhdWx0IHJvb3QgZGlyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gW21hbmFnZXJdXHJcbiAgICAgICAgICogQHJldHVybnMge3tkaXI6IHN0cmluZywgbmFtZTogc3RyaW5nfX1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBnZXRNYW5hZ2VyQ29va2llT3JEZWZhdWx0KG1hbmFnZXIpIHtcclxuICAgICAgICAgICAgbWFuYWdlciA9IG5nLmlzRGVmaW5lZChtYW5hZ2VyKSA/IG1hbmFnZXIgOiB7ZGlyOiAnJywgbmFtZTogJyd9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvb2tpZURpciA9ICRjb29raWVzLmdldCgnbWFuYWdlci1kaXInKSxcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAkY29va2llcy5nZXQoJ21hbmFnZXItZGlyLW5hbWUnKTtcclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZChjb29raWVEaXIpICYmIGNvb2tpZURpciAhPSAnJykge1xyXG4gICAgICAgICAgICAgICAgbWFuYWdlci5kaXIgPSBjb29raWVEaXI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFuYW1lIHx8IG5hbWUgPT09ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1hbmFnZXIubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRsb2cuZGVidWcoe2dldE1hbmFnZXJDb29raWVPckRlZmF1bHQ6IG1hbmFnZXJ9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR3JhYiByZXNwb25zZSBkYXRhIGZyb20gcmVzb3VyY2UgcmVxdWVzdFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gb25Mb2FkQ29tcGxldGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIC8vJGxvZy5pbmZvKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgJHNjb3BlLmZvbGRlci5pdGVtcyA9IHJlc3BvbnNlLmdldEl0ZW1zKCk7XHJcbiAgICAgICAgICAgICRzY29wZS5mb2xkZXIubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyRsb2cuaW5mbygkc2NvcGUuZm9sZGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZSBjb29raWVzIGZvciBuZXcgbWFuYWdlciBpbnN0YW5jZSwgdG8gYmUgb3BlbmVkIGluIHNhbWUgbG9jYXRpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmb2xkZXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyLmRpclxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXIubmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvb2tpZShmb2xkZXIpIHtcclxuICAgICAgICAgICAgJGNvb2tpZXMucHV0KCdtYW5hZ2VyLWRpcicsIGZvbGRlci5kaXIgfHwgJycpO1xyXG4gICAgICAgICAgICAkY29va2llcy5wdXQoJ21hbmFnZXItZGlyLW5hbWUnLCBmb2xkZXIubmFtZSB8fCAnJyk7XHJcbiAgICAgICAgICAgIC8vJGxvZy5kZWJ1Zyhmb2xkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZm9sZGVyLm1hbmFnZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJHJlc291cmNlJywgJyRyb290U2NvcGUnXHJcbiAgICBdO1xyXG5cclxuICAgIGZ1bmN0aW9uIERpcigkcmVzb3VyY2UsICRyb290U2NvcGUpIHtcclxuICAgICAgICByZXR1cm4gJHJlc291cmNlKCRyb290U2NvcGUuZGlyVXJsKCc6ZGlyLzpuYW1lJyksIHtcclxuICAgICAgICAgICAgZGlyOiAnQGRpcicsXHJcbiAgICAgICAgICAgIG5hbWU6ICdAbmFtZSdcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkod2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5zZXJ2aWNlKCdEaXJSZXNwb25zZVNlcnZpY2UnLCBEaXJSZXNwb25zZVNlcnZpY2UpO1xyXG5cclxuICAgIERpclJlc3BvbnNlU2VydmljZS4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBEaXJSZXNwb25zZVNlcnZpY2UoJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdleHRlbmQnOiBleHRlbmQsXHJcbiAgICAgICAgICAgICdleHRlbmRJdGVtJzogZXh0ZW5kSXRlbVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4dGVuZCBEaXIgcmVzb3VyY2UgcmVxdWVzdCByZXNwb25zZSB3aXRoIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gcmVzb3VyY2VEYXRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKHJlc291cmNlRGF0YSkge1xyXG4gICAgICAgICAgICBuZy5leHRlbmQocmVzb3VyY2VEYXRhLCB7XHJcbiAgICAgICAgICAgICAgICAnZ2V0SXRlbXMnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbmcuZm9yRWFjaChyZXNvdXJjZURhdGEsIGZ1bmN0aW9uICh2LCBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZEl0ZW0odiwgayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaCh2KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBpdGVtcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZSBVSSBpZCBmb3IgaXRlbVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGtleVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaWRHZW4oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbGlzdC1pdGVtLScgKyBrZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhIGZvbGRlclxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpcihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtICYmIG5nLmlzRGVmaW5lZChpdGVtLnR5cGUpICYmIGl0ZW0udHlwZSA9PT0gJ2Rpcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZXRlcm1pbmUgaXMgaXRlbSBhbiBhIGZvbGRlciB1cFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpc0RpclVwKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzRGlyKGl0ZW0pICYmIGl0ZW0ubmFtZSA9PSAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4dGVuZCBzaW5nbGUgaXRlbSB3aXRoIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBleHRlbmRJdGVtKGl0ZW0sIGtleSkge1xyXG4gICAgICAgICAgICBpdGVtLmlkZW50aWZpZXIgPSBpZEdlbihrZXkpO1xyXG4gICAgICAgICAgICBpdGVtLmlzRGlyID0gaXNEaXIoaXRlbSk7XHJcbiAgICAgICAgICAgIGl0ZW0uaXNEaXJVcCA9IGlzRGlyVXAoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
