(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('BreadcrumbController', BreadcrumbController);

    BreadcrumbController.$inject = [
        '$scope', 'CripManagerBreadcrumb', 'CripManagerLocation'
    ];

    function BreadcrumbController($scope, Breadcrumb, Location) {
        activate();

        function activate() {
            $scope.goTo = goTo;
            $scope.goToRoot = goToRoot;
            $scope.breadcrumbHasItems = breadcrumbHasItems;
            $scope.getBreadcrumbItems = getBreadcrumbItems;
        }

        /**
         * Go to specified folder
         *
         * @param {object} folder
         * @param {string} folder.dir
         * @param {string} folder.name
         */
        function goTo(folder) {
            Location.change(folder);
        }

        /**
         * Go to root folder location
         */
        function goToRoot() {
            goTo();
        }

        /**
         * Determines is Breadcrumb any item
         *
         * @returns {boolean}
         */
        function breadcrumbHasItems() {
            return Breadcrumb.hasItems();
        }

        /**
         * Get Breadcrumb item collection
         *
         * @returns {Array}
         */
        function getBreadcrumbItems() {
            return Breadcrumb.items;
        }
    }
})(angular, window.crip);