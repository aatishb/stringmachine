let startPos, endPos, currentPos;
let touchIsMoving = false;
let touchJustEnded = true;

let mode = 'welcome';
let debugMode = false;
let adjustMode = false;
let cornerSelected = false;
let closestLine = 0;


let start,end;

let pinnedNodes = [];
let backgroundGrid;

function setup() {
    createCanvas(windowWidth, windowHeight);
    stroke(200);
    strokeWeight(3);
    fill('red');

    let w = width;
    let h = height;

    ui.setSpacing(w,h);

    ui.welcomeScreen(w,h);

    textSize(0.66 * ui.spacing);

    ui.makeButtons();
    ui.initGrid(w,h);
}

function draw() {

    if (mode == 'input') {
        inputMode(); // inputs the mesh
    }

    else if (mode == 'setup'){
        setupMode(); // pin the nodes
    }

    else if (mode == 'simulate'){
        background(51);
        simulate(); // simulate physics
    }

}

function inputMode() {

    if (touchIsMoving || touchJustEnded || cornerSelected)
    {

        background(51);
        image(backgroundGrid, 0, 0, width, height);
        stroke(200);


        if (touchIsMoving) {
            if (!cornerSelected) {
                line(startPos.x, startPos.y, mouseX, mouseY); // draw current line
            }
        }

        geom.drawLines();

        // draw intersections
        noStroke();
        fill('red');
        geom.drawIntersections();

        if (adjustMode) {
            noStroke();
            fill('lightblue');
            geom.drawCorners();
        }

        touchJustEnded = false;
    }
}

function presetup() {

    if(mode == 'input'){
        geom.subdivideLines();
        geom.pruneLines();
        phys.createMesh();

        mode = 'setup';
    }
}


function setupMode() {

    if(touchJustEnded){
        background(51);
        image(backgroundGrid, 0, 0, width, height);
        stroke(200);

        geom.drawLines();

        noStroke();

        // draw intersections
        fill('salmon');
        phys.drawNodes();

        // draw pinned nodes
        fill('dodgerblue');
        phys.drawPinnedNodes();

        fill('red');
        ui.pinText();

        touchJustEnded = false;
    }

}

function initializePhysics(){

    if(mode == 'setup'){

        phys.initializePhysics();
        stroke(200); //set stroke for the physics simulation
        ui.makeSliders();

        mode = 'simulate';
    }
}

function simulate(){

    phys.addForces();
    phys.update();
    phys.drawStrings();

}

function touchStarted() {

    if(mode == 'welcome'){
        mode = 'input';
    }

    else if (mode == 'input')
    {
        startPos = ui.snapToGrid(createVector(mouseX, mouseY));
        findClosestLine(startPos);

    }

    return false;
}


function touchMoved() {

    if (mode == 'input') {
        if (cornerSelected) {
            currentPos = ui.snapToGrid(createVector(mouseX, mouseY));

            geom.deleteIntersections(closestLine.line);

            if (closestLine.start) {
                closestLine.line.start = currentPos;
            }
            else
            {
                closestLine.line.end = currentPos;
            }

            geom.computeIntersections(closestLine.line);

        } else
        {
            if (!touchIsMoving) {
                currentPos = ui.snapToGrid(createVector(mouseX, mouseY));
                if (startPos.dist(currentPos) < 10) {
                    touchIsMoving = true;
                }
            }
        }
    }

    return false;
}

function touchEnded() {

    if (mode == 'input') {
        if (cornerSelected) {
            cornerSelected = false;
        } else {
            endPos = ui.snapToGrid(createVector(mouseX, mouseY));
            if (touchIsMoving) {
                let newLine = new geom.makeNewLine(startPos, endPos);
                // maybe I shouldn't do this?
                // computeIntersections computes the intersections but also
                // detects if the new line is unique
                if (geom.computeIntersections(newLine) && newLine.lineLength() > 0.1) {
                    geom.lines.push(newLine);
                }
                touchIsMoving = false;
            }
        }
        touchJustEnded = true;
    }

    else if(mode == 'setup')
    {

        for (let myNode of phys.nodes)
        {
            let mousePos = createVector(mouseX, mouseY);
            let nodePos = createVector(myNode[0],myNode[1]);

            if (nodePos.dist(mousePos) < 15)
            {
                if(!pinnedNodes.containsArray(myNode)){
                    pinnedNodes.push(myNode);
                }
                else{
                    let index = pinnedNodes.indexOfPoint(myNode);
                    pinnedNodes.splice(index,1);
                }
            }
        }
        touchJustEnded = true;
    }

    return false;
}


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

    if (closestLine != 0 && adjustMode) {
        cornerSelected = true;
    }
}
