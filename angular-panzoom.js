/* global angular */
(function() {
'use strict';

angular
    .module('maPanzoom', [])
    .directive('maPanzoom', panzoom);
    
function panzoom() {

    var directive = {
        scope: {
            uri: '=',
            src: '@',
            stroke: '@'
        },
        restrict: 'A',
        link: link
    };
    
    
    return directive;
    
    function link(scope, element, attrs) {
        if (typeof scope.stroke === 'undefined') {
            scope.stroke = 30;
        }
        var zoom = 0.04;
        var lineWidth = 1;
        
        var canvas = element[0];
        var buffer = document.createElement('canvas');
        var isPanning = false;
        var panOrigin = {x:0, y:0};
        
        // tranformation (translate + scale) to apply when rendering image
        var trans = {x: 0, y: 0, s: 1};
        
        // first render
        loadBuffer(scope.src);
        
        // listen for uri change
        scope.$watch('uri', function() {
            if (typeof scope.uri !== 'undefined') {
                loadBuffer(scope.uri);
            }
        });
        
        // bind ENTER key event to crop
        window.addEventListener('keypress', function(event) {
            if (event.charCode === 13) { // ENTER KEY
                toDataURI();
            }
        });
        
        // bind events for droping image on canvas
        canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
        }, true);
        canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            console.log('name: ' + file.name + ', type: ' + file.type);
            // only read image type file
            if (file.type.match(/^image\//)) {
                initTrans();
                readImage(file);    
            }
        }, true);
        
        // bind events for pan
        canvas.addEventListener('mousedown', startPanning);
        canvas.addEventListener('mouseup', stopPanning);
        canvas.addEventListener('mouseout', stopPanning);
        canvas.addEventListener('mousemove', doPanning);
        // bind events for zoom
        canvas.addEventListener('wheel', doScale);
        
        // read dropped image, load the buffer then render it on the canvas
        function readImage(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var dataURI = e.target.result;
                loadBuffer(dataURI);
            };
            reader.readAsDataURL(file);
        }
        
        // draw image in a buffer and render
        function loadBuffer(src) {
            if (typeof src !== 'undefined') {
                var image = document.createElement('img');
                image.src = src;
                image.addEventListener('load', function() {
                    buffer.width = image.width;
                    buffer.height = image.height;
                    var ctx = buffer.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    initTrans();
                    render();
                });
            } else {
                render();
            }
        }
        
        // initial tranformation to center the image
        function initTrans() {
            // scaling
            if (Math.max(buffer.width, buffer.height) === buffer.width) {
                trans.s = (canvas.width - scope.stroke * 2) / buffer.width;
            } else {
                trans.s = (canvas.height - scope.stroke * 2) / buffer.height;
            }
            // translate to center the image
            trans.x = (canvas.width - buffer.width * trans.s) / 2;
            trans.y = (canvas.height - buffer.height * trans.s) / 2;
        }
        
        function render() {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0 ,0 ,canvas.width, canvas.height);
            ctx.save();
            ctx.translate(trans.x, trans.y);
            ctx.scale(trans.s, trans.s);
            ctx.drawImage(buffer, 0, 0);
            ctx.restore();
            
            // draw delimitation
            ctx.strokeStyle = 'grey';
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(
                scope.stroke - lineWidth,
                scope.stroke - lineWidth,
                canvas.width - scope.stroke * 2 + lineWidth * 2,
                canvas.height - scope.stroke * 2 + lineWidth * 2
            );
        }
        
        function toDataURI() {
            var out = document.createElement('canvas');
            out.width = canvas.width - 2 * scope.stroke;
            out.height = canvas.height - 2 * scope.stroke;
            var ctx = out.getContext('2d');
            ctx.drawImage(canvas, - scope.stroke, - scope.stroke);
            scope.uri = out.toDataURL();
            scope.$apply();
        }
        
        function startPanning(event) {
            panOrigin = {x: event.clientX, y: event.clientY};
            isPanning = true;
        }
        
        function stopPanning() {
            isPanning = false;
        }
        
        function doPanning(event) {
            if (isPanning) {
                trans.x = trans.x - panOrigin.x + event.clientX;
                trans.y = trans.y - panOrigin.y + event.clientY;
                panOrigin = {x: event.clientX, y: event.clientY};
                render();
            }
        }
        
        function doScale(event) {
            if (event.deltaY > 0) {
                 trans.s = trans.s * (1 + zoom);
            } else {
                 trans.s = trans.s * (1 - zoom);
            }
            render();
        }
    }
}
    
})();