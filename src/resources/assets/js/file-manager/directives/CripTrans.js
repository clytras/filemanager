(function (ng, crip) {
    'use strict';

    crip.filemanager
        .directive('cripTrans', cripTrans);

    cripTrans.$inject = ['$log', 'CripManagerTrans'];

    function cripTrans($log, Trans) {
        return {
            link: link,
            restrict: 'A'
        };

        function link(scope, element, attr, ctrl) {
            Trans.then(function(values){
                // $log.debug('cripTrans: ', element, attr.cripTrans, Trans, Trans[attr.cripTrans]);
                element.html(values[attr.cripTrans]);
            });
        }
    }

})(angular, crip);