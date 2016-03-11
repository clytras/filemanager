(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$resource', '$rootScope'
    ];

    function Dir($resource, $rootScope) {
        return $resource($rootScope.dirUrl(':action/:dir/:name'), {
            dir: '@dir',
            name: '@name',
            action: '@action'
        }, {
            'create': {method: 'POST', params: {action: 'create'}},
            'rename': {method: 'POST', params: {action: 'rename'}},
            'delete': {method: 'POST', params: {action: 'delete'}}
        });
    }
})(window.crip || (window.crip = {}));