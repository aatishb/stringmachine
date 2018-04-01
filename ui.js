var ui = function() {

    let button1,button2,button3,button4;
    let stiffnessSlider;
    let spacing;
    let myFontSize;
    let adjustMode = false;

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

    function setSpacing(w,h){
        spacing = max(w / 30, h / 30);
        myFontSize = str(0.75 * spacing) + 'px';
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
        text('Click on the nodes you want to pin. Press simulate when done.', 10, 3 * spacing);
        text('Your structure has ' + geom.lines.length + ' springs (lines) and ' + phys.nodes.length + ' particles (endpoints)', 10, height - spacing);
    }

    function makeButtons() {
        button1 = createButton('undo');
        button1.position(19, 19);
        button1.size(4 * spacing, 2 * spacing);
        button1.mousePressed(geom.deletePreviousLine);
        button1.style('font-size', myFontSize);

        button2 = createButton('adjust lines');
        button2.position(19 + 5 * spacing, 19);
        button2.size(4 * spacing, 2 * spacing);
        button2.mousePressed(toggleAdjustMode);
        button2.style('font-size', myFontSize);

        button3 = createButton('pin it up');
        button3.position(19 + 5 * 2 * spacing, 19);
        button3.size(4 * spacing, 2 * spacing);
        button3.mousePressed(presetup);
        button3.style('font-size', myFontSize);

        button4 = createButton('simulate');
        button4.position(19 + 5 * 3 * spacing, 19);
        button4.size(4 * spacing, 2 * spacing);
        button4.mousePressed(initializePhysics);
        button4.style('font-size', myFontSize);
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

        // implement this later
        // if there's a line nearby, snap to that

        // else snap to the grid
        let newX = round(myVec.x / spacing) * spacing;
        let newY = round(myVec.y / spacing) * spacing;
        return createVector(newX, newY);
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
        getAdjustMode: getAdjustMode
    };

}();