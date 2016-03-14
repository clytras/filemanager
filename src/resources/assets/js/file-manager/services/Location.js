(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerLocation', ChangeLocationService);

    ChangeLocationService.$inject = [
        '$cookies', 'Dir', 'ItemService', 'CripManagerBreadcrumb', 'CripManagerContent'
    ];

    function ChangeLocationService($cookies, Dir, ItemService, Breadcrumb, Content) {
        return {
            init: initialLoad,
            change: change,
            current: {}
        };

        /**
         * Change location to initial folder
         */
        function initialLoad() {
            change(getLocationFromCookie());
        }

        /**
         * Change current location
         *
         * @param {object} [folder]
         */
        function change(folder) {
            var path = {dir: null, name: null};
            if (ng.isDefined(folder)) {
                path.dir = ng.isEmpty(folder.dir) ? null : folder.dir;
                path.name = ng.isEmpty(folder.name) ? null : folder.name;
            }

            Dir.query(path, function (r) {
                updateCookie(path);

                // Append response with required information
                ItemService.extend(r);

                // Remove old content
                Content.removeItems();

                // deselect, if any item is selected
                Content.deselect();

                // Change breadcrumb path
                Breadcrumb.set(path);

                // Add new content
                ng.forEach(r.getItems(), function (item) {
                    Content.add(item);
                });
            });
        }

        /**
         * Get manager last location from cookies
         *
         * @returns {{dir: string, name: string}}
         */
        function getLocationFromCookie() {
            var location = {dir: null, name: null};

            var cookieDir = $cookies.get('location-dir'),
                name = $cookies.get('location-dir-name');
            if (ng.hasValue(cookieDir) || ng.hasValue(name)) {
                location.dir = cookieDir;

                if (!name || name === 'null' || name === null) {
                    name = '';
                }
                location.name = name;
            }

            return location;
        }

        /**
         * Update cookies for new manager instance, to be opened in same location
         *
         * @param {object} location
         * @param {string} location.dir
         * @param {string} location.name
         */
        function updateCookie(location) {
            $cookies.put('location-dir', location.dir || '');
            $cookies.put('location-dir-name', location.name || '');
        }
    }
})(angular, window.crip);