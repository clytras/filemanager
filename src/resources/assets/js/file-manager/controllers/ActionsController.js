(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$log', '$scope', 'Dir', 'DirResponseService'
    ];

    function ActionsController($log, $scope, Dir, DirResponseService) {
        activate();

        function activate() {
            $scope.actions = {
                enabled: {},
                isEnabled: actionIsEnabled,
                newDir: createNewDir
            };

            enable('new_dir');
        }

        /**
         * Enable action by it name
         *
         * @param {string} actionName
         */
        function enable(actionName) {
            $scope.actions.enabled[actionName] = true;
        }

        /**
         * Disable action by it name
         *
         * @param {string} actionName
         */
        function disable(actionName) {
            $scope.actions.enabled[actionName] = false;
        }

        function createNewDir(name) {
            if (!actionIsEnabled('new_dir'))
                return;

            // Disable new dir create action to prevent multiple dir creation
            // while server is responding on request
            disable('new_dir');

            Dir.create($scope.folder.manager, {name: name}, onNewDirCompleted);
        }

        function onNewDirCompleted(response) {
            // Enable new dir create action when server responded with previous request
            enable('new_dir');

            DirResponseService.extendItem(response, $scope.folder.items.length);
            $scope.folder.items.push(response);

            $log.info('onNewDirCompleted', response);
        }

        /**
         * Determine is action disabled
         *
         * @param {string} actionName
         * @returns {boolean}
         */
        function actionIsEnabled(actionName) {
            return $scope.actions.enabled.hasOwnProperty(actionName) && $scope.actions.enabled[actionName];
        }
    }
})(angular, window.crip || (window.crip = {}));