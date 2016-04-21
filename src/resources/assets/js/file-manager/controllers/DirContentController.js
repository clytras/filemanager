(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirContentController', DirContentController);

    DirContentController.$inject = [
        '$log', '$scope', 'CripManagerContent', 'CripManagerContentOrder'
    ];

    function DirContentController($log, $scope, Content, ContentOrder) {
        activate();

        function activate() {
            $scope.folderFilter = folderFilter;
            $scope.order = ContentOrder;
            $scope.filters = {
                image: true,
                media: true,
                document: true,
                file: true
            };

            $scope.getContent = function() {
                return Content.get();
            }
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