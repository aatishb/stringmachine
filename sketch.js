let startPos, endPos, currentPos;
let touchIsMoving = false;
let touchJustEnded = true;

let mode = 'welcome';

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
    textSize(0.66 * ui.getSpacing());
    ui.makeButtons();
    ui.initGrid(w,h);
}

function draw() {

    if (mode == 'input')
    {
        inputMode(); // inputs the mesh
    }

    else if (mode == 'setup')
    {
        setupMode(); // pin the nodes
    }

    else if (mode == 'simulate')
    {
        background(51);
        simulateMode(); // simulate physics
    }

}

function inputMode() {

    if (touchIsMoving || touchJustEnded || interact.isCornerSelected())
    {

        background(51);
        image(backgroundGrid, 0, 0, width, height);
        stroke(200);


        if (touchIsMoving)
        {
            if (!interact.isCornerSelected())
            {
                line(startPos.x, startPos.y, mouseX, mouseY); // draw current line
            }
        }

        geom.drawLines();

        // draw intersections
        noStroke();
        fill('red');
        geom.drawIntersections();

        if (ui.getAdjustMode())
        {
            noStroke();
            fill('lightblue');
            geom.drawCorners();
        }

        touchJustEnded = false;
    }
}

function presetup() {

    if(mode == 'input')
    {
        geom.subdivideLines();
        geom.pruneLines();
        phys.createMesh();

        mode = 'setup';
    }
}


function setupMode() {

    if(touchJustEnded)
    {
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

    if(mode == 'setup')
    {
        phys.initializePhysics();
        stroke(200); //set stroke for the physics simulation
        ui.makeSliders();

        mode = 'simulate';
    }
}

function simulateMode(){

    phys.addForces();
    phys.update();
    phys.drawStrings();

}

function touchStarted() {

    if(mode == 'welcome')
    {
        mode = 'input';
    }

    else if (mode == 'input')
    {
        startPos = ui.snapToGrid(createVector(mouseX, mouseY));
        interact.findClosestLine(startPos);

    }

    return false;
}


function touchMoved() {

    if (mode == 'input')
    {
        currentPos = ui.snapToGrid(createVector(mouseX, mouseY));

        if (interact.isCornerSelected())
        {
            interact.updateLine(currentPos);
        }
        else if (!touchIsMoving && startPos.dist(currentPos) < 10)
        {
            touchIsMoving = true;
        }
    }

    return false;
}

function touchEnded() {

    if (mode == 'input')
    {
        if (interact.isCornerSelected())
        {
            interact.setCornerSelected(false);
        }
        else
        {
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
        let mousePos = createVector(mouseX, mouseY);
        phys.updateNodes(mousePos);
        touchJustEnded = true;
    }

    return false;
}
