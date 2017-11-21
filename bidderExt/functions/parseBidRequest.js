"use strict";

module.exports = {
   //parse bid requests
	parseBidRequest: function (request, cb){
	    var country = request.body.device.geo.country;  
	    var bidRequestID = request.body.id.toString();
	    console.log("country = " + country); 
	    console.log("bidRequestID = " + bidRequestID); 
	    cb(bidRequestID, country);
	}
};