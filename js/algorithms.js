var refEdgeColor = "rgba(0, 0, 255, 0.5)"
var checkEdgeColor = "rgba(255, 0, 0, 0.5)"
var hullEdgeColor = "rgba(0, 255, 0, 0.5)"
var edges = []

/**
* Removes all edges from the canvas
*/
function clearHull(two) {
    if (edges.length == 0) { return }
    
    for (var i in edges) {
        two.remove(edges[i])
    }
}

/**
* Draws an edge onto the canvas
*/
function createEdge(two, color, v1, v2) {
    edge = two.makeLine(v1.x, v1.y, v2.x, v2.y)
    edge.linewidth = 3
    edge.stroke = color
    edge.scale = 0.0
    edges.push(edge)
    
    return edge
}

/**
* Determines if v1 -> v2 -> v3 is a left turn
*/    
function leftTurn(v1, v2, v3) {
    det = (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x)
    return det < 0
}

/**
* Determines if v1 -> v2 -> v3 is a right turn
*/
function rightTurn(v1, v2, v3) {
    det = (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x)
    return det > 0
}

function findLeftmostPoint(vertices) {
    leftMost = vertices[0]
    
    for (var i in vertices) {
        if (vertices[i].x < leftMost.x) { leftMost = vertices[i] }
    }
        
    return leftMost
}

function findRightmostPoint(vertices) {
    rightMost = vertices[0]
    
    for (var i in vertices) {
        if (vertices[i].x > rightMost.x) { rightMost = vertices[i] }
    }
        
    return rightMost
}

/**
* Colours all edges
*/
function colorEdges(color) {
    for (var i in edges) {
        edges[i].stroke = color
    }
}

/**
* Gets the execution speed from the DOM
*/
function getSpeed() {
    speed = document.getElementById('speed').value
    return speed / 100
}

var grahamScan = {
    execute : function(vertices, two) {
        // Clear the previous hull, if it exists
        clearHull(two)
        
        // Sort vertices into upper and lower components
        a = findLeftmostPoint(vertices)
        b = findRightmostPoint(vertices)
        upperVertices = grahamScan.sortVertices(vertices, a, b, leftTurn)
        lowerVertices = grahamScan.sortVertices(vertices, a, b, rightTurn)
        
        // Sort upper and lower components in order increasing by x coordinate
        upperVertices.sort(grahamScan.xCompare)
        lowerVertices.sort(grahamScan.xCompare)
        
        // Ensure a & b are at the front and rear of their component arrays
        upperVertices.unshift(a)
        upperVertices.push(b)
        lowerVertices.unshift(a)
        lowerVertices.push(b)
        
        function point_step(points, turn, i, init) {
            if (init) {
                // Initialize the stack
                stack = []
                stack.push(points[points.length - 1])
                stack.push(points[0])
                stack.push(points[1])
            } 
            
            /**
            * Base case animation behaviour
            */
            function baseCase() {
                // Base case - we know all the edges are on hull, so color them
                colorEdges(hullEdgeColor)
                
                // Compute the second half of the hull if only the first half has been done
                if (turn === leftTurn) {
                    point_step(lowerVertices, rightTurn, 1, true)
                }
            }
            
            alpha = stack[stack.length - 1]
            beta = stack[stack.length - 2]
            
            if (i === 1) {
                edge = createEdge(two, refEdgeColor, beta, alpha)
                
                two.bind('update', function(frameCount) {
                    if (edge.scale < 0.9999) {
                        var t = (1 - edge.scale) * getSpeed();
                        edge.scale += t;
                    } else if (points.length === 2) {
                        // Base case - since hull component only has two points
                        two.unbind('update')
                        baseCase()
                    } else {
                        two.unbind('update')
                        iter_step(points, stack, alpha, beta, turn, i + 1)
                    }
                }).play();
            } else if (i === points.length - 1) { 
                // Base case - since we have iterated over all component points
                baseCase()
            } else {
                iter_step(points, stack, alpha, beta, turn, i + 1)
            }
        }
        
        function iter_step(points, stack, alpha, beta, turn, j) {
            edge = createEdge(two, checkEdgeColor, points[j], alpha)
            
            two.bind('update', function(frameCount) {
                if (edge.scale < 0.9999) {
                    var t = (1 - edge.scale) * getSpeed();
                    edge.scale += t;
                } else {
                    two.unbind('update')
                    
                    // Check if a left or right turn is formed
                    if (turn(points[j], alpha, beta)) {
                        stack.push(points[j])
                        edge.stroke = refEdgeColor
                        point_step(points, turn, j, false)
                    } else {
                        stack.pop()
                        
                        // Remove the last two edges created
                        two.remove(edges.pop())
                        two.remove(edges.pop())
                        
                        iter_step(points, stack, beta, stack[stack.length - 2], turn, j)
                    }
                }
            }).play();
            
        }
        
        point_step(upperVertices, leftTurn, 1, true)
    },
    
    sortVertices : function(vertices, a, b, turn) {
        // Sorts vertices into an array based on whether or not
        // they form a right or left turn with line ab
        v = []

        for (var i in vertices) {
            if (turn(a, b, vertices[i])) { v.push(vertices[i]) }
        }
        
        return v
    },
    
    xCompare : function(a, b) {
        if (a.x < b.x) { return -1 }
        if (a.x > b.x) { return 1 }
        return 0
    }
}

var giftWrap = {
    execute : function(vertices, two) {
        // Clear the previous hull, if it exists
        clearHull(two)
        
        var hull = []
        var hullPoint = findLeftmostPoint(vertices)
        var endpoint = null
        
        function point_step(i) {
            // Executes the loop iteration fixed from a known point on the convex hull
            hull[i] = hullPoint
            
            // Base case - we have wrapped all the way around
            if (endpoint === hull[0]) { return }
            
            endpoint = vertices[0]
            
            // Create the reference edge
            edge = createEdge(two, refEdgeColor, hull[i], endpoint)
            
            two.bind('update', function(frameCount) {
                if (edge.scale < 0.9999) {
                    var t = (1 - edge.scale) * getSpeed();
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
            edge2 = createEdge(two, checkEdgeColor, hull[i], vertex)
            
            two.bind('update', function(frameCount) {
                if (edge2.scale < 0.9999) {
                    var t = (1 - edge2.scale) * getSpeed();
                    edge2.scale += t;
                } else {
                    two.unbind('update')
                    if ((endpoint === hullPoint) || (leftTurn(hullPoint, endpoint, vertex))) {
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
    }
}
