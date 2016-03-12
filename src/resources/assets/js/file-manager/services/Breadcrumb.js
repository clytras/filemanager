(function (ng, crip) {
    'use strict';
    crip.filemanager
        .service('Breadcrumb', Breadcrumb);

    function Breadcrumb() {
        var items = [];

        return {
            current: current,
            items: items
        };

        /**
         * Get current folder location object
         *
         * @returns {object}
         */
        function current() {
            if (items.length === 0) {
                return {dir: '', name: ''};
            }

            return items[items.length - 1];
        }
    }
})(angular, window.crip);