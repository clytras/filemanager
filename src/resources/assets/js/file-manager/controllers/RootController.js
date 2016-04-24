(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$scope', '$mdMenu', 'CripManagerLocation', 'CripManagerContent', 'CripManagerBreadcrumb', 'CripManagerSettings'
    ];

    function RootController($scope, $mdMenu, Location, Content, Breadcrumb, Settings) {

        activate();

        function activate() {
            // initialise file manager initial location
            Location.init();

            $scope.deselect = deselect;
            $scope.refreshContent = refreshContent;
            $scope.icon = Settings.icon;
        }

        function deselect() {
            Content.deselect();
            $mdMenu.hide();
        }

        function refreshContent() {
            Location.change(Breadcrumb.current());
        }
    }
})(angular, window.crip || (window.crip = {}));