(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerTrans', Trans);

    Trans.$inject = [
        '$log', '$q', 'CripManagerTranslations'
    ];

    function Trans($log, $q, Translations) {
        var $deferred = $q.defer(),
            trans = Translations.get();

        trans.$promise.then(function (values) {
            $deferred.resolve(values);
        });

        return $deferred.promise;
    }

})(angular, window.crip);