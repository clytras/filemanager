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
            'create': {url: $rootScope.dirUrl(':dir/:name', 'create'), method: 'POST'},
            'deleteDir': {url: $rootScope.dirUrl(':dir', 'delete'), method: 'GET'},
            'deleteFile': {url: $rootScope.fileUrl(':dir/:name', 'delete'), method: 'GET'},
            'renameDir': {url: $rootScope.dirUrl(':dir', 'rename'), method: 'GET'},
            'renameFile': {url: $rootScope.fileUrl(':dir', 'rename'), method: 'GET'}
        });
    }
})(window.crip || (window.crip = {}));