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
        .controller('RootController', RootController);

    RootController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'Dir'
    ];

    function RootController($log, $scope, $cookies, Notification, Dir) {

        activate();

        function activate() {
            $scope.isDir = isDir;
            $scope.isDirUp = isDirUp;
            $scope.manager = {dir: '', name: ''};
            Dir.query($scope.manager);
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
            return isDir(item) && item.name == '..';
        }
    }
})(angular, window.crip || (window.crip = {}));
(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($resource, $rootScope) {
        return $resource($rootScope.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        });
    }
})(window.crip || (window.crip = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJ1bi5qcyIsImNvbnRyb2xsZXJzL1Jvb3RDb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL0Rpci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZpbGUtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyID0gbmcubW9kdWxlKCdjcmlwLmZpbGUtbWFuYWdlcicsIFtcclxuICAgICAgICAnY3JpcC5jb3JlJyxcclxuICAgICAgICAnYW5ndWxhci1sb2FkaW5nLWJhcicsXHJcbiAgICAgICAgJ2FuZ3VsYXJGaWxlVXBsb2FkJyxcclxuICAgICAgICAnbmdDb29raWVzJyxcclxuICAgICAgICAnbmdSZXNvdXJjZScsXHJcbiAgICAgICAgJ25nU2FuaXRpemUnLFxyXG4gICAgICAgICd1aS5ib290c3RyYXAnLFxyXG4gICAgICAgICd1aS1ub3RpZmljYXRpb24nLFxyXG4gICAgICAgICdpby5kZW5uaXMuY29udGV4dG1lbnUnXHJcbiAgICBdKVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsICQsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmZpbGVtYW5hZ2VyXHJcbiAgICAgICAgLnJ1bihSdW4pO1xyXG5cclxuICAgIFJ1bi4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSdW4oJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHZhciAkc2V0dGluZ3MgPSAkKCcjc2V0dGluZ3MnKTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS5maXJlQnJvYWRjYXN0ID0gYnJvYWRjYXN0O1xyXG4gICAgICAgICRyb290U2NvcGUuYmFzZVVybCA9IGJhc2VVcmw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBwbHVnaW4gZGlyIGFjdGlvbiB1cmxcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FjdGlvbl1cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICRyb290U2NvcGUuZGlyVXJsID0gZnVuY3Rpb24gKGRpciwgYWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoID0gJ2Rpci8nO1xyXG4gICAgICAgICAgICBpZiAobmcuaXNEZWZpbmVkKGFjdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHBhdGggKz0gYWN0aW9uICsgJy8nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0aCArPSBkaXI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYmFzZVVybChwYXRoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlIGV2ZW50IG9uIHJvb3Qgc2NvcGUgZm9yIGFsbCBjb250cm9sbGVyc1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3QoZXZlbnROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChldmVudE5hbWUsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHBsdWdpbiBiYXNlIHVybFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJhc2VVcmwocGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHNldHRpbmdzLmRhdGEoJ2Jhc2UtdXJsJykgKyBwYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIGpRdWVyeSwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5maWxlbWFuYWdlclxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSb290Q29udHJvbGxlcicsIFJvb3RDb250cm9sbGVyKTtcclxuXHJcbiAgICBSb290Q29udHJvbGxlci4kaW5qZWN0ID0gW1xyXG4gICAgICAgICckbG9nJywgJyRzY29wZScsICckY29va2llcycsICdOb3RpZmljYXRpb24nLCAnRGlyJ1xyXG4gICAgXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSb290Q29udHJvbGxlcigkbG9nLCAkc2NvcGUsICRjb29raWVzLCBOb3RpZmljYXRpb24sIERpcikge1xyXG5cclxuICAgICAgICBhY3RpdmF0ZSgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmlzRGlyID0gaXNEaXI7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0RpclVwID0gaXNEaXJVcDtcclxuICAgICAgICAgICAgJHNjb3BlLm1hbmFnZXIgPSB7ZGlyOiAnJywgbmFtZTogJyd9O1xyXG4gICAgICAgICAgICBEaXIucXVlcnkoJHNjb3BlLm1hbmFnZXIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZSBpcyBpdGVtIGEgZm9sZGVyXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzRGlyKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0gJiYgbmcuaXNEZWZpbmVkKGl0ZW0udHlwZSkgJiYgaXRlbS50eXBlID09PSAnZGlyJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERldGVybWluZSBpcyBpdGVtIGFuIGEgZm9sZGVyIHVwXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGlzRGlyVXAoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXNEaXIoaXRlbSkgJiYgaXRlbS5uYW1lID09ICcuLic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZmlsZW1hbmFnZXJcclxuICAgICAgICAuc2VydmljZSgnRGlyJywgRGlyKTtcclxuXHJcbiAgICBEaXIuJGluamVjdCA9IFtcclxuICAgICAgICAnJGxvZycsICckcmVzb3VyY2UnLCAnJHJvb3RTY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gRGlyKCRyZXNvdXJjZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoJHJvb3RTY29wZS5kaXJVcmwoJzpkaXIvOm5hbWUnKSwge1xyXG4gICAgICAgICAgICBkaXI6ICdAZGlyJyxcclxuICAgICAgICAgICAgbmFtZTogJ0BuYW1lJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSh3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
