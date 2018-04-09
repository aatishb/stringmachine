var ui = function() {

    let button1,button2,button3,button4;
    let stiffnessSlider;
    let spacing;
    let myFontSize;
    let smallButtonSize;
    let bigButtonSize;
    let adjustMode = false;
    let backgroundGrid;
    let buttons = [];
    let hideDuringInput = [];
    let hideDuringSetup = [];
    let hideDuringSimulate = [];

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
        ui.hideButtonsDuringInput();
        geom.deleteAll();
        phys.deleteAll();
        mode = 'input';
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
        textSize(2*spacing);
        text('String Machine\n\nClick to\nStart Drawing',w/2,h/2);

        textAlign(LEFT);
    }

    function pinText(){
        textSize(0.6*spacing);
        textAlign(CENTER);
        text('Click on the nodes you want to pin. Press play when done.', width/2, 4 * spacing);
        text('Your structure has ' + geom.lines.length + ' springs (edges) and ' + phys.nodes.length + ' masses (vertices)', width/2, height - spacing);
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
        buttons.push(undo);
        //hideDuringInput.push(undo);
        hideDuringSetup.push(undo);
        hideDuringSimulate.push(undo);

        let move = createSpan('');
        move.html('<i class="fas fa-arrows-alt"></i>')
        move.mousePressed(toggleAdjustMode);
        move.style('font-size', smallButtonSize);
        move.style('color', darkRed);
        middleButtons.push(move);
        buttons.push(move);
        //hideDuringInput.push(move);
        hideDuringSetup.push(move);
        hideDuringSimulate.push(move);

        let clearScreen = createSpan('');
        clearScreen.html('<i class="fas fa-trash-alt"></i>')
        clearScreen.mousePressed(clearAll);
        clearScreen.style('font-size', smallButtonSize);
        clearScreen.style('color', darkRed);
        middleButtons.push(clearScreen);
        buttons.push(clearScreen);
        //hideDuringInput.push(clearScreen);
        //hideDuringSetup.push(clearScreen);
        //hideDuringSimulate.push(clearScreen);

        let numMiddlebuttons = middleButtons.length;
        let count = 1;
        for(let myButton of middleButtons){
            let xPos = map(count,0,numMiddlebuttons+1,20+2*spacing,width-20-2*spacing)
            myButton.position(xPos,20+0.5*spacing);
            count++;
        }

        let prev = createSpan('');
        prev.html('<i class="far fa-caret-square-left"></i>')
        prev.mousePressed(gotoPrev);
        prev.style('font-size', bigButtonSize);
        prev.style('color', darkRed);
        prev.position(20,20);
        buttons.push(prev);
        hideDuringInput.push(prev);
        //hideDuringSetup.push(prev);
        //hideDuringSimulate.push(prev);

        let next = createSpan('');
        next.html('<i class="far fa-caret-square-right"></i>')
        next.mousePressed(gotoNext);
        next.style('font-size', bigButtonSize);
        next.style('color', darkRed);
        next.position(width-20-2*spacing,20);
        buttons.push(next);
        //hideDuringInput.push(next);
        //hideDuringSetup.push(next);
        hideDuringSimulate.push(next);

    }

    function hideButtonsDuringInput(){

        for (var button of buttons){
            button.style('display','block');
        }

        for (var button of hideDuringInput){
            button.style('display','none');
        }


    }

    function hideButtonsDuringSetup(){

        for (var button of buttons){
            button.style('display','block');
        }

        for (var button of hideDuringSetup){
            button.style('display','none');
        }


    }

    function hideButtonsDuringSimulate(){

        for (var button of buttons){
            button.style('display','block');
        }

        for (var button of hideDuringSimulate){
            button.style('display','none');
        }


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
        drawGrid: drawGrid,
        hideButtonsDuringInput: hideButtonsDuringInput,
        hideButtonsDuringSetup: hideButtonsDuringSetup,
        hideButtonsDuringSimulate: hideButtonsDuringSimulate
    };

}();