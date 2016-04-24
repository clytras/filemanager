(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTranslations', Translations);

    Translations.$inject = [
        '$resource', 'CripManagerSettings'
    ];

    function Translations($resource, Settings) {
        return $resource(Settings.baseUrl('translations'));
    }

})(angular, window.crip);