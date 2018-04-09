let startPos, endPos, currentPos;
let touchIsMoving = false;
let touchWasClicked = true;
let touchIsPressed;
let mode = 'welcome';

function setup() {
    createCanvas(windowWidth, windowHeight);
    stroke(200);
    strokeWeight(3);
    fill('red');

    let w = width;
    let h = height;

    ui.setSpacing(w,h);
    ui.welcomeScreen(w,h);
    textSize(0.66 * ui.getSpacing());
    ui.makeButtons();
    ui.initGrid(w,h);
}

function draw() {

    if (mode == 'input')
    {
        inputMode.draw(); // inputs the mesh
    }

    else if (mode == 'setup')
    {
        setupMode.draw(); // pin the nodes
    }

    else if (mode == 'simulate')
    {
        simulateMode.draw(); // simulate physics
    }

}

var inputMode = function() {

    function init(){
        if(mode != 'input'){
            mode = 'input';
        }
    }

    function draw(){
        // to save CPU, only redraw when there is a touch movement,
        // a recent click, or a corner is grabbed
        if (touchIsMoving || touchWasClicked || interact.isCornerGrabbed())
        {

            background(51);
            ui.drawGrid();
            stroke(200);

            // if touch is moving and nothing is grabbed
            // it means we should draw a new line
            if (touchIsMoving && !interact.isCornerGrabbed())
            {
                let roundStartPos = ui.snapToGrid(startPos);
                line(roundStartPos.x, roundStartPos.y, mouseX, mouseY);
            }

            // draw existing lines
            geom.drawLines();

            // draw intersections
            noStroke();
            fill('red');
            geom.drawIntersections();

            // adjust mode highlights corners
            if (ui.getAdjustMode())
            {
                noStroke();
                fill('lightblue');
                geom.drawCorners();
            }

            // set this back to false so that in the absence of touch movement
            // the draw loop is not being refreshsed
            touchWasClicked = false;
        }
    }

    return {
        init: init,
        draw: draw
    };
}();

var setupMode = function() {

    // the 'pin it up' button triggers this function
    // this simplifies the graph structure to prepare for the physics simulation
    // runs only one

    function init(){
        if (mode !='setup'){
            // only accept input coming from input mode
            geom.subdivideLines();
            geom.pruneLines();
            phys.deleteAll()
            phys.createMesh();

            mode = 'setup'; // switch to setup mode
        }
    }

    // presetup leads us here
    // runs in draw loop in setup mode
    // this redraws the screen on touch click

    function draw(){
        if(touchWasClicked)
        {
            background(51);
            ui.drawGrid();
            stroke(200);

            geom.drawLines();
            noStroke();

            // draw intersections
            fill('salmon');
            phys.drawNodes();

            // draw pinned nodes
            fill('dodgerblue');
            phys.drawPinnedNodes();

            // print text instructions
            fill('red');
            ui.pinText();

            touchWasClicked = false;
        }
    }

    return {
        init: init,
        draw: draw
    };

}();

function gotoNext(){
    if(mode == 'input'){
        setupMode.init();
    }
    else if(mode=='setup'){
        simulateMode.init();
    }
}

function gotoPrev(){
    if(mode == 'simulate'){
        setupMode.init();
    }
    else if(mode=='setup'){
        inputMode.init();
    }
}


var simulateMode = function(){

    // the simulate button leads here
    // this is just a launcher for new UI elements
    // and leads to the real initalize physics function
    // this runs only once

    function init(){

        if(mode != 'simulate')
        {
            phys.initializePhysics();
            stroke(200); //set stroke for the physics simulation
            //ui.makeSliders();

            mode = 'simulate'; // switch to simulate mode
        }
    }

    // initialize leads here
    // runs in draw loop in simulate mode
    // updates physics world and redraws

    function draw(){
        background(51);
        phys.addForces();
        phys.update();
        stroke(200);
        phys.drawStrings();

        if(touchIsPressed)
        {
            let mousePos = createVector(mouseX, mouseY);
            phys.stickToMouse(mousePos);
            noStroke();
            fill(30,144,255,100);
            ellipse(mousePos.x,mousePos.y,ui.getSpacing()/2);
        }
    }

    return {
        init: init,
        draw: draw
    };

}();

function touchStarted() {

    if (mode == 'input')
    {
        // find closest line and vertex to the mouse
        startPos = createVector(mouseX, mouseY);
        interact.selectNearbyCorner(startPos);
    }

    touchIsPressed = true;

    return false;
}


function touchMoved() {
    if (mode == 'input')
    {
        currentPos = createVector(mouseX, mouseY);

        if (interact.isCornerGrabbed())
        {
            interact.updateLine(ui.snapToGrid(currentPos));
        }
        else if (startPos.dist(currentPos) > 10)
        {
            touchIsMoving = true;
        }
    }

    return false;
}

function touchEnded() {

    // hack to get around need for initial touch input
    if(mode == 'welcome')
    {
        inputMode.init();
    }

    else if (mode == 'input')
    {
        if (interact.isCornerGrabbed())
        {
            interact.setCornerGrabbed(false);
        }
        else
        {
            endPos = createVector(mouseX, mouseY);
            if (touchIsMoving) {
                let newLine = new geom.makeNewLine(ui.snapToGrid(startPos), ui.snapToGrid(endPos));
                // maybe I shouldn't do this?
                // computeIntersections computes the intersections but also
                // detects if the new line is unique
                if (geom.computeIntersections(newLine)) {
                    geom.lines.push(newLine);
                }
                //console.log('lines: '+geom.lines.length+' intersections: '+geom.intersections.length)
                touchIsMoving = false;
            }
        }
        touchWasClicked = true;
    }

    else if(mode == 'setup')
    {
        let mousePos = createVector(mouseX, mouseY);
        phys.updateNodes(mousePos);
        touchWasClicked = true;
    }

    touchIsPressed = false;

    return false;
}