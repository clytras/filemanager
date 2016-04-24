(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContentFilter', ContentFilter);

    ContentFilter.$inject = ['$log', 'CripManagerSettings'];

    function ContentFilter($log, Settings) {
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

            // if any type is allowed
            if (Settings.isAllMediaAllowed())
                return filters[value.type];

            // if filter enable property is disabled, compare with allowed type
            return Settings.allowedMediaType() == value.type;
        }

        function toggle(field) {
            if (typeof filters[field] === 'boolean')
                filters[field] = !filters[field];
        }
    }
})(angular, window.crip);