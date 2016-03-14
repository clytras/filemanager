(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContent', Content);

    Content.$inject = ['ItemService', 'SelectService'];

    function Content(ItemService, SelectService) {
        var content = {
            items: [],
            get: getItems,
            add: add,
            remove: remove,
            removeItems: removeItems
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
         * @param item
         */
        function add(item) {
            if (!ng.isDefined(item.is_extended)) {
                ItemService.extendItem(item);
            }

            content.items.push(item);
        }

        /**
         * Remove single item
         *
         * @param {object} item
         */
        function remove(item) {
            content.items.splice(content.items.indexOf(item), 1);
        }
    }
})(angular, window.crip);