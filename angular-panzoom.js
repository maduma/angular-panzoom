/* global angular */
(function() {
'use strict';

angular
    .module('maPanzoom', [])
    .directive('maPanzoom', panzoom);
    
function panzoom() {

    var directive = {
        scope: {},
        restrict: 'A',
        link: link
    };
    
    
    return directive;
    
    function link(scope, element, attrs) {
        console.log(scope);
        var zoom = 0.04;
        
        var canvas = element[0];
        var buffer = document.createElement('canvas');
        var isPanning = false;
        var panOrigin = {x:0, y:0};
        
        // tranformation (translate + scale) to apply when rendering image
        var trans = {x: 0, y: 0, s: 1};
        
        // first render
        render();
        
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
        
        // read dropped image, save in the buffer then render it on the canvas
        function readImage(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var dataURI = e.target.result;
                console.log(dataURI);
                var image = document.createElement('img');
                image.src = dataURI;
                image.addEventListener('load', function() {
                    buffer.width = image.width;
                    buffer.height = image.height;
                    var ctx = buffer.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    initTrans();
                    render();
                });
            };
            reader.readAsDataURL(file);
        }
        
        // initial tranformation to center the image
        function initTrans() {
            // scaling
            if (Math.max(buffer.width, buffer.height) === buffer.width) {
                trans.s = canvas.width / buffer.width;
            } else {
                trans.s = canvas.height / buffer.height;
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
            ctx.strokeRect(40, 22, 800, 450);
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