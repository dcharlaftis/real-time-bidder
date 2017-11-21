//test bidder - a module used to automatically test the main bidder module
//developed by Dimitris Charlaftis

var  express = require('express'), 
     app = express(),	
	 fs = require('fs'),
	 request = require("request"),	
	 config = require("./config.js");

//log the test results
var logger = fs.createWriteStream('testResults.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
});

//makes a single bid to the listening bidder server for a specific country 
function singleBid (country){
	var testbid = {
		  "id": "e7fe51ce4f6376876353ff0961c2cb0d",
		  "app": {
		    "id": "e7fe51ce-4f63-7687-6353-ff0961c2cb0d",
		    "name": "Morecast Weather"
		  },
		  "device": {
		    "os": "Android",
		    "geo": {
		      "country": country,
		      "lat": 0,
		      "lon": 0
             }
         }
    }; 
    
    console.log("\n\n Bidding input:");
    console.log(testbid);
    var urlString = config.bidderURL + ":" + config.port;

   	request.post({
				     url: urlString ,
				     port: config.port,
				     headers: {
				        "Content-Type": "application/json"
				     },
				     body: testbid,
				     json:true
				}, function(error, response, body){
		   console.log(error);
		   console.log(JSON.stringify(response));
		   console.log(body);
	});	
}

//perform generic test scenario described in config.js. There is a delay between each bid for realistic purposes
function performTest(testCountries, index) {
    if (index < testCountries.length -1){
    	index++;
    
	    //if there is a pause in the scenario wait for the time interval to pass
	    if (testCountries[index] ==="WAIT"){
	         var millisecs = config.bidIntervalInSeconds * 1000;			    
			    setTimeout(function(){
			    	performTest(testCountries, index);
			    }, millisecs);
	    }
	    else{
	    	singleBid(testCountries[index]);
	    	//make a delay for realistic purposes
	    	setTimeout(function(){
			    	performTest(testCountries, index);
			    }, 4000);
	    }
    }
}

//perform tests
if ((process.argv.length < 3 ) || (process.argv[2] < 1) || (process.argv[2] > 3)){
    console.log("Please provide a valid test scenario number - either 1, 2 or 3.");
	process.exit();
}
if (process.argv[2].toString() === "1"){
	logger.write("\n\n\n TEST SCENARIO 1  " );
	logger.write("\n --------------- \n " );
    performTest(Array.from(config.tests.firstTest), -1);    
}
if (process.argv[2].toString() === "2"){
	logger.write("\n\n\n TEST SCENARIO 2 " );
	logger.write("\n --------------- \n " );
    performTest(Array.from(config.tests.secondTest), -1);
}
if (process.argv[2].toString() === "3"){
	logger.write("\n\n\n TEST SCENARIO 3  " );
	logger.write("\n --------------- \n " );
    performTest(Array.from(config.tests.thirdTest), -1);
}
