(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$resource', '$rootScope'
    ];

    function Dir($resource, $rootScope) {
        return $resource($rootScope.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        }, {
            'create': {url: $rootScope.dirUrl(':dir', 'create'), method: 'GET'},
            'rename': {url: $rootScope.dirUrl(':dir', 'rename'), method: 'GET'},
            'delete': {url: $rootScope.dirUrl(':dir', 'delete'), method: 'GET'}
        });
    }
})(window.crip || (window.crip = {}));