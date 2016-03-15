(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$scope', 'CripManagerLocation', 'CripManagerContent', 'CripManagerTrans'
    ];

    function RootController($scope, Location, Content, Trans) {

        activate();

        function activate() {
            // initialise file manager initial location and load translations
            Trans().init();
            Location.init();

            $scope.deselect = deselect;
        }

        function deselect() {
            Content.deselect();
        }
    }
})(angular, window.crip || (window.crip = {}));