(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContentFilter', ContentFilter);

    ContentFilter.$inject = ['$log', '$rootScope'];

    function ContentFilter($log, $rootScope) {
        var filters = {
            dir: dir,
            toggle: toggle,
            image: true,
            media: true,
            document: true
        };

        return filters;

        function dir(value, index, array) {
            // If item is dir, it will be visible
            if (value.isDir)
                return true;

            // if any of type is allowed
            if ($rootScope.fileType() === 'file')
                return filters[value.type];

            // if filter enable property is disabled, compare with allowed type
            return $rootScope.fileType() == value.type;
        }

        function toggle(field) {
            if (typeof filters[field] === 'boolean')
                filters[field] = !filters[field];
        }
    }
})(angular, window.crip);