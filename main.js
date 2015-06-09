/* global angular */
(function() {
'use strict';

angular
    .module('main', ['maPanzoom'])
    .controller('controller', controller);
    
controller.$inject = ['$timeout'];    
    
function controller($timeout) {
    var self = this;
    var image = document.createElement('img');
    image.src = 'tv.png';
    image.addEventListener('load', function() {
        $timeout(function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            self.uri = canvas.toDataURL();
        }, 2000);
    });
}

})();