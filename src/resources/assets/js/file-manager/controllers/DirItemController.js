(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirItemController', DirItemController);

    DirItemController.$inject = ['$scope'];

    function DirItemController($scope) {
        activate();

        function activate() {
            $scope.click = click;
        }

        function click(item) {
            if (item.isDir) {
                $scope.folder.goTo(item);
            }
        }
    }
})(angular, window.crip || (window.crip = {}));