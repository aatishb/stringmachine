var ui = function() {

    let button1,button2,button3,button4;
    let stiffnessSlider;

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
        stiffnessSlider.changed(phys.changeStiffness);
    }


    return {
        makeButtons: makeButtons,
        makeSliders: makeSliders
    };

}();