Array.prototype.containsArray = function(val)
{
    var hash = {};
    for(var i=0; i<this.length; i++)
    {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
};


Array.prototype.indexOfPoint = function(myPoint){
    for (var i = 0; i < this.length; i++)
    {
        // This if statement depends on the format of your array
        if (this[i][0] == myPoint[0] && this[i][1] == myPoint[1])
        {
            return i;   // Found it
        }
    }
    return -1;   // Not found
};

