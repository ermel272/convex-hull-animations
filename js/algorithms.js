var giftWrap = {
	execute : function(vertices, two) {
		var hull = []
		var hullPoint = this.findLeftmostPoint(vertices)
		var i = 0
		var endpoint = null
		
		do {
			hull[i] = hullPoint
			endpoint = vertices[0]
		}
		while (endpoint != hull[0])
	},
	
	findLeftmostPoint : function(vertices) {
		leftMost = vertices[0]
		
		for (var vertex in vertices) {
			if (vertex.translation._x < leftMost.translation._x) { leftMost = vertex }
		}
		
		return leftMost
	},
}