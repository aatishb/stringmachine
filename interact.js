var interact = function() {

    let closestLine = 0;
    let cornerSelected = false;

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
            cornerSelected = true;
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

    function isCornerSelected(){
        return cornerSelected;
    }

    function setCornerSelected(myVal){
        cornerSelected = myVal;
    }

    return {
        getClosestLine: getClosestLine,
        findClosestLine: findClosestLine,
        isCornerSelected: isCornerSelected,
        setCornerSelected: setCornerSelected,
        updateLine: updateLine
    };

}();
