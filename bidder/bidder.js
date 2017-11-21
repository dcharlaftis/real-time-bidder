// Real time Bidder 
// developed by Dimitris Charlaftis

var  express = require('express'), 
     https = require('https'),
     http = require('http'),
	 bodyParser = require('body-parser'),
	 app = express(),
	 async = require("async"),
	 request = require("request"),
	 querystring = require('querystring'),
	 os = require('os'),
	 fs = require('fs'),
	 config = require("./config.js");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//data structure to hold bids for every campaign - used for the pacing algorithm
var candidatesBids = [];

//log the test results
var logger = fs.createWriteStream('testResults.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
});

//parse bid requests
function parseBidRequest(request, cb){
    var country = request.body.device.geo.country;  
    var bidRequestID = request.body.id.toString();
    console.log("country = " + country); 
    console.log("bidRequestID = " + bidRequestID); 
    cb(bidRequestID, country);
}

//get list of campaigns through the campaign API
function getCampaigns(param, cb){
    request(config.campaignsURL, function (error, response, body) {
	  if (!error && response.statusCode == 200) {	   
	    cb(JSON.parse(body));
	  }
	  else{
	  	console.log("Got error: " + error);
	    cb('error in getting campaigns');
	  }
	});	
}

//check in candidatesBids array if a specific campaign has reached the bids limit
function canBeCandidate(id){
	for (var i = 0; i < candidatesBids.length; i++){
		var curCampaignBid = candidatesBids[i] ;
		if ((id == curCampaignBid.id ) && (curCampaignBid.bids == config.maxBids))
			return false;
	}
    return true;
}

//updates the bids foreach campaign in the global data structure
function updateCampaignBids(id, name){
   var found = false;
   for (var i = 0; i < candidatesBids.length; i++){		
		if (id == candidatesBids[i].id ){
			candidatesBids[i].bids ++;
            found = true;	
            break;		
		}            
	}
	if (!found){
		var newCampaign = {
              "id": id,
              "name": name , //name is not really necessary and it is used for debugging purposes
              "bids": 1
		};
        candidatesBids.push(newCampaign);
	}
}

//filter out all campaigns that are of different country than country (the first argument)
function matchTargeting(country, campaigns, cb){
	var filteredCampaigns=[];

    for (var i=0; i< campaigns.length; i++){  	 	
	  	var currentCampaign = campaigns[i];
	  	var currentTargetedCountries = currentCampaign.targetedCountries;
	  	//if the request country is included in current targeted countries from the campaign pool - check if it can be candidate
	  	if ( (currentTargetedCountries.includes(country)) && canBeCandidate(currentCampaign.id.toString()) ){	        
	       filteredCampaigns.push(currentCampaign);
	       updateCampaignBids(currentCampaign.id.toString(), currentCampaign.name.toString());
	  	}  	
    }    
    cb(filteredCampaigns);
}

//find highest campaign among filtered campaigns. If filtered campaigns = empty then send appropriate message.
// if two maximun candidates found, the functiuon returns the first one.
//we do not need to sort the campaigns, but get the highest one (less complexity O(2n) = O(n) while sorting we would have O(nlog(n)) 
function highestCampaign(country, filteredCampaigns, cb){	
	if (filteredCampaigns.length === 0){
		cb(country, filteredCampaigns);
	}
	else{ 	
		  //search for max price
		  var maxPrice = 0.0;
	      for (var i=0; i<filteredCampaigns.length; i++){      
	         var currentFilteredCampaign = filteredCampaigns[i];        
	         if (currentFilteredCampaign.price > maxPrice)
	           maxPrice = currentFilteredCampaign.price; 
	       } 	       
	       //search for the highest bid in the campaigns pool    
	       for (var i=0; i<filteredCampaigns.length; i++){ 
	         var currentCampaign = filteredCampaigns[i]; 
	         console.log("maxprice=" + maxPrice + ", cur campaign price = " + currentCampaign.price );
	         if ( maxPrice === currentCampaign.price){          
	            cb(country, currentCampaign);
	         }
	       }          
	    }
}

//formats an id in specific format
function formattedId(id){
	var idStr = id.toString();
	return idStr.substring(0, 8) + "-" + idStr.substring(8, 4) + "-" + idStr.substring(12, 4) + "-" + idStr.substring(16, 4) + "-" + idStr.substring(20, 12);
}

//gets platform operating system
function getOS(){
    return os.type().toString() + " " + os.release().toString() + " " + os.platform().toString();
}

//bid winning campaign to ad exchange
function bidResponse(bidRequestID, country, filteredCampaign, cb){	
    //object prototype

    //var postObj = {
	//	  "id": "e7fe51ce4f6376876353ff0961c2cb0d",
	//	  "app": {
	//	    "id": "e7fe51ce-4f63-7687-6353-ff0961c2cb0d",
	//	    "name": "Morecast Weather"
	//	  },
	//	  "device": {
	//	    "os": "Android",
	//	    "geo": {
	//	      "country": "USA",
	//	      "lat": 0,
	//	      "lon": 0
    //         }
    //     }
    // };    

    console.log("\n Candidate campaigns bids:");
    for (var i = 0; i < candidatesBids.length; i++){
       console.log(candidatesBids[i]);  
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

//set the interval in which the bids counters will be cleared
var millisecs = config.bidIntervalInSeconds * 1000;
setInterval(function(){
   for (var i = 0; i < candidatesBids.length; i++)
      candidatesBids[i].bids = 0;   
}, millisecs);

// describes what happens when the bidder receives a bid request
app.post('/', function(req, res){
    console.log('\n Got bid request...');
    //each module will be executed one after the other through waterfall   
    async.waterfall([
	    function(cb){
	      console.log("Parsing bid request...");	
	      parseBidRequest(req, function(bidRequestID, country){
	        cb(null, bidRequestID, country);
	      });
	    },
	    function(bidRequestID, country, cb){
	      console.log("Getting campaigns...");		     
	      getCampaigns(null, function(campaigns){
	        cb(null, bidRequestID, country, campaigns);
	      });
	    },
        function(bidRequestID, country, campaigns, cb){
	      console.log("Matching targeting...");	 
          matchTargeting(country, campaigns, function(filteredCampaigns){
	        cb(null, bidRequestID, country, filteredCampaigns);
	      });
	    },
	    function(bidRequestID, country, filteredCampaigns, cb){
	      console.log("Sorting filtered campaigns...");		     
	      highestCampaign(country, filteredCampaigns, function(country, filteredCampaign){
	        cb(null, bidRequestID, country,  filteredCampaign);
	      });
	    },
	    function(bidRequestID, country, filteredCampaign, cb){
	      console.log("Bidding winning campaign...");		     
	      bidResponse(bidRequestID, country, filteredCampaign, function(country, filteredCampaign){
	        cb(null);
	      });
	    }
    ], 
    function (err) {
      if (err) { throw err; }    
    });
    res.end('ok');
});

port = config.port;
app.listen(port);
console.log('Listening at http://localhost:' + port);

