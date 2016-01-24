(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('FileService', FileService);

    FileService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function FileService($log, $rootScope, $http) {
        $log.log('FileService service <- started');

        return {
            rename: rename,
            'delete': deleteFile
        };

        function rename(path, oldName, newName, onSuccess, onError) {
            $log.log('FileService -> rename', {path: path, oldName: oldName, newName: newName});

            var url = $rootScope.baseUrl() + 'file/rename/' + path;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        function deleteFile(path, name, onSuccess, onError) {
            $log.log('FileService -> delete', {path: path, name: name});

            var url = $rootScope.baseUrl() + 'file/delete/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }
    }
})(angular, jQuery);