(function (ng, $, crip) {
    'use strict';

    crip.filemanager
        .controller('ActionsController', ActionsController);

    ActionsController.$inject = [
        '$scope', '$mdMenu', 'focus', 'CripManagerActions', 'CripManagerContent', 'CripManagerLocation',
        'CripManagerUploader', 'CripPropertiesModal', 'CripManagerContentOrder'
    ];

    function ActionsController($scope, $mdMenu, focus, Actions, Content, Location,
                               Uploader, PropertiesModal, ContentOrder) {
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
            $scope.hasUploads = hasUploads;
            $scope.addFiles = addFiles;
            $scope.upload = upload;
            $scope.cancelUpload = cancelUpload;

            $scope.order = ContentOrder;
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
            // close menu if is open when enabling rename function
            $mdMenu.hide();

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
            return Content.hasProperties(Content.getSelectedItem());
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
            PropertiesModal.open(Content.getSelectedItem());
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

        /**
         * Determines if there files in queue for upload
         *
         * @returns {boolean}
         */
        function hasUploads() {
            return Uploader.hasFiles();
        }

        /**
         * Add files for upload
         *
         * @param {Array} files
         */
        function addFiles(files) {
            Uploader.add(files);
        }

        /**
         * Start upload files from queue
         */
        function upload() {
            Uploader.start();
        }

        function cancelUpload() {
            Uploader.clean();
        }
    }
})(angular, jQuery, window.crip || (window.crip = {}));