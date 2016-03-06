(function (angular, crip) {
    'use strict';

    crip.fileM
        .service('FileService', FileService);

    FileService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function FileService($log, $rootScope, $http) {
        //$log.log('FileService service <- started');

        return {
            rename: rename,
            'delete': deleteFile
        };

        /**
         * Rename file
         *
         * @param dir
         * @param oldName
         * @param newName
         * @param onSuccess
         * @param onError
         */
        function rename(dir, oldName, newName, onSuccess, onError) {
            $log.log('FileService -> rename', {dir: dir, oldName: oldName, newName: newName});

            var url = $rootScope.baseUrl() + 'file/rename/' + dir;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        /**
         * Delete file
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function deleteFile(dir, name, onSuccess, onError) {
            $log.log('FileService -> delete', {dir: dir, name: name});

            var url = $rootScope.baseUrl() + 'file/delete/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }
    }
})(angular, window.crip || (window.crip = {}));