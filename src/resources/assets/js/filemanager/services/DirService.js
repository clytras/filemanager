(function (angular, crip) {
    'use strict';

    crip.fileM
        .service('DirService', DirService);

    DirService.$inject = [
        '$log', '$rootScope', '$http'
    ];

    function DirService($log, $rootScope, $http) {
        //$log.log('DirService service <- started');

        return {
            'extend': extend,
            'extendItem': extendItem,
            'rename': rename,
            'create': create,
            'delete': deleteDir,
            'idGen': idGen
        };

        function extend(data) {
            if (angular.isDefined(data.DirServiceExtended) && data.DirServiceExtended)
                return;

            angular.extend(data, {
                /**
                 * Used for file tree where folder up is not required
                 *
                 * @returns {Array}
                 */
                dirs: function () {
                    var folders = [];
                    angular.forEach(data, function (value, key) {
                        if (value.mime === 'dir' && value.full_name != '..') {
                            extendItem(value, key);
                            this.push(value);
                        }
                    }, folders);

                    return folders;
                },
                /**
                 * Append each item with required data
                 *
                 * @returns {Array}
                 */
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
         * @param dir "path to rename"
         * @param oldName
         * @param newName "new name for path last element"
         * @param onSuccess "callback for successful rename"
         * @param onError "callback for error"
         */
        function rename(dir, oldName, newName, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/rename/' + dir;
            $http.post(url, {
                'old': oldName,
                'new': newName
            }).then(onSuccess, onError);
        }

        /**
         * Create new directory
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function create(dir, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/create/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        /**
         * Delete existing directory
         *
         * @param dir
         * @param name
         * @param onSuccess
         * @param onError
         */
        function deleteDir(dir, name, onSuccess, onError) {
            var url = $rootScope.baseUrl() + 'dir/delete/' + dir;
            $http.post(url, {
                'name': name
            }).then(onSuccess, onError);
        }

        /**
         * Generate unique item id property
         *
         * @param key array key
         * @returns {string} item id
         */
        function idGen(key) {
            return 'list-item-' + key;
        }

        /**
         * Add id parameter to item
         *
         * @param item
         * @param key
         */
        function extendItem(item, key) {
            item.id = idGen(key);
        }
    }
})(angular, window.crip || (window.crip = {}));