(function (angular, $) {
    'use strict';

    angular
        .module('script.core')
        .factory('focus', focus);

    focus.$inject = [
        '$log', '$timeout'
    ];

    function focus($log, $timeout) {
        return function(selector) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function() {
                var $element = $(selector);
                if($element.length === 1)
                    $element.focus();
            });
        };
    }
})(angular, jQuery);