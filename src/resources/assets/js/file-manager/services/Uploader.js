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
                uploader.files.push(file);
            });
        }

        function hasFiles() {
            return uploader.files.length > 0;
        }

        function start() {
            if (!hasFiles())
                return false;

            // get current dir from Breadcrumb and convert it to string
            uploader.settings.url.dir = Breadcrumb.toString.apply(Breadcrumb.current());

            ng.forEach(uploader.files, onSingleFile);
        }

        function onSingleFile(file) {
            var upload = Upload.upload({
                url: '{root}/{dir}'.supplant(uploader.settings.url),
                data: {file: file}
            });

            upload.then(function (response) {
                uploader.files.removeItem(file.id, 'id');
                Content.add(response.data);
            }, ng.noop, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }

    }

})(angular, window.crip);