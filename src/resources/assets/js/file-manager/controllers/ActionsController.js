(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation'
    ];

    function ActionsController($scope, focus, Actions, Content, Location) {
        activate();

        function activate() {
            $scope.canDeleteSelected = canDeleteSelected;
            $scope.deleteSelected = deleteSelected;

            $scope.canCreateFolder = canCreateFolder;
            $scope.createFolder = createFolder;

            $scope.canRenameSelected = canRenameSelected;
            $scope.enableRenameSelected = enableRenameSelected;

            $scope.canOpenSelected = canOpenSelected;
            $scope.openSelected = openSelected;
        }

        /**
         * Determines if selected item can be deleted
         *
         * @returns {boolean}
         */
        function canDeleteSelected() {
            return Actions.canDelete(Content.getSelectedItem());
        }

        /**
         * Delete selected item
         *
         * @param $event
         */
        function deleteSelected($event) {
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
            Actions.createFolder(name, enableRenameSelected);
        }

        /**
         * Determines if selected item can be renamed
         *
         * @returns {boolean}
         */
        function canRenameSelected() {
            return Actions.canRename(Content.getSelectedItem());
        }

        /**
         * Enable rename for selected item
         *
         * @param $event
         */
        function enableRenameSelected($event) {
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

        /**
         * Determines if can open selected item
         *
         * @returns {boolean}
         */
        function canOpenSelected() {
            return Content.getSelectedItem().isDir;
        }

        /**
         * Open selected directory
         */
        function openSelected() {
            if (!canOpenSelected())
                return;

            Location.change(Content.getSelectedItem());
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));