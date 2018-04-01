var geom = function() {

    // public variables
    let lines = [];
    let intersections = [];

    function drawLines(){
        // draw lines
        for (let myLine of lines)
        {
            myLine.drawLine();
        }
    }

    function drawIntersections(){
        for (let myIntersection of geom.intersections)
        {
            ellipse(myIntersection.point.x, myIntersection.point.y, 10);
        }
    }

    // public function
    // computes intersections between a new line and all existing lines
    // returns false if the line is exactly on top of another line
    function computeIntersections(newLine) {

        if(newLine.lineLength() <= 0.1)
        {
            return false;
        }

        let lineIsUnique = true;

        for (let myLine of lines)
        {
            if (myLine != newLine)
            {
                if (intersectLines(newLine, myLine) && !hasSameCoordinates(myLine, newLine))
                {
                    let poi = pointOfIntersection(newLine, myLine);
                    if (poi.length > 0)
                    {
                        for (let myPoint of poi)
                        {
                            let isDuplicate = false;
                            let myIndex = -1;
                            for (let myInt of intersections)
                            {
                                if (myPoint.dist(myInt.point) < 0.1)
                                {
                                    isDuplicate = true;
                                    myIndex = intersections.indexOf(myInt);
                                }
                            }
                            if (!isDuplicate)
                            {
                                intersections.push({
                                    point: myPoint,
                                    lines: [newLine, myLine]
                                });
                            }
                            else
                            {
                                // if this intersection is not new
                                // add the new line to its members
                                if (intersections[myIndex].lines.includes(newLine))
                                {
                                    intersections[myIndex].lines.push(newLine);
                                }
                            }
                        }
                    }
                }


                // if we have different lines with the same coordinates
                // the new line is not unique
                if (hasSameCoordinates(myLine, newLine))
                {
                    console.log('Line is not unique!');
                    lineIsUnique = false;
                }
            }
        }

        return lineIsUnique;

    }

    // public function
    function deleteIntersections(myLine) {

        let index = [];
        for (let myIntersection of intersections)
        {
            if (myIntersection.lines.includes(myLine))
            {
                index.push(intersections.indexOf(myIntersection));
            }
        }

        for (var i = index.length - 1; i >= 0; i--)
        {
            if (intersections[index[i]].lines.length > 2)
            {
                deleteElement(intersections[index[i]].lines,myLine);
            }
            else
            {
                intersections.splice(index[i], 1);
            }
        }
    }

    function deleteElement(array, value){
        for (let i = array.length - 1; i >= 0; i--)
        {
            if (array[i] == value)
            {
                array.splice(i, 1);
            }
        }
    }


    // public function
    function intersectLines(line1, line2) {
        return intersect(line1.start, line1.end, line2.start, line2.end);
    }

    // from https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
    // Returns true if line segments 'p1q1' and 'p2q2' intersect.
    function intersect(p1, q1, p2, q2) {
        // Find the four orientations needed for general and
        // special cases
        let o1 = orientation(p1, q1, p2);
        let o2 = orientation(p1, q1, q2);
        let o3 = orientation(p2, q2, p1);
        let o4 = orientation(p2, q2, q1);

        // General case
        if (o1 != o2 && o3 != o4)
        {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        else if (o1 == 0 && onSegment(p1, p2, q1))
        {
            return true;
        }

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        else if (o2 == 0 && onSegment(p1, q2, q1))
        {
            return true;
        }

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        else if (o3 == 0 && onSegment(p2, p1, q2))
        {
            return true;
        }

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        else if (o4 == 0 && onSegment(p2, q1, q2))
        {
            return true;
        }
        else
        {
            return false;
        } // Doesn't fall in any of the above cases
    }

    // from https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are colinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    function orientation(p, q, r) {
        // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
        // for details of below formula.
        let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

        if (val == 0)
        {
            return 0;
        } // colinear
        else if (val > 0)
        {
            return 1;
        } // clockwise
        else {
            return 2;
        } // counterclockwise

    }

    // from https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
    // determines whether two line segments intersect
    // Given three colinear points p, q, r, the function checks if
    // point q lies on line segment 'pr'
    function onSegment(p, q, r) {

        if (abs(p.dist(q) + q.dist(r) - p.dist(r)) < 0.1)
        {
            return true;
        }
        else {
            return false;
        }

    }

    // finds points of intersection of two line segments
    // math from http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
    function pointOfIntersection(line1, line2) {
        let x1 = line1.start.x;
        let y1 = line1.start.y;
        let x2 = line1.end.x;
        let y2 = line1.end.y;
        let x3 = line2.start.x;
        let y3 = line2.start.y;
        let x4 = line2.end.x;
        let y4 = line2.end.y;

        let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        let numerator1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        let numerator2 = (x2 - x1) * (y1 - y3) - (y2 - y3) * (x1 - x3);

        let pointsOfIntersection = [];
        let cutoff = 0.1;

        if (abs(denominator) > cutoff)
        {
            let u = numerator1 / denominator;
            let x = x1 + u * (x2 - x1);
            let y = y1 + u * (y2 - y1);
            pointsOfIntersection.push(createVector(x, y));
        }
        else
        { // lines are parallel
            if (abs(numerator1) < cutoff || abs(numerator2) < cutoff)
            { // lines are overlapping
                if (lineContainsPoint(line1, line2.start))
                { // lines overlap
                    pointsOfIntersection.push(createVector(line2.start.x, line2.start.y));
                }
                if (lineContainsPoint(line1, line2.end)) { // lines overlap
                    pointsOfIntersection.push(createVector(line2.end.x, line2.end.y));
                }
                if (lineContainsPoint(line2, line1.start)) { // lines overlap
                    pointsOfIntersection.push(createVector(line1.start.x, line1.start.y));
                }
                if (lineContainsPoint(line2, line1.end)) { // lines overlap
                    pointsOfIntersection.push(createVector(line1.end.x, line1.end.y));
                }
            }
        }

        return pointsOfIntersection;
    }

    function drawCorners() {
        for (let myLine of lines)
        {
            ellipse(myLine.start.x, myLine.start.y, 10);
            ellipse(myLine.end.x, myLine.end.y, 10);
        }
    }

    // public function
    // line object
    var makeNewLine = function(start, end) {

        this.start = start;
        this.end = end;

        this.drawLine = function() {
            line(this.start.x, this.start.y, this.end.x, this.end.y);
        };

        this.lineLength = function() {
            let a = this.start;
            let b = this.end;
            return a.dist(b);
        };
        this.whoami = function() {
            console.log('x1: ' + round(this.start.x) + ' y1: ' + round(this.start.y) + 'x2: ' + round(this.end.x) + ' y2: ' + round(this.end.y));
        };
    };


    // checks if given line contains a point
    function lineContainsPoint(myLine, myPoint) {

        let a = myLine.start;
        let b = myLine.end;
        let c = myPoint;

        if (abs(a.dist(c) + c.dist(b) - a.dist(b)) < 0.1)
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    // public function
    function subdivideLines() {
        for (let myLine of lines.slice())
        {
            let pointsOnLine = [];
            let start = myLine.start;
            let end = myLine.end;

            for (let myIntersection of intersections)
            {
                let myPoint = myIntersection.point;
                if(lineContainsPoint(myLine,myPoint) &&
                    myPoint.dist(start) > 0.1 &&
                    myPoint.dist(end) > 0.1)
                {
                    pointsOnLine.push(myPoint);
                }
            }

            if(pointsOnLine.length>0)
            {
                // sort these points along with the start and end point of the line
                if(abs(start.x-end.x) > 0.1)
                {
                    if(start.x < end.x)
                    {
                        // sort points by x value ascending
                        pointsOnLine.sort(function(a,b) {return a.x-b.x;});
                    }
                    else
                    {
                        // sort points by x value descending
                        pointsOnLine.sort(function(a,b) {return b.x-a.x;});
                    }
                }
                else if(abs(start.y - end.y)>0.1)
                {
                    if(start.y < end.y)
                    {
                        // sort points by y value ascending
                        pointsOnLine.sort(function(a,b) {return a.y-b.y;});
                    }
                    else
                    {
                        // sort points by y value descending
                        pointsOnLine.sort(function(a,b) {return b.y-a.y;});
                    }
                }

                deleteElement(lines,myLine);
                lines.push(new makeNewLine(myLine.start, pointsOnLine[0]));

                for(let i=0; i<pointsOnLine.length-1; i++)
                {
                    lines.push(new makeNewLine(pointsOnLine[i], pointsOnLine[i+1]));
                }

                lines.push(new makeNewLine(pointsOnLine[pointsOnLine.length-1],myLine.end));
                //console.log('line start: '+myLine.start+' line end: '+myLine.end);
                //console.log('points on line: '+pointsOnLine);
            }
        }

    }

    // public function
    function pruneLines(){
        for (let myLine of lines.slice())
        {
            let countIntersections = 0;
            for (let myIntersection of intersections)
            {
                if (myIntersection.point.dist(myLine.start) < 0.1 ||
                myIntersection.point.dist(myLine.end) < 0.1)
                {
                    countIntersections++;
                }
            }
            if(countIntersections < 2 && myLine.lineLength() < 0.9*ui.getSpacing())
            {
                //console.log("deleting line");
                deleteElement(lines,myLine);
            }
        //console.log('number of intersections: ' + countIntersections);
        }
    }

    function deletePreviousLine() {
        if(mode == 'input'){
            var myLine = geom.lines.pop();
            geom.deleteIntersections(myLine);
        }
    }


    function hasSameCoordinates(line1, line2) {
        if (line1.start.x == line2.start.x &&
            line1.start.y == line2.start.y &&
            line1.end.x == line2.end.x &&
            line1.end.y == line2.end.y)
        {
            return true;
        }
        else if (line1.start.x == line2.end.x &&
            line1.start.y == line2.end.y &&
            line1.end.x == line2.start.x &&
            line1.end.y == line2.start.y)
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    return {
        lines: lines,
        intersections: intersections,
        computeIntersections: computeIntersections,
        deleteIntersections: deleteIntersections,
        makeNewLine: makeNewLine,
        subdivideLines: subdivideLines,
        pruneLines: pruneLines,
        deletePreviousLine: deletePreviousLine,
        drawLines: drawLines,
        drawIntersections: drawIntersections,
        drawCorners: drawCorners
    };
}();
