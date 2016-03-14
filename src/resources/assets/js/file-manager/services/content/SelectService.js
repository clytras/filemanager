(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('SelectService', SelectService);

    function SelectService() {
        var select = {
            selected: [],
            select: selectItem,
            selectSingle: selectSingleItem,
            deselect: deselectSelectedItems,
            isSelected: isSelectedItem,
            isSelectedOne: isSelectedOneItem,
            isSelectedAny: isSelectedAnyItem,
            getSelectedItem: getSelectedItem,
            getSelectedItems: getSelectedItems,
            updateSelected: updateSelectedItems
        };

        return select;

        /**
         * Determines is any item selected
         *
         * @returns {boolean}
         */
        function isSelectedAnyItem() {
            return !!select.selected.length;
        }

        /**
         * Determines is item in selected items collection
         *
         * @param {object} item
         * @returns {boolean}
         */
        function isSelectedItem(item) {
            if (!isSelectedAnyItem())
                return false;

            var isSelected = false;

            ng.forEach(select.selected, function (selected_item) {
                if (ng.equals(item, selected_item)) {
                    isSelected = true;
                }
            });

            return isSelected;
        }

        /**
         * Determines is selected only one item
         *
         * @returns {boolean}
         */
        function isSelectedOneItem() {
            return select.selected.length === 1;
        }

        /**
         * Get single selected item
         *
         * @returns {object|boolean}
         */
        function getSelectedItem() {
            if (!isSelectedOneItem())
                return false;

            return select.selected[0];
        }

        /**
         * Get all selected items
         *
         * @returns {Array}
         */
        function getSelectedItems() {
            return select.selected;
        }

        /**
         * Add item to collection of selected items
         *
         * @param {object} item
         */
        function selectItem(item) {
            select.selected.push(item);
        }

        /**
         * Deselect all selected items and update changes in them
         */
        function deselectSelectedItems() {
            updateSelectedItems();
            select.selected.splice(0, select.selected.length);
        }

        /**
         * Deselect all selected items and add this one as selected
         *
         * @param {object} item
         */
        function selectSingleItem(item) {
            deselectSelectedItems();
            selectItem(item);
        }

        /**
         * Update changes in selected items
         */
        function updateSelectedItems() {
            ng.forEach(getSelectedItems(), function (item) {
                item.update();
            });
        }

    }
})(angular, window.crip);