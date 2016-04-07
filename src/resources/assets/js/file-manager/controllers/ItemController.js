(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('ItemController', ItemController);

    ItemController.$inject = [
        '$log', '$scope', '$mdMenu', 'focus', 'CripManagerContent', 'CripManagerLocation',
        'CripManagerActions', 'CripPropertiesModal'
    ];

    function ItemController($log, $scope, $mdMenu, focus, Content, Location,
                            Actions, PropertiesModal) {
        activate();

        function activate() {
            $scope.click = click;
            $scope.dblclick = dblclick;
            $scope.isSelected = isSelected;
            $scope.enableRename = enableRename;
            $scope.canDelete = canDelete;
            $scope.deleteItem = deleteItem;
            $scope.hasProperties = hasProperties;
            $scope.openProperties = openProperties;
            $scope.openMenu = openMenu;
        }

        /**
         * On item click
         *
         * @param e
         * @param item
         */
        function click(e, item) {
            e.stopPropagation();

            Content.updateSelected();
            Content.deselect();
            Content.selectSingle(item);
            $mdMenu.hide();
        }

        /**
         * On item double click
         *
         * @param e
         * @param item
         */
        function dblclick(e, item) {
            e.stopPropagation();
            //$log.info('dblclick', item);

            if (item.isDir) {
                Location.change(item);
            }
        }

        /**
         * Determines is item selected
         *
         * @param {object} item
         * @returns {boolean}
         */
        function isSelected(item) {
            return Content.isSelected(item);
        }

        /**
         * Enable item rename
         *
         * @param $event
         */
        function enableRename($event) {
            $event.stopPropagation();
            $mdMenu.hide();
            var item = Content.getSelectedItem();
            Actions.enableRename(item);
            focus('#{identifier} input[name="name"]'.supplant(item));
        }

        function canDelete(item) {
            return Actions.canDelete(item);
        }

        /**
         * Delete item from file system
         *
         * @param {Object} item
         */
        function deleteItem(item) {
            Actions.delete(item);
        }

        function hasProperties(item) {
            return Content.hasProperties(item);
        }

        function openProperties(item) {
            PropertiesModal.open(item);
        }

        function openMenu(item, $event) {
             $mdMenu.hide().then(function () {
                item.menu.$mdOpenMenu($event);
             });
        }
    }
})(angular, window.crip || (window.crip = {}));