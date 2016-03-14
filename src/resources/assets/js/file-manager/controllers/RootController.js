(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$scope', 'CripManagerLocation', 'CripManagerContent'
    ];

    function RootController($scope, Location, Content) {

        activate();

        function activate() {
            // initialise file manager initial location
            Location.init();

            $scope.deselect = deselect;
        }

        function deselect() {
            Content.deselect();
        }
    }
})(angular, window.crip || (window.crip = {}));