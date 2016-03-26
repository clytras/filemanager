(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', '$mdDialog', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation'
    ];

    function ActionsController($scope, $mdDialog, focus, Actions, Content, Location) {
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

            $scope.hasProperties = hasProperties;
            $scope.openProperties = openProperties;

            $scope.canUpload = canUpload;
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

        /**
         * Determines is selected item can provide properties
         *
         * @returns {boolean}
         */
        function hasProperties() {
            var item = Content.getSelectedItem();

            return item && !item.isDirUp;
        }

        /**
         * Open item properties pop-up
         *
         * @param $event
         */
        function openProperties($event) {
            if (!hasProperties())
                return;

            $event.stopPropagation();
            var item = Content.getSelectedItem(),
                options = {
                    clickOutsideToClose: true,
                    openFrom: '#' + item.identifier,
                    closeTo: '#' + item.identifier,
                    templateUrl: $scope.templatePath('item-properties-modal'),
                    controller: 'ItemPropertiesController',
                    locals: {
                        item: item
                    }
                };

            $mdDialog.show(options);
        }

        /**
         * Determines if file can be uploaded
         *
         * @returns {boolean}
         */
        function canUpload() {
            // at this moment we can upload to any open dir
            return true;
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));