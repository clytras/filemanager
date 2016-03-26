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