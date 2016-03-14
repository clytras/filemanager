(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = ['$scope', 'focus', 'CripManagerActions', 'CripManagerContent'];

    function ActionsController($scope, focus, Actions, Content) {
        activate();

        function activate() {
            $scope.canDeleteSelected = canDeleteSelectedItem;
            $scope.deleteSelected = deleteSelectedItem;
            $scope.canCreateFolder = canCreateFolder;
            $scope.createFolder = createFolder;
            $scope.canRenameSelected = canRenameSelectedItem;
            $scope.enableRenameSelected = enableRenameSelectedItem;
        }

        /**
         * Determines if selected item can be deleted
         *
         * @returns {boolean}
         */
        function canDeleteSelectedItem() {
            return Actions.canDelete(Content.getSelectedItem());
        }

        /**
         * Delete selected item
         *
         * @param $event
         */
        function deleteSelectedItem($event) {
            // if event is presented, stop it propagation
            if (ng.isDefined($event) && ng.isDefined($event.stopPropagation)) {
                $event.stopPropagation();
            }

            Actions.delete(Content.getSelectedItem());
            Content.deselect();
        }

        /**
         * Determines if can create new folder
         *
         * @returns {boolean}
         */
        function canCreateFolder() {
            return Actions.canCreateFolder();
        }

        /**
         * Create new folder
         *
         * @param {string} name
         */
        function createFolder(name) {
            Actions.createFolder(name, enableRenameSelectedItem);
        }

        /**
         * Determines if selected item can be renamed
         *
         * @returns {boolean}
         */
        function canRenameSelectedItem() {
            return Actions.canRename(Content.getSelectedItem());
        }

        /**
         * Enable rename for selected item
         *
         * @param $event
         */
        function enableRenameSelectedItem($event) {
            var item = Content.getSelectedItem();

            // if event is presented, stop it propagation
            if (ng.isDefined($event) && ng.isDefined($event.stopPropagation)) {
                $event.stopPropagation();
            }

            if (item) {
                Actions.enableRename(item);
                focus('#{identifier} input[name="name"]'.supplant(item));
            }
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));