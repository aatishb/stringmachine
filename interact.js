var interact = function() {

    let lineWithCornerGrabbed = 0;
    let cornerGrabbed = false;

    function selectNearbyCorner(myPoint){
        lineWithCornerGrabbed = 0;

        for (let myLine of geom.lines) {
            if (myLine.start.dist(myPoint) < 15)
            {
                lineWithCornerGrabbed = {
                    line: myLine,
                    start: myLine.start
                };
            }
            else if (myLine.end.dist(myPoint) < 15)
            {
                lineWithCornerGrabbed = {
                    line: myLine,
                    end: myLine.end
                };
            }
        }

        if (lineWithCornerGrabbed != 0 && ui.getAdjustMode())
        {
            cornerGrabbed = true;
        }
    }

    function updateLine(myPos){
        geom.deleteIntersections(lineWithCornerGrabbed.line);

        if (lineWithCornerGrabbed.start)
        {
            lineWithCornerGrabbed.line.start = myPos;
        }
        else
        {
            lineWithCornerGrabbed.line.end = myPos;
        }

        geom.computeIntersections(lineWithCornerGrabbed.line);

    }

    function isCornerGrabbed(){
        return cornerGrabbed;
    }

    function setCornerGrabbed(myVal){
        cornerGrabbed = myVal;
    }

    return {
        selectNearbyCorner: selectNearbyCorner,
        isCornerGrabbed: isCornerGrabbed,
        setCornerGrabbed: setCornerGrabbed,
        updateLine: updateLine
    };

}();
