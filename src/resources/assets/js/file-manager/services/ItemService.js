(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('ItemService', ItemService);

    ItemService.$inject = [
        '$log'
    ];

    function ItemService($log) {
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
         * Get key from identifier (reverse method from idGen)
         *
         * @param {string} identifier
         * @returns {string}
         */
        function getKey(identifier) {
            return identifier.substring(10);
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
                is_extended: true,
                rename: false,
                identifier: idGen(key),
                isDir: isDir(item),
                isDirUp: isDirUp(item),
                update: update,
                delete: deleteItem,
                getFullName: getFullName,
                saveNewName: saveNewName,
                getSize: getSize
            });
        }

        /**
         * Update item changes if they are presented
         *
         * @returns {item}
         */
        function update() {
            if (this.rename)
                this.saveNewName();

            return this;
        }

        /**
         * Get item name (ignoring full_name property value)
         *
         * @returns {string}
         */
        function getFullName() {
            if (this.isDir || this.extension === '')
                return this.name;
            else
                return '{name}.{extension}'.supplant(this);
        }

        /**
         * Save item name if it is changed
         */
        function saveNewName() {
            var self = this,
                key = getKey(self.identifier),
                menu = self.menu;
            self.rename = false;
            if (self.full_name !== self.getFullName()) {
                var method = self.isDir ? '$renameDir' : '$renameFile';
                self[method]({
                    'old': self.full_name,
                    'new': self.getFullName()
                }, function (response) {
                    ng.extend(self, extendItem(response, key), {menu: menu});
                })
            }
        }

        /**
         * Delete item detecting it type (file or dir)
         */
        function deleteItem() {
            var method = this.isDir ? '$deleteDir' : '$deleteFile';
            this[method]({name: this.full_name});
        }

        /**
         * Get user friendly item size
         */
        function getSize() {
            return this.bytes.toBytes();
        }
    }
})(angular, window.crip || (window.crip = {}));