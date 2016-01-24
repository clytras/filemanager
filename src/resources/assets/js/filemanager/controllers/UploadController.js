(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .controller('UploadController', UploadController);

    UploadController.$inject = [
        '$log', '$scope', 'FileUploader'
    ];

    function UploadController($log, $scope, FileUploader) {
        $log.log('UploadController controller <- started');

        activate();

        function activate() {
            $scope.uploader = new FileUploader({
                url: _getUploadPath
            });
        }

        function _getUploadPath() {
            return $scope.baseUrl() + 'file/upload' + $scope.manager.path;
        }

        $scope.uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            $log.info('onWhenAddingFileFailed', item, filter, options);
        };

        $scope.uploader.onAfterAddingFile = function (fileItem) {
            // fix url to upload as we can change it at any moment
            fileItem.uploader.url = fileItem.url = _getUploadPath();
            $log.info('onAfterAddingFile', fileItem);
        };

        $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
            // TODO: add error handling
            $log.info('onErrorItem', fileItem, /*response,*/ status, headers);
        };

        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (status === 200) {
                $log.info('UploadController -> uploader -> onCompleteItem',
                    {fileItem: fileItem, response: response, status: status, headers: headers});
                $scope.fireBroadcast('file-uploaded', response);
                $scope._success(response);
            }
        };

        $scope.uploader.onCompleteAll = function () {
            $log.info('UploadController -> uploader -> onCompleteAll', {uploader: $scope.uploader});

            var hasNotUploadedFiles = false;
            angular.forEach($scope.uploader.queue, function (file) {
                if (!file.isReady && !file.isUploading && !file.isSuccess) {
                    hasNotUploadedFiles = true;
                }
            });

            if (!hasNotUploadedFiles) {
                // Clear lis from items and hide it
                $scope.uploader.clearQueue();
            }
        };
    }
})(angular, jQuery);