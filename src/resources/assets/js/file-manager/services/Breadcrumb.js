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
            resolveUrlObject: resolveUrlObject
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
            var string_value = val.dir || '';
            breadcrumb.items.splice(0, breadcrumb.items.length);

            if (ng.hasValue(val.name)) {
                string_value += '/' + val.name;
            }
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
            console.log(path, typeof path);

            return path;
        }
    }
})(angular, window.crip);