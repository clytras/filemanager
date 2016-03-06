(function (crip) {
    'use strict';

    crip.fileM
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($log, $resource, $rootScope) {
        //$log.log('Dir resource <- started');

        return $resource($rootScope.baseUrl() + 'dir/:dir/:name', {
            dir: '@dir',
            name: '@name'
        });
    }
})(window.crip || (window.crip = {}));