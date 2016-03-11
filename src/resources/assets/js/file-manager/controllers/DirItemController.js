(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirItemController', DirItemController);

    DirItemController.$inject = ['$log', '$scope'];

    function DirItemController($log, $scope) {
        activate();

        function activate() {
            $scope.click = click;
            $scope.dblclick = dblclick;
        }

        function click(e, item) {
            e.stopPropagation();
            $scope.folder.disableItemsProp('rename');
            $scope.folder.selected = item;
            //$log.info('click', item);
        }

        function dblclick(e, item) {
            e.stopPropagation();
            $log.info('dblclick', item);

            if (item.isDir) {
                $scope.folder.goTo(item);
            }
        }
    }
})(angular, window.crip || (window.crip = {}));