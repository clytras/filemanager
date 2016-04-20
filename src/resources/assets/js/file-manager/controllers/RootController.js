(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('RootController', RootController);

    RootController.$inject = [
        '$scope', '$mdMenu', 'CripManagerLocation', 'CripManagerContent', 'CripManagerTrans', 'CripManagerBreadcrumb'
    ];

    function RootController($scope, $mdMenu, Location, Content, Trans, Breadcrumb) {

        activate();

        function activate() {
            // initialise file manager initial location and load translations
            Trans().init();
            Location.init();

            $scope.deselect = deselect;
            $scope.refreshContent = refreshContent;
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