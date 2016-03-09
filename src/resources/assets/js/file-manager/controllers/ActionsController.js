(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$log', '$scope'
    ];

    function ActionsController($log, $scope) {
        activate();

        function activate() {
            $scope.actions = {
                newDir: createNewDir
            };
        }

        function createNewDir(name) {
            $log.info('try to crete new dir: ' + name);
        }
    }
})(angular, window.crip || (window.crip = {}));