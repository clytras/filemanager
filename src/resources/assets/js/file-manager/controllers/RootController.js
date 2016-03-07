(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'Dir'
    ];

    function RootController($log, $scope, $cookies, Notification, Dir) {

        activate();

        function activate() {
            $scope.isDir = isDir;
            $scope.isDirUp = isDirUp;
            $scope.manager = {dir: '', name: ''};
            Dir.query($scope.manager);
        }


        /**
         * Determine is item a folder
         *
         * @param item
         * @returns {boolean}
         */
        function isDir(item) {
            return item && ng.isDefined(item.type) && item.type === 'dir';
        }

        /**
         * Determine is item an a folder up
         *
         * @param item
         * @returns {boolean}
         */
        function isDirUp(item) {
            return isDir(item) && item.name == '..';
        }
    }
})(angular, window.crip || (window.crip = {}));