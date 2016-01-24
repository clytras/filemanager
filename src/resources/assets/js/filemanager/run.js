(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .run(Run);
    Run.$inject = [
        '$rootScope'
    ];

    function Run($rootScope) {
        var $settings = $('#settings');

        $rootScope.fireBroadcast = function (eventName, args) {
            $rootScope.$broadcast(eventName, args);
        };

        $rootScope.baseUrl = function () {
            return $settings.data('base-url');
        };
    }
})(angular, jQuery);