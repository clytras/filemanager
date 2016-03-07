(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($resource, $rootScope) {
        return $resource($rootScope.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        });
    }
})(window.crip || (window.crip = {}));