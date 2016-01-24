(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('Dir', Dir);

    Dir.$inject = [
        '$log', '$resource', '$rootScope'
    ];

    function Dir($log, $resource, $rootScope) {
        $log.log('Dir resource <- started');

        return $resource($rootScope.baseUrl() + 'dir/:path', {
            path: '@path'
        });
    }
})(angular, jQuery);