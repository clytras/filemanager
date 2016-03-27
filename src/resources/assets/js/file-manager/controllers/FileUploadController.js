(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('FileUploadController', FileUploadController);

    FileUploadController.$inject = ['$scope', 'CripManagerUploader'];

    function FileUploadController($scope, Uploader) {
        activate();

        function activate() {
            $scope.hasUploads = hasUploads;
            $scope.files = files;
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
         * Get files from queue
         *
         * @returns {Array}
         */
        function files() {
            return Uploader.files;
        }

    }

})(angular, window.crip);