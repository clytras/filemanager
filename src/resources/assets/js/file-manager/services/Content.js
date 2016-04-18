(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContent', Content);

    Content.$inject = ['ItemService', 'SelectService', 'Dir'];

    function Content(ItemService, SelectService, Dir) {
        var content = {
            items: [],
            get: getItems,
            add: add,
            remove: remove,
            removeItems: removeItems,
            hasProperties: hasProperties
        };

        ng.extend(content, SelectService);

        return content;

        /**
         * Get all content items
         *
         * @returns {Array}
         */
        function getItems() {
            return content.items;
        }

        /**
         * Remove all items in content
         */
        function removeItems() {
            content.items.splice(0, content.items.length);
        }

        /**
         * Add item to content
         *
         * @param {Object} item
         * @returns {Object}
         */
        function add(item) {
            if (!ng.isDefined(item.is_extended)) {
                ItemService.extendItem(item);
            }

            if(typeof item !== 'Dir') {
                item = new Dir(item);
            }

            content.items.push(item);

            return item;
        }

        /**
         * Remove single item
         *
         * @param {object} item
         */
        function remove(item) {
            content.items.splice(content.items.indexOf(item), 1);
        }

        /**
         * Determines is item has properties
         *
         * @param {object} item
         * @returns {boolean}
         */
        function hasProperties(item) {
            if(!item) {
                return false;
            }

            return !item.isDirUp
        }
    }
})(angular, window.crip);