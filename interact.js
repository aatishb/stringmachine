var interact = function() {

    let closestLine = 0;
    let cornerGrabbed = false;

    function findClosestLine(myPoint){
        closestLine = 0;

        for (let myLine of geom.lines) {
            if (myLine.start.dist(myPoint) < 15)
            {
                closestLine = {
                    line: myLine,
                    start: myLine.start
                };
            }
            else if (myLine.end.dist(myPoint) < 15)
            {
                closestLine = {
                    line: myLine,
                    end: myLine.end
                };
            }
        }

        if (closestLine != 0 && ui.getAdjustMode())
        {
            cornerGrabbed = true;
        }
    }

    function updateLine(myPos){
        geom.deleteIntersections(closestLine.line);

        if (closestLine.start)
        {
            closestLine.line.start = myPos;
        }
        else
        {
            closestLine.line.end = myPos;
        }

        geom.computeIntersections(closestLine.line);

    }

    function getClosestLine(){
        return closestLine;
    }

    function isCornerGrabbed(){
        return cornerGrabbed;
    }

    function setCornerGrabbed(myVal){
        cornerGrabbed = myVal;
    }

    return {
        getClosestLine: getClosestLine,
        findClosestLine: findClosestLine,
        isCornerGrabbed: isCornerGrabbed,
        setCornerGrabbed: setCornerGrabbed,
        updateLine: updateLine
    };

}();
