(function(){
window.onload = function() {

var dropTarget = document.getElementById('main');
var canvas = document.getElementById('image');
var img =  document.createElement('img');

var ratio = 0.9094;
var zoom = 0.04;


canvas.getContext('2d').strokeRect(40, 22, 800, 450);
    
// drag and drop event
dropTarget.addEventListener('dragover', function(e) {
    e.preventDefault();
}, true);
dropTarget.addEventListener('drop', function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    console.log('name: ' + file.name + ', type: ' + file.type);
    if (file.type.match(/^image\//)) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var dataURI = e.target.result;
            console.log(dataURI);
            img.src = dataURI;
            img.addEventListener('load', function() {
                render(canvas);
            });
        };
        reader.readAsDataURL(file);
    }
}, true);

// mouse down event
var isPanning = false;
var oVec = {x: 0, y: 0};
var panVec = {x: 0, y:0};
var totalVec = {x:0, y:0};
canvas.addEventListener('mousedown', function(e) {
    oVec = {x: e.clientX, y: e.clientY};
    isPanning = true;
    console.log('mousedown', isPanning, oVec);
});
canvas.addEventListener('mouseup', stopPanning);
canvas.addEventListener('mouseout', stopPanning);
canvas.addEventListener('wheel', function(e) {
    if (e.deltaY > 0) {
        ratio = ratio * (1 + zoom);
    } else {
        ratio = ratio * (1 - zoom);
    }
    render(canvas);
});


function stopPanning(e) {
    isPanning = false;
    totalVec = {x: totalVec.x + panVec.x, y: totalVec.y + panVec.y};
    console.log('stopPanning', isPanning);
}


// mousemove
canvas.addEventListener('mousemove', function(e) {
    if (isPanning) {
        panVec = {x: e.clientX - oVec.x, y: e.clientY - oVec.y};
        render(canvas, panVec);
        console.log('mousemove', oVec, panVec);
    }
});

// canvas rendering
function render(canvas, panVec) {
    if (!panVec) {
        panVec = {x:0 ,y:0};
    }
    // scale original image to fit the canvas size
    var scale = 0;
    if (Math.max(img.width, img.height) === img.width) {
        scale = canvas.width / img.width * ratio;
    } else {
        scale = canvas.height / img.height * ratio;
    }
    var width = img.width * scale;
    var height = img.height * scale;
    console.log('image size', scale, width, height, panVec, totalVec);

    // draw the image
    var ctx = canvas.getContext('2d');
    var x = (canvas.width - width) / 2;
    var y = (canvas.height - height) / 2;
    ctx.clearRect(0 ,0 ,canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panVec.x + totalVec.x, panVec.y + totalVec.y);
    ctx.drawImage(img, x, y, width, height);
    ctx.restore();
    
    // draw delimitation
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(40, 22, 800, 450);
    
}

};
})();

