(function (ng, crip) {
    'use strict';
    crip.filemanager
        .service('CripManagerBreadcrumb', Breadcrumb);

    Breadcrumb.$inject = [];

    function Breadcrumb() {
        var breadcrumb = {
            items: [],
            hasItems: hasItems,
            current: current,
            set: setLocation
        };

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

            if (val.name !== '' && val.name !== null) {
                string_value += '/' + val.name;
            }

            ng.forEach(string_value.split('\/'), function (v) {
                if (v !== '' && v !== null) {

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
                }
            });

            // mark last item as active, this will help mark item as active
            if (breadcrumb.items.length > 0) {
                breadcrumb.items[breadcrumb.items.length - 1].isActive = true;
            }
        }
    }
})(angular, window.crip);