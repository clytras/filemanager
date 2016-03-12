(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = ['$scope', 'ActionsRootService'];

    function ActionsController($scope, ActionsRootService) {
        activate();

        function activate() {
            ActionsRootService.extend($scope.actions || ($scope.actions = {}));
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));