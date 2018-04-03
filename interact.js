var interact = function() {

    let lineWithCornerGrabbed = 0;
    let cornerGrabbed = false;

    function selectNearbyCorner(myPoint){
        lineWithCornerGrabbed = 0;

        for(let myLine of geom.lines){
            let nearestPointInfo = myLine.distanceToCorner(myPoint);

            if(nearestPointInfo.dist < ui.getSpacing()/2)
            {
                if(nearestPointInfo.isCorner == 'start'){
                    lineWithCornerGrabbed = {
                        line: myLine,
                        whichCorner: 'start'
                    };
                }
                else if (nearestPointInfo.isCorner == 'end'){
                    lineWithCornerGrabbed = {
                        line: myLine,
                        whichCorner: 'end'
                    };
                }
            }
        }

        if (lineWithCornerGrabbed != 0 && ui.getAdjustMode())
        {
            cornerGrabbed = true;
        }
    }

    function updateLine(myPos){
        geom.deleteIntersections(lineWithCornerGrabbed.line);

        if (lineWithCornerGrabbed.whichCorner == 'start')
        {
            lineWithCornerGrabbed.line.start = myPos;
        }
        else if(lineWithCornerGrabbed.whichCorner == 'end')
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
