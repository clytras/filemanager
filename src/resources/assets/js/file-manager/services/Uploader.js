(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerUploader', Uploader);

    Uploader.$inject = ['$rootScope', 'CripManagerBreadcrumb', 'CripManagerContent', 'Upload'];

    function Uploader($rootScope, Breadcrumb, Content, Upload) {

        var uploader = {
            files: [],
            add: addFile,
            hasFiles: hasFiles,
            start: start,
            settings: {
                status: 200,
                error: '',
                url: {
                    root: $rootScope.fileUrl('upload'),
                    dir: ''
                }
            }
        };

        return uploader;

        function addFile(files) {
            ng.forEach(files, function (file) {
                file.progress = 0;
                file.id = uploader.files.length;
                file.isHtml5 = ng.isHtml5;
                file.error = false;
                uploader.files.push(file);
            });
        }

        /**
         * Determines if there files in queue for upload
         *
         * @returns {boolean}
         */
        function hasFiles() {
            return uploader.files.length > 0;
        }

        /**
         * Start upload all files from queue
         *
         * @returns {boolean}
         */
        function start() {
            if (!hasFiles())
                return false;

            // get current dir from Breadcrumb and convert it to string
            uploader.settings.url.dir = Breadcrumb.toString.apply(Breadcrumb.current());

            ng.forEach(uploader.files, onSingleFile);
        }

        /**
         * Upload single file wrapper
         *
         * @param file
         */
        function onSingleFile(file) {
            var upload = Upload.upload({
                url: '{root}/{dir}'.supplant(uploader.settings.url),
                data: {file: file}
            });

            upload.then(function (response) {
                file.progress = 100;
                uploader.files.removeItem(file.id, 'id');
                Content.add(response.data);
            }, function(response) {
                // TODO: add notification about error
                file.error = true;
                file.progress = 100;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(90.0 * evt.loaded / evt.total));
            });
        }

    }

})(angular, window.crip);