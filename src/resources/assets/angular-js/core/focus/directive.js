(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .directive('cFocus', cFocus);

    function cFocus(focus) {
        return function (scope, elem, attr) {
            elem.on(attr.cFocus, function () {
                focus(attr.cFocusSelector);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                elem.off(attr.cFocus);
            });
        }
    }
})(angular, jQuery);