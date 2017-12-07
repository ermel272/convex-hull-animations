var refEdgeColor = "rgba(0, 0, 255, 0.5)"
var checkEdgeColor = "rgba(255, 0, 0, 0.5)"
var hullEdgeColor = "rgba(0, 255, 0, 0.5)"

var giftWrap = {
    execute : function(vertices, two) {
        var hull = []
        var hullPoint = giftWrap.findLeftmostPoint(vertices)
        var endpoint = null
        var hull_edges = two.makeGroup()
        
        function point_step(i) {
            // Executes the loop iteration fixed from a known point on the convex hull
            hull[i] = hullPoint
            
            // Base case - we have wrapped all the way around
            if (endpoint === hull[0]) { return }
            
            endpoint = vertices[0]
            
            // Create the reference edge
            edge = giftWrap.createEdge(two, refEdgeColor, hull[i], endpoint)
            
            two.bind('update', function(frameCount) {
                if (edge.scale < 0.9999) {
                    var t = (1 - edge.scale) * 0.125;
                    edge.scale += t;
                } else {
                    two.unbind('update')
                    iter_step(edge, 1, i)
                }
            }).play();
        }
        
        function iter_step(edge, j, i) {
            // Base  case - go back to point step
            if (j == vertices.length) {
                hullPoint = endpoint
                edge.stroke = hullEdgeColor
                point_step(i + 1)
                
                return
            }
            
            // Iterates over all vertices, trying to find the next known convex hull point
            vertex = vertices[j]
            
            // Create the candidate edge
            edge2 = giftWrap.createEdge(two, checkEdgeColor, hull[i], vertex)
            
            two.bind('update', function(frameCount) {
                if (edge2.scale < 0.9999) {
                    var t = (1 - edge2.scale) * 0.125;
                    edge2.scale += t;
                } else {
                    two.unbind('update')
                    if ((endpoint == hullPoint) || (giftWrap.leftTurn(hullPoint, endpoint, vertex))) {
                        // Point is to the left of reference line
                        endpoint = vertex
                        two.remove(edge)
                        edge2.stroke = refEdgeColor
                        iter_step(edge2, j + 1, i)
                    } else {
                        // Point is to the right of or colinear to the reference line
                        two.remove(edge2)
                        iter_step(edge, j + 1, i)
                    }
                }
            }).play();
        }
        
        point_step(0)
    },
    
    createEdge : function(two, color, v1, v2) {
        edge = two.makeLine(v1.x, v1.y, v2.x, v2.y)
        edge.linewidth = 3
        edge.stroke = color
        edge.scale = 0.0
        
        return edge
    },
    
    leftTurn : function(v1, v2, v3) {
        det = (v2.x - v1.x)*(v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x)
        return det < 0
    },
    
    findLeftmostPoint : function(vertices) {
        leftMost = vertices[0]
        
        for (var i in vertices) {
            if (vertices[i].x < leftMost.x) { leftMost = vertices[i] }
        }
        
        return leftMost
    },
}