let startPos, endPos, currentPos;
let touchIsMoving = false;
let touchJustEnded = true;
let cornerSelected = false;
let closestLine;
let adjustMode = false;

let spacing;
let mode = 'welcome';
let debugMode = false;
let myFontSize;

let pinnedNodes = [];
let backgroundGrid;
let start,end;

function setup() {
    createCanvas(windowWidth, windowHeight);
    stroke(200);
    strokeWeight(3);
    fill('red');

    let w = width;
    let h = height;


    backgroundGrid = createGraphics(w, h);
    let d = window.pixelDensity();
    backgroundGrid.scale(1/d);
    spacing = max(w / 30, h / 30);

    welcomeScreen();

    textSize(0.66 * spacing);
    myFontSize = str(0.75 * spacing) + 'px';

    ui.makeButtons();
    initGrid();
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

    //let fps = frameRate();
    //console.log("FPS: " + fps.toFixed(2));

}

function inputMode() {

    if (touchIsMoving || touchJustEnded || cornerSelected)
    {
        if(debugMode){start = millis();}
        if (debugMode) {
            console.log('line count: ' + geom.lines.length);
            console.log('intersection count: ' + geom.intersections.length);
        }

        background(51);
        image(backgroundGrid, 0, 0, width, height);
        stroke(200);


        if (touchIsMoving) {
            // draw current line
            if (!cornerSelected) {
                line(startPos.x, startPos.y, mouseX, mouseY);
            }
        }

        // draw lines
        for (let myLine of geom.lines) {
            myLine.drawLine();
        }

        // draw intersections
        noStroke();
        fill('red');
        for (let myIntersection of geom.intersections) {
            ellipse(myIntersection.point.x, myIntersection.point.y, 10);
        }

        if (adjustMode) {
            noStroke();
            fill('lightblue');
            for (let myLine of geom.lines) {
                myLine.drawCorners();
            }
        }

        touchJustEnded = false;
        if(debugMode){
            end = millis();
            var elapsed = end - start;
            console.log('inputmode() took: ' + elapsed.toFixed(2) + 'ms.');
        }
    }
}

function presetup() {

    if(mode == 'input'){
        if(debugMode){start = millis();}

        geom.subdivideLines();
        if(debugMode){
            end = millis();
            var elapsed = end - start;
            console.log("geom.subdivideLines() took " + elapsed.toFixed(2) + "ms. and ran"+ subdivisionCount + ' times.');
        }
        // prune short line segments with only one node
        geom.pruneLines();
        phys.createMesh();

        mode = 'setup';
    }
}


function setupMode() {

    if(touchJustEnded){
        if(debugMode){start = millis();}

        background(51);
        image(backgroundGrid, 0, 0, width, height);
        stroke(200);

        // draw lines
        for (let myLine of geom.lines) {
            myLine.drawLine();
        }

        noStroke();

        // draw intersections
        fill('salmon');
        for (let node of phys.nodes) {
            ellipse(node[0], node[1], 10);
        }

        // draw pinned nodes
        fill('dodgerblue');
        for (let node of pinnedNodes){
            ellipse(node[0],node[1],15);
        }

        noStroke();
        fill('red');
        text('Click on the nodes you want to pin. Press simulate when done.', 10, 5 * spacing);
        text('after simplifying graph, number of lines is ' + geom.lines.length + ' and number of nodes is ' + phys.nodes.length, 10, height - 2 * spacing);

        touchJustEnded = false;

        if(debugMode){
            end = millis();
            var elapsed = end - start;
            console.log('inputmode() took: ' + elapsed.toFixed(2) + 'ms.');
        }
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

    if(debugMode){start = millis();}

    phys.addForces();
    phys.update();
    phys.drawStrings();

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log('simulate() took: ' + elapsed.toFixed(2) + 'ms.');
    }

}

function touchStarted() {

    if(debugMode){start = millis();}

    if(mode == 'welcome'){
        mode = 'input';
    }

    else if (mode == 'input')
    {
        startPos = snapToGrid(createVector(mouseX, mouseY));

        closestLine = 0;

        for (let myLine of geom.lines) {
            if (myLine.start.dist(startPos) < 15)
            {
                closestLine = {
                    line: myLine,
                    start: myLine.start
                };
            }
            else if (myLine.end.dist(startPos) < 15)
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

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log('touchStarted() took: ' + elapsed.toFixed(2) + 'ms.');
    }

    return false;
}


function touchMoved() {

    if(debugMode){start = millis();}

    if (mode == 'input') {
        if (cornerSelected) {
            currentPos = snapToGrid(createVector(mouseX, mouseY));

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
                currentPos = snapToGrid(createVector(mouseX, mouseY));
                if (startPos.dist(currentPos) < 10) {
                    touchIsMoving = true;
                }
            }
        }
    }

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log('touchMoved() took: ' + elapsed + 'ms.');
    }

    return false;
}

function touchEnded() {

    if(debugMode){start = millis();}

    if (mode == 'input') {
        if (cornerSelected) {
            cornerSelected = false;
        } else {
            endPos = snapToGrid(createVector(mouseX, mouseY));
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

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log('touchEnded() took: ' + elapsed.toFixed(2) + 'ms.');
    }
    return false;
}

function toggleSelect() {
    if(mode=='input'){
	   adjustMode = !adjustMode;
    }
}

function undo() {
    if(mode == 'input'){
        var myLine = geom.lines.pop();
        geom.deleteIntersections(myLine);
    }
}

function snapToGrid(myVec) {

    // if there's an intersection nearby, snap to that
    for (let myInt of geom.intersections) {
        if (myVec.dist(myInt.point) <= 0.5*spacing) {
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


function initGrid() {

    backgroundGrid.noStroke();
    backgroundGrid.fill(200, 50);
    for (var x = 0; x <= width; x += spacing) {
        for (var y = 0; y <= height; y += spacing) {
            backgroundGrid.ellipse(x, y, 3);
        }
    }
}


function welcomeScreen(){
    noStroke();
    background(51);
    textAlign(CENTER,CENTER);
    textSize(3*spacing);
    text('String Machine',width/2,height/2-2*spacing);
    textSize(3*spacing);
    text('Click to start',width/2,height/2+2*spacing);

    textAlign(LEFT);
}

