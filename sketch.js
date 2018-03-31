let startPos, endPos, currentPos;
let lines = [];
let intersections = [];
let touchIsMoving = false;
let touchJustEnded = true;
let cornerSelected = false;
//let touchClicked = false;
let closestLine;
let adjustMode = false;
//let grid = [];
let spacing;
let mode = 'welcome';
let debugMode = false;
//let intersectionPoints = [];
let myFontSize;
let mesh = [];
let nodes = [];
let pinnedNodes = [];
let particles = [];
let springs = [];
let stiffness = 0.2;
let smoothing = 0.5;
let accelX = 0;
let accelY = 0;
let accelCutoff = 2;
let backgroundGrid;
let start,end;
let subdivisionCount;
let stiffnessSlider;
let button1,button2,button3,button4;
let physics;

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

    makeButtons();
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
            console.log('line count: ' + lines.length);
            console.log('intersection count: ' + intersections.length);
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
        for (let myLine of lines) {
            myLine.drawLine();
        }

        // draw intersections
        noStroke();
        fill('red');
        for (let myIntersection of intersections) {
            ellipse(myIntersection.point.x, myIntersection.point.y, 10);
        }

        if (adjustMode) {
            noStroke();
            fill('lightblue');
            for (let myLine of lines) {
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
        subdivisionCount = 0;

        subdivideLines();
        if(debugMode){
            end = millis();
            var elapsed = end - start;
            console.log("subdivideLines() took " + elapsed.toFixed(2) + "ms. and ran"+ subdivisionCount + ' times.');
        }
        // prune short line segments with only one node
        pruneLines();

        for (let myLine of lines){

            mesh.push([myLine.start.x,myLine.start.y,myLine.end.x,myLine.end.y]);

            let myPoint1 = [myLine.start.x,myLine.start.y];
            if(!nodes.containsArray(myPoint1)){
                nodes.push(myPoint1);
            }

            let myPoint2 = [myLine.end.x,myLine.end.y];
            if(!nodes.containsArray(myPoint2)){
                nodes.push(myPoint2);
            }
        }

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
        for (let myLine of lines) {
            myLine.drawLine();
        }

        noStroke();

        // draw intersections
        fill('salmon');
        for (let node of nodes) {
            ellipse(node[0], node[1], 10);
        }

        // draw pinned nodes
        fill('dodgerblue');
        for (let node of pinnedNodes){
            ellipse(node[0],node[1],15);
        }

        noStroke();
        fill('red');
        text("Click on the nodes you want to pin. Press simulate when done.", 10, 5 * spacing);
        text("after simplifying graph, number of lines is " + lines.length + " and number of nodes is " + nodes.length, 10, height - 2 * spacing);

        touchJustEnded = false;

        if(debugMode){
            end = millis();
            var elapsed = end - start;
            console.log("inputmode() took: " + elapsed.toFixed(2) + "ms.");
        }
    }

}


function initializePhysics(){

    if(mode == 'setup'){
        // Initialize the physics
        physics = new VerletPhysics2D();
        physics.addBehavior(new GravityBehavior(new Vec2D(0,1)));

        // Set the world's bounding box
        physics.setWorldBounds(new Rect(0,0,width,height));

        // make particles
        for(let myNode of nodes){
            let myParticle = new VerletParticle2D(new Vec2D(myNode[0],myNode[1]));
            particles.push(myParticle);
            physics.addParticle(myParticle);

            // lock fixed nodes
            if(pinnedNodes.containsArray(myNode)){
                myParticle.lock();
            }
        }

        // make strings
        for(let myLine of mesh)
        {
            let x1 = myLine[0];
            let y1 = myLine[1];
            let x2 = myLine[2];
            let y2 = myLine[3];

            let i1 = indexOfPointInArray(nodes,[x1,y1]);
            let i2 = indexOfPointInArray(nodes,[x2,y2]);


            let springLength = createVector(x1,y1).dist(createVector(x2,y2));
            let mySpring = new VerletSpring2D(particles[i1],particles[i2],springLength,stiffness);
            springs.push(mySpring);
            physics.addSpring(mySpring);
        }

        stroke(200); //set stroke for the physics simulation
        makeSliders();
        mode = 'simulate';
    }
}

function simulate(){

    if(debugMode){start = millis();}

    for(let i=0; i<particles.length; i++){
        if (!particles[i].isLocked){

            accelX = smoothing*accelerationX + (1-smoothing)*accelX ;
            accelY = smoothing*accelerationY + (1-smoothing)*accelX ;

            if(abs(accelX) > accelCutoff){
                particles[i].x -= accelX;
            }
            if(abs(accelY) > accelCutoff){
                particles[i].y -= accelY;
            }

        }
    }

    // Update the physics world
    physics.update();

    // This next bit draws lines between the particles

    for(let myLine of mesh){

        let x1 = myLine[0];
        let y1 = myLine[1];
        let x2 = myLine[2];
        let y2 = myLine[3];

        let i1 = indexOfPointInArray(nodes,[x1,y1]);
        let i2 = indexOfPointInArray(nodes,[x2,y2]);

        line(particles[i1].x,particles[i1].y,particles[i2].x,particles[i2].y);


    }

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log("simulate() took: " + elapsed.toFixed(2) + "ms.");
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

        for (let myLine of lines) {
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
        console.log("touchStarted() took: " + elapsed.toFixed(2) + "ms.");
    }

    return false;
}


function touchMoved() {

    if(debugMode){start = millis();}

    if (mode == 'input') {
        if (cornerSelected) {
            currentPos = snapToGrid(createVector(mouseX, mouseY));

            deleteIntersections(closestLine.line);

            if (closestLine.start) {
                closestLine.line.start = currentPos;
            }
            else
            {
                closestLine.line.end = currentPos;
            }

            computeIntersections(closestLine.line);

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
        console.log("touchMoved() took: " + elapsed + "ms.");
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
                let newLine = new makeNewLine(startPos, endPos);
                // maybe I shouldn't do this?
                // computeIntersections computes the intersections but also
                // detects if the new line is unique
                if (computeIntersections(newLine) && newLine.lineLength() > 0.1) {
                    lines.push(newLine);
                }
                touchIsMoving = false;
            }
        }
        touchJustEnded = true;
    }

    else if(mode == 'setup')
    {
        for (let myNode of nodes)
        {
            let mousePos = createVector(mouseX, mouseY);
            let nodePos = createVector(myNode[0],myNode[1]);

            if (nodePos.dist(mousePos) < 15)
            {
                if(!pinnedNodes.containsArray(myNode)){
                    pinnedNodes.push(myNode);
                }
                else{
                    let index = indexOfPointInArray(pinnedNodes,myNode);
                    pinnedNodes.splice(index,1);
                }
            }
        }
        touchJustEnded = true;
    }

    if(debugMode){
        end = millis();
        var elapsed = end - start;
        console.log("touchEnded() took: " + elapsed.toFixed(2) + "ms.");
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
        var myLine = lines.pop();
        deleteIntersections(myLine);
    }
}

function snapToGrid(myVec) {

    // if there's an intersection nearby, snap to that
    for (let myInt of intersections) {
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

function deleteElement(array, value) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] == value) {
            array.splice(i, 1);
        }
    }
}



function makeButtons() {
    button1 = createButton('undo');
    button1.position(19, 19);
    button1.size(4 * spacing, 2 * spacing);
    button1.mousePressed(undo);
    button1.style('font-size', myFontSize);

    button2 = createButton('adjust lines');
    button2.position(19 + 5 * spacing, 19);
    button2.size(4 * spacing, 2 * spacing);
    button2.mousePressed(toggleSelect);
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
    stiffnessSlider.changed(changeStiffness);
}

function changeStiffness(){
    stiffness = stiffnessSlider.value()/100;

    for(let spring of springs){
        spring.setStrength(stiffness);     // change spring stiffness
    }
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

Array.prototype.containsArray = function(val)
{
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
};


function indexOfPointInArray(array, myPoint) {
    for (var i = 0; i < array.length; i++) {
        // This if statement depends on the format of your array
        if (array[i][0] == myPoint[0] && array[i][1] == myPoint[1]) {
            return i;   // Found it
        }
    }
    return -1;   // Not found
}

function welcomeScreen(){
    noStroke();
    background(51);
    textAlign(CENTER,CENTER);
    textSize(3*spacing);
    text("Click to start",width/2,height/2);

    textAlign(LEFT);
}