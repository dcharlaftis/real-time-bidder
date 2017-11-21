"use strict";
var config = require("../config.js"),
    fs = require('fs'),
    os = require('os'),
    querystring = require('querystring'),
    http = require('http'); 

var bidderExt = require('../bidderExt.js');    

//formats an id in specific format
function formattedId(id){
	var idStr = id.toString();
	return idStr.substring(0, 8) + "-" + idStr.substring(8, 4) + "-" + idStr.substring(12, 4) + "-" + idStr.substring(16, 4) + "-" + idStr.substring(20, 12);
}

//gets platform operating system
function getOS(){
    return os.type().toString() + " " + os.release().toString() + " " + os.platform().toString();
}

//log the test results
var logger = fs.createWriteStream('testResults.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
});

module.exports = {
	//bid winning campaign to ad exchange
	bidResponse: function (bidRequestID, country, filteredCampaign, cb){	
	     
	    console.log("\n Candid.ate campaigns bids:");
	    for (var i = 0; i < bidderExt.candidatesBids.length; i++){
	       console.log( bidderExt.candidatesBids[i]);  
	    }
	           
	    //if no campaigns found send empty campaign
	    if (filteredCampaign.length === 0){
	      console.log("\n WARNING: no candidate campaigns found...\n");      
	      logger.write("\n" + country + '\t | None' );
	      var postObj = {};
	    }
	    else{
		    var postObj = {
				  "id": bidRequestID,
				  "app": {
				    "id": formattedId(bidRequestID),
				    "name": filteredCampaign.name
				  },
				  "device": {
				    "os": getOS(),
				    "geo": {
				      "country":country,
				      "lat": 0,
				      "lon": 0
		             }
		         }
		    };	    
		    console.log("\n Winning Campaign ===> "  + postObj.app.name + "\n\n postObj.id = " + postObj.id + "\n postObj.app.id = " + postObj.app.id   
		    	       + "\n postObj.device.os = " + postObj.device.os + "\n postObj.device.geo.country = " + postObj.device.geo.country + "\n"); 
		    logger.write("\n" + country + '\t | ' + postObj.app.name );
	    }

		var postData = querystring.stringify(postObj);
		var options = {
		    host: config.bidResponseURL,
		    port: '80',
	        path: '/bid',	   
		    method: 'POST',
		    headers: {
		        'Content-Type': 'application/json'
		    }
		};

		var req = http.request(options, function (res) {
		    console.log('STATUS:', res.statusCode);
		    console.log('HEADERS:', JSON.stringify(res.headers));

		    res.setEncoding('utf8');
		    res.on('data', function (chunk) {
		        console.log(); console.log("Got response:");
		        console.log('BODY:', chunk);console.log();
		    });
		    res.on('end', function () {
		        console.log('No more data in response.');
		    });
		});
		req.on('error', function (e) {
		    console.log('Problem with request:', e.message);
		});
		req.write(postData);
		req.end();  
	}	
};