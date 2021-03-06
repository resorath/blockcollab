module.exports = {
	
	/**
	 * Shuffles array in place.
	 * @param {Array} a items The array containing the items.
	 */
	shuffle: function(a) {
	    var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }
	},
	
	clone(obj)
	{
		return JSON.parse(JSON.stringify(obj));
	},


	// Zero-based random number
	// e.g. max = 2 is 1 in 2 chance when checking 0. 
	Random: function(max)
	{
	  return Math.floor(Math.random() * max);
	},

	// min - max inclusive
	RandomInt: function (min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	filterInPlace: function(a, condition) {
	  var i = 0;
	  var j = 0;

	  while (i < a.length) {
	    const val = a[i];
	    if (condition(val, i, a)) a[j++] = val;
	    i++;
	  }

	  a.length = j;
	  return a;
	},

};