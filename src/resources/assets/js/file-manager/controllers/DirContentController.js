(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('DirContentController', DirContentController);

    DirContentController.$inject = [
        '$log', '$scope', 'CripManagerContent', 'CripManagerContentOrder', 'CripManagerContentFilter'
    ];

    function DirContentController($log, $scope, Content, ContentOrder, ContentFilter) {
        activate();

        function activate() {
            $scope.order = ContentOrder;
            $scope.filter = ContentFilter;

            $scope.getContent = function() {
                return Content.get();
            }
        }

    }
})(angular, window.crip || (window.crip = {}));