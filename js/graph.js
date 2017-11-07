var padding = 10;
var radius = 5;
var two_params = { width: 800, height: 600 };
var two = null;
var vertices = [];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  
  return Math.floor(Math.random() * (max - min)) + min;
}

function createVertices() {
		num = document.getElementById('num_vertices').value;
		
		if (num === "") {
			return
		}
		
		two.clear()
		vertices = []
		
		for (i = 0; i < num; i++) {
			var x = getRandomInt(padding, two_params.width - padding)
			var y = getRandomInt(padding, two_params.height - padding)
			var circle = two.makeCircle(x, y, radius);
			circle.fill = '#FF8000';
			vertices.push(circle)
		}
		
		var group = two.makeGroup(...vertices);
		group.scale = 0.0;
		
		two.bind('update', function(frameCount) {
		  if (group.scale < 0.9999) {
			var t = (1 - group.scale) * 0.125;
			group.scale += t;
		  }
		}).play();
}

// Load canvas once DOM has been loaded
document.addEventListener("DOMContentLoaded", function(event) { 
	// Place canvas on the page
	var elem = document.getElementById('canvas');
	two = new Two(two_params).appendTo(elem);

	var circle = two.makeCircle(72, 100, 50);
	var rect = two.makeRectangle(213, 100, 100, 100);

	circle.fill = '#FF8000';
	circle.stroke = 'orangered';
	circle.linewidth = 5;

	rect.fill = 'rgb(0, 200, 255)';
	rect.opacity = 0.75;
	rect.noStroke();

	// Render to the canvas
	two.update();
});