(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirContentController', DirContentController);

    DirContentController.$inject = [
        '$log', '$scope', 'focus', 'Dir'
    ];

    function DirContentController($log, $scope, focus, Dir) {
        activate();

        function activate() {
            $scope.folderFilter = folderFilter;
            $scope.order = {
                by: orderBy,
                field: 'name',
                isReverse: false,

                name: true,
                size: false,
                date: false
            };
            $scope.filters = {
                image: true,
                media: true,
                document: true,
                file: true
            };
        }

        function orderBy(item) {
            var text = 'z {field}';
            if (item.isDir) {
                // dir up should be on first place
                if (item.isDirUp)
                    return -1;
                text = '0 {field}';
            }

            //$log.info($scope.order.field, text.supplant({field: item[$scope.order.field]}), item);
            return text.supplant({field: item[$scope.order.field]});
        }

        function folderFilter(value, index, array) {
            // If item is dir, it will be visible
            if (value.isDir)
                return true;

            // TODO: add filter enable property and check it here
            if(true)
                return $scope.filters[value.type];

            // if filter enable property is disabled, compare with allowed type
            //if (Settings.getType() == value.type)
            //    return true;

            return false;
        }
    }
})(angular, window.crip || (window.crip = {}));