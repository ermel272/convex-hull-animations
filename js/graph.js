var padding = 10;
var radius = 5;
var two_params = { width: 800, height: 600 };
var two = null;
var vertices = [];
var algorithms = {
    "gift_wrap": giftWrap,
    "graham_scan": grahamScan,
    "quick_hull": quickHull
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min)) + min;
}

function createVertices() {
    num = document.getElementById('num_vertices').value;
    executeButton = document.getElementById("execute");
    executeButton.disabled = true
    
    if (num === "") { return }
    
    // Unbind update event and clear canvas
    two.unbind('update', null)
    two.clear()
    vertices = []
    
    for (i = 0; i < num; i++) {
        var x = getRandomInt(padding, two_params.width - padding)
        var y = getRandomInt(padding, two_params.height - padding)
        var circle = two.makeCircle(x, y, radius);
        circle.fill = '#FF8000';
        circle.x = x
        circle.y = y
        vertices.push(circle)
    }
    
    var group = two.makeGroup(...vertices);
    group.scale = 0.0;
    
    // Animate the creation of the vertices
    two.bind('update', function(frameCount) {
        if (group.scale < 0.9999) {
            var t = (1 - group.scale) * 0.125;
            group.scale += t;
        } else {
            two.unbind('update', null)
            executeButton.disabled = false
        }
    }).play();
}

function execute() {
    if (vertices.length <= 1) { return }
    
    // Unbind the update event
    two.unbind('update', null)
    
    // Find & execute algorithm chosen in the DOM
    alg = document.getElementById('algorithm').value;
    algorithms[alg].execute(vertices, two)
}

// Create canvas once DOM has been loaded
document.addEventListener("DOMContentLoaded", function(event) { 
    // Place canvas on the page
    var canvas = document.getElementById('canvas');
    two = new Two(two_params).appendTo(canvas);

    two.makeText("Create vertices to start", two_params.width/2, two_params.height/2);

    // Render to the canvas
    two.update();
});