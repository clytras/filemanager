(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTrans', Trans);

    Trans.$inject = [
        'CripManagerTranslations'
    ];

    function Trans(Translations) {
        var translations = {};

        return function (key) {
            if (key) {
                return translations[key];
            }

            return {
                init: function () {
                    translations = Translations.get();
                }
            }
        };
    }

})(angular, window.crip);