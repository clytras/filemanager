(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .directive('cEnter', cEnter);

    function cEnter() {
        return function (scope, elem, attr) {
            elem.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attr.cEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    }
})(angular, jQuery);