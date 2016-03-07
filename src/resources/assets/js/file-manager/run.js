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