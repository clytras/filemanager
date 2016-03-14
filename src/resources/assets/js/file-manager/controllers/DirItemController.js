(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirItemController', DirItemController);

    DirItemController.$inject = ['$log', '$scope', 'CripManagerContent', 'CripManagerLocation', 'CripManagerActions'];

    function DirItemController($log, $scope, Content, Location, Actions) {
        activate();

        function activate() {
            $scope.click = click;
            $scope.dblclick = dblclick;
            $scope.isSelected = isSelected;
            $scope.enableRename = enableRename;
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
        }

        /**
         * On item double click
         *
         * @param e
         * @param item
         */
        function dblclick(e, item) {
            e.stopPropagation();
            $log.info('dblclick', item);

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
            Actions.enableRename(Content.getSelectedItem());
        }
    }
})(angular, window.crip || (window.crip = {}));