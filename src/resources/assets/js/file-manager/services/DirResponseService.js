(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('DirResponseService', DirResponseService);

    DirResponseService.$inject = [
        '$log', '$rootScope'
    ];

    function DirResponseService($log, $rootScope) {
        return {
            'extend': extend,
            'extendItem': extendItem
        };

        /**
         * Extend Dir resource request response with required information
         *
         * @param resourceData
         */
        function extend(resourceData) {
            ng.extend(resourceData, {
                'getItems': function () {
                    var items = [];
                    ng.forEach(resourceData, function (v, k) {
                        extendItem(v, k);
                        this.push(v);
                    }, items);

                    return items;
                }
            });
        }

        /**
         * Generate UI id for item
         *
         * @param key
         * @returns {string}
         */
        function idGen(key) {
            return 'list-item-' + key;
        }

        /**
         * Determine is item a folder
         *
         * @param item
         * @returns {boolean}
         */
        function isDir(item) {
            return item && ng.isDefined(item.type) && item.type === 'dir';
        }

        /**
         * Determine is item an a folder up
         *
         * @param item
         * @returns {boolean}
         */
        function isDirUp(item) {
            return isDir(item) && (item.name == '' || item.name == null);
        }

        /**
         * Extend single item with required information
         *
         * @param item
         * @param key
         */
        function extendItem(item, key) {
            ng.extend(item, {
                crip_extended: true,
                rename: false,
                identifier: idGen(key),
                isDir: isDir(item),
                isDirUp: isDirUp(item),
                update: update,
                delete: deleteItem,
                getFullName: getFullName,
                saveNewName: saveNewName
            });
        }

        function update() {
            if (this.rename)
                this.saveNewName();

            return this;
        }

        function getFullName() {
            if (this.isDir || this.ext === '')
                return this.name;
            else
                return '{name}.{ext}'.supplant(this);
        }

        function saveNewName() {
            var self = this;
            if (self.full_name !== self.getFullName())
                self.$rename({
                    'old': self.full_name,
                    'new': self.getFullName()
                }, function (response) {
                    //$log.debug('saveNewName', response);
                    ng.extend(self, response);
                })
        }

        function deleteItem() {
            this.$delete({name: this.full_name});
        }
    }
})(angular, window.crip || (window.crip = {}));