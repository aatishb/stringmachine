var phys = function() {

    let physics;
    let particles = [];
    let springs = [];
    let stiffness = 0.2;
    let smoothing = 0.5;
    let accelX = 0;
    let accelY = 0;
    let accelCutoff = 2;
    let nearestParticle = 0;

    let mesh = [];
    let nodes = [];
    let pinnedNodes = [];

    function deleteAll(){
        particles.length = 0;
        springs.length = 0;
        mesh.length = 0;
        nodes.length = 0;
        pinnedNodes.length = 0;
    }


    function initializePhysics(){
        // Initialize the physics
        physics = new VerletPhysics2D();
        physics.addBehavior(new GravityBehavior(new Vec2D(0,1)));

        // Set the world's bounding box
        physics.setWorldBounds(new Rect(0,0,width,height));

        // make particles
        for(let myNode of nodes)
        {
            let myParticle = new VerletParticle2D(new Vec2D(myNode[0],myNode[1]));
            particles.push(myParticle);
            physics.addParticle(myParticle);

            // lock fixed nodes
            if(pinnedNodes.containsPoint(myNode))
            {
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

            let i1 = nodes.indexOfPoint([x1,y1]);
            let i2 = nodes.indexOfPoint([x2,y2]);


            let springLength = createVector(x1,y1).dist(createVector(x2,y2));
            let mySpring = new VerletSpring2D(particles[i1],particles[i2],springLength,stiffness);
            springs.push(mySpring);
            physics.addSpring(mySpring);
        }
    }

    function addForces(){
        for(let i=0; i<particles.length; i++)
        {
            if (!particles[i].isLocked)
            {

                accelX = smoothing*accelerationX + (1-smoothing)*accelX ;
                accelY = smoothing*accelerationY + (1-smoothing)*accelX ;

                if(abs(accelX) > accelCutoff)
                {
                    particles[i].x -= accelX;
                }
                if(abs(accelY) > accelCutoff)
                {
                    particles[i].y -= accelY;
                }

            }
        }

    }

    function stickToMouse(myMousePos){

        // runs when mouse is pressed in simulate mode
        // searches for the closest particle near the mouse
        // and gives it the mouse position

        // maybe overkill? could just find a nearby particle
        // (rather than the nearest) and stick it to mouse


        let spacing = ui.getSpacing();
        let nearestParticlePos = createVector(nearestParticle.x,nearestParticle.y);
        let nearestParticleDist = nearestParticlePos.dist(myMousePos);

        for(let myParticle of particles){

            let particlePos = createVector(myParticle.x,myParticle.y);
            let distToMouse = particlePos.dist(myMousePos)

            if(distToMouse < spacing)
            {
                if(nearestParticle){
                    if(distToMouse < nearestParticleDist){
                        nearestParticle = myParticle;
                        nearestParticleDist = distToMouse;
                    }
                }
                else
                {
                    nearestParticle = myParticle;
                    nearestParticlePos = distToMouse
                }
            }
        }

        if(nearestParticle)
        {
            if(!nearestParticle.isLocked)
            {
                nearestParticle.lock();
                nearestParticle.x = mouseX;
                nearestParticle.y = mouseY;
                nearestParticle.unlock();
            }
        }
    }

    function update(){
        physics.update();
    }

    function drawStrings(){
        for(let myLine of mesh){

            let x1 = myLine[0];
            let y1 = myLine[1];
            let x2 = myLine[2];
            let y2 = myLine[3];

            let i1 = nodes.indexOfPoint([x1,y1]);
            let i2 = nodes.indexOfPoint([x2,y2]);

            line(particles[i1].x,particles[i1].y,particles[i2].x,particles[i2].y);
        }
    }

    function createMesh(){
        for (let myLine of geom.lines){

            mesh.push([myLine.start.x,myLine.start.y,myLine.end.x,myLine.end.y]);

            let myPoint1 = [myLine.start.x,myLine.start.y];
            if(!nodes.containsPoint(myPoint1))
            {
                nodes.push(myPoint1);
            }

            let myPoint2 = [myLine.end.x,myLine.end.y];
            if(!nodes.containsPoint(myPoint2))
            {
                nodes.push(myPoint2);
            }
        }

    }

    function changeStiffness(){
        stiffness = stiffnessSlider.value()/100;

        for(let spring of springs)
        {
            spring.setStrength(stiffness);     // change spring stiffness
        }
    }

    function drawNodes(){
        for (let node of phys.nodes)
        {
            ellipse(node[0], node[1], 10);
        }
    }

    function drawPinnedNodes(){
        for (let node of pinnedNodes)
        {
            ellipse(node[0],node[1],0.5*ui.getSpacing());
        }
    }

    function updateNodes(myPoint){
        for (let myNode of nodes)
        {
            let nodePos = createVector(myNode[0],myNode[1]);

            if (nodePos.dist(myPoint) < 0.5*ui.getSpacing())
            {
                if(!pinnedNodes.containsPoint(myNode)){
                    pinnedNodes.push(myNode);
                }
                else{
                    let index = pinnedNodes.indexOfPoint(myNode);
                    pinnedNodes.splice(index,1);
                }
            }
        }
    }

    return {
        mesh: mesh,
        nodes: nodes,
        deleteAll: deleteAll,
        initializePhysics: initializePhysics,
        addForces: addForces,
        update: update,
        drawStrings: drawStrings,
        createMesh: createMesh,
        changeStiffness: changeStiffness,
        drawNodes: drawNodes,
        drawPinnedNodes: drawPinnedNodes,
        updateNodes: updateNodes,
        stickToMouse: stickToMouse
    };
}();
