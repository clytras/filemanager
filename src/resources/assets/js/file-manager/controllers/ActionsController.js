(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$log', '$scope', 'focus', 'Dir', 'DirResponseService'
    ];

    function ActionsController($log, $scope, focus, Dir, DirResponseService) {
        activate();

        function activate() {
            $scope.actions = {
                enabled: {},
                isEnabled: actionIsEnabled,
                newDir: createNewDir,
                canRename: canRename,
                rename: rename,
                canDelete: canDelete,
                'delete': deleteItem
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

        /**
         * Create new dir in file system
         *
         * @param {string} name
         */
        function createNewDir(name) {
            if (!actionIsEnabled('new_dir'))
                return;

            // Disable new dir create action to prevent multiple dir creation
            // while server is responding on request
            disable('new_dir');

            Dir.create($scope.folder.manager, {name: name}, onNewDirCompleted);
        }

        /**
         * Callback on new dir response from server
         *
         * @param {object} response
         */
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

        /**
         * Determines is selected item can be renamed
         *
         * @returns {boolean}
         */
        function canRename() {
            if (!$scope.folder.selected)
                return false;

            return !$scope.folder.selected.isDirUp
        }

        function rename(e, item) {
            if (!canRename())
                return;

            e.stopPropagation();
            item.rename = true;
            focus('#{id} input[name="name"]'.supplant({id: item.identifier}));
            //$log.debug('rename', item);
        }

        function canDelete() {
            if (!$scope.folder.selected)
                return false;

            return !$scope.folder.selected.isDirUp
        }

        function deleteItem(e, item) {
            if (!canDelete())
                return;

            e.stopPropagation();
            item.delete();
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));