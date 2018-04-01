var interact = function() {

    function toggleAdjustMode() {
        if(mode=='input'){
            adjustMode = !adjustMode;
        }
    }

    return {
        toggleAdjustMode: toggleAdjustMode
    };

}();
