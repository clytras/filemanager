(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTranslations', Translations);

    Translations.$inject = [
        '$resource', '$rootScope'
    ];

    function Translations($resource, $rootScope) {
        return $resource($rootScope.baseUrl('translations'));
    }
})(angular, window.crip);