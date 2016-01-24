(function (angular, $) {
    'use strict';

    angular
        .module('file.manager')
        .service('DirService', DirService);

    DirService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function DirService($log, $rootScope, $http) {
        $log.log('DirService service <- started');

        return {
            extend: extend,
            extendItem: extendItem,
            rename: rename,
            create: create,
            'delete': deleteDir,
            idGen: idGen
        };

        function extend(data) {
            if (angular.isDefined(data.DirServiceExtended) && data.DirServiceExtended)
                return;

            angular.extend(data, {
                dirs: function () {
                    var folders = [];
                    angular.forEach(data, function (value, key) {
                        if (value.type == 'dir' && value.name != '..') {
                            extendItem(value, key);
                            this.push(value);
                        }
                    }, folders);

                    return folders;
                },
                items: function () {
                    var items = [];
                    angular.forEach(data, function (value, key) {
                        extendItem(value, key);
                        this.push(value);
                    }, items);

                    return items;
                }
            });

            data.DirServiceExtended = true;
        }

        /**
         * Renames path last part nto new name
         *
         * @param path "path to rename"
         * @param oldName
         * @param newName "new name for path last element"
         * @param onSuccess "callback for successful rename"
         * @param onError "callback for error"
         */
        function rename(path, oldName, newName, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/rename/' + path;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        function create(path, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/create/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        function deleteDir(path, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/delete/' + path;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        function idGen(key) {
            return 'list-item-' + key;
        }

        function extendItem(item, key) {
            item.id = idGen(key);
        }
    }
})(angular, jQuery);