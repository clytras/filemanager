(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('FileUploadController', FileUploadController);

    FileUploadController.$inject = ['$scope', 'Upload'];

    function FileUploadController($scope, Upload) {
        activate();

        function activate() {
            $scope.addUpload = addUpload;
            $scope.upload = upload;
            $scope.uploads = {
                files: []
            };
        }

        function addUpload(files) {
            ng.forEach(files, function(file){
                $scope.uploads.files.push(file);
            });
        }

        function hasUploads() {
            return $scope.uploads.files.length > 0;
        }

        function upload() {
            if(!hasUploads())
                return;

            ng.forEach($scope.uploads.files, function(file){
                file.upload = Upload.upload({
                    url: $scope.fileUrl('upload'), // TODO: add current dir path from Breadcrumb service
                    data: {file: file}
                });

                file.upload.then(function (response) {
                        file.result = response.data;
                }, function (response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            });
        }
    }

})(angular, window.crip);