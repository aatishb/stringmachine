var ui = function() {

    let button1,button2,button3,button4;
    let stiffnessSlider;
    let spacing;
    let myFontSize;
    let smallButtonSize;
    let bigButtonSize;
    let adjustMode = false;
    let backgroundGrid;

    function getAdjustMode() {
        return adjustMode;
    }

    function getSpacing() {
        return spacing;
    }

    function toggleAdjustMode() {
        if(mode=='input')
        {
            adjustMode = !adjustMode;
        }
    }

    function clearAll() {
        geom.deleteAll();
        phys.deleteAll();
    }

    function setSpacing(w,h){
        spacing = max(w / 30, h / 30);
        myFontSize = str(0.75 * spacing) + 'px';
        smallButtonSize = str(1 * spacing) + 'px';
        bigButtonSize = str(2 * spacing) + 'px';
    }

    function welcomeScreen(w,h){
        noStroke();
        background(51);
        textAlign(CENTER,CENTER);
        textSize(3*spacing);
        text('String Machine',w/2,h/2-2*spacing);
        textSize(3*spacing);
        text('Click to start',w/2,h/2+2*spacing);

        textAlign(LEFT);
    }

    function pinText(){
        textSize(0.6*spacing);
        textAlign(CENTER);
        text('Click on the nodes you want to pin. Press play when done.', width/2, 2.5 * spacing);
        text('Your structure has ' + geom.lines.length + ' springs (lines) and ' + phys.nodes.length + ' particles (endpoints)', width/2, height - spacing);
    }

    function makeButtons() {

        let darkRed = color(199, 0, 57)

        let middleButtons = [];

        let undo = createSpan('');
        undo.html('<i class="fas fa-undo"></i>');
        undo.mousePressed(geom.deletePreviousLine);
        undo.style('font-size', smallButtonSize);
        undo.style('color', darkRed);
        middleButtons.push(undo);

        let move = createSpan('');
        move.html('<i class="fas fa-arrows-alt"></i>')
        move.mousePressed(toggleAdjustMode);
        move.style('font-size', smallButtonSize);
        move.style('color', darkRed);
        middleButtons.push(move);

        let clearScreen = createSpan('');
        clearScreen.html('<i class="fas fa-trash-alt"></i>')
        clearScreen.mousePressed(clearAll);
        clearScreen.style('font-size', smallButtonSize);
        clearScreen.style('color', darkRed);
        middleButtons.push(clearScreen);

        let numMiddlebuttons = middleButtons.length;
        let count = 1;
        for(let myButton of middleButtons){
            let xPos = map(count,0,numMiddlebuttons+1,20+2*spacing,width-20-2*spacing)
            myButton.position(xPos,20);
            count++;
        }


        let next = createSpan('');
        next.html('<i class="far fa-caret-square-right"></i>')
        next.mousePressed(gotoNext);
        next.style('font-size', bigButtonSize);
        next.style('color', darkRed);
        next.position(width-20-2*spacing,20);


        /*
        button3 = createSpan('pinitup');
        button3.position(19 + 5 * 2 * spacing, 19);
        button3.size(4 * spacing, 2 * spacing);
        button3.mousePressed(presetup);
        button3.style('font-size', myFontSize);

        button4 = createSpan('simulate');
        button4.position(19 + 5 * 3 * spacing, 19);
        button4.size(4 * spacing, 2 * spacing);
        button4.mousePressed(initializePhysics);
        button4.style('font-size', myFontSize);
        */

    }


    function makeSliders(){
        // create sliders
        stiffnessSlider = createSlider(0, 255, 100);
        stiffnessSlider.position(spacing,height-3*spacing);
        stiffnessSlider.size(3*spacing,spacing);
        stiffnessSlider.changed(phys.changeStiffness);
    }

    function snapToGrid(myVec) {

        // if there's an intersection nearby, snap to that
        for (let myInt of geom.intersections)
        {
            if (myVec.dist(myInt.point) <= 0.5*spacing)
            {
                return myInt.point;
            }
        }


        // if there's a line nearby, snap to that
        for (let myLine of geom.lines)
        {
            let myLineInfo = myLine.nearestPointOnLine(myVec);
            if(!myLineInfo.isCorner && myLineInfo.dist <= 0.5*spacing){

                // check if the nearest grid point on the line
                let nearX = round(myVec.x / spacing) * spacing;
                let nearY = round(myVec.y / spacing) * spacing;
                let nearbyGridPoint = createVector(nearX,nearY);
                // if yes, snap to that
                if(myLine.containsPoint(nearbyGridPoint)){
                    return nearbyGridPoint;
                }
                // otherwise snap to the line
                else{
                    return myLineInfo.point;
                }
            }
        }

        // else snap to the grid
        let nearX = round(myVec.x / spacing) * spacing;
        let nearY = round(myVec.y / spacing) * spacing;
        return createVector(nearX, nearY);
    }

    function initGrid(w,h) {

        backgroundGrid = createGraphics(w, h);
        let d = window.pixelDensity();
        backgroundGrid.scale(1/d);
        backgroundGrid.noStroke();
        backgroundGrid.fill(200, 50);
        for (var x = 0; x <= width; x += spacing) {
            for (var y = 0; y <= height; y += spacing) {
                backgroundGrid.ellipse(x, y, 3);
            }
        }
    }

    function drawGrid(w,h){
        image(backgroundGrid, 0, 0, w, h);
    }

    return {
        getSpacing: getSpacing,
        setSpacing: setSpacing,
        makeButtons: makeButtons,
        makeSliders: makeSliders,
        welcomeScreen: welcomeScreen,
        snapToGrid: snapToGrid,
        initGrid: initGrid,
        pinText: pinText,
        toggleAdjustMode: toggleAdjustMode,
        getAdjustMode: getAdjustMode,
        drawGrid: drawGrid
    };

}();