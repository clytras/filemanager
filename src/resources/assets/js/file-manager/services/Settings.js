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
                isAllMediaAllowed: isAllMediaAllowed,
                isTarget: isTarget,
                icon: icon
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
                url: settings.public_url,
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

        /**
         * Determine target to call on file selected
         *
         * @param {String} target
         */
        function isTarget(target) {
            return settings.params.target.toLowerCase() === target.toLowerCase();
        }

        /**
         * Get icon src by its name
         *
         * @param name
         * @returns {*|string}
         */
        function icon(name) {
            return '{root}/images/{name}.png'
                .supplant({root: settings.public_url, name: name});
        }
    }
})(angular, window.crip, jQuery);