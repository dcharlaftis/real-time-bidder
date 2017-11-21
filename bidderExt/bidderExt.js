// Real time Bidder 
// developed by Dimitris Charlaftis

var  express = require('express'),        
	 bodyParser = require('body-parser'),
	 app = express(),
	 async = require("async"),		 	
	 config = require("./config.js");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var bidResponse = require("./functions/bidResponse.js");
var getCampaigns = require("./functions/getCampaigns.js");
var highestCampaign = require("./functions/highestCampaign.js");
var matchTargeting = require("./functions/matchTargeting.js");
var parseBidRequest = require("./functions/parseBidRequest.js");

//data structure to hold bids for every campaign - used for the pacing algorithm
var candidatesBids = [];
exports.candidatesBids = candidatesBids;

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
	      parseBidRequest.parseBidRequest(req, function(bidRequestID, country){
	        cb(null, bidRequestID, country);
	      });
	    },
	    function(bidRequestID, country, cb){
	      console.log("Getting campaigns...");		     
	      getCampaigns.getCampaigns(null, function(campaigns){
	        cb(null, bidRequestID, country, campaigns);
	      });
	    },
        function(bidRequestID, country, campaigns, cb){
	      console.log("Matching targeting...");	 
          matchTargeting.matchTargeting(country, campaigns, function(filteredCampaigns){
	        cb(null, bidRequestID, country, filteredCampaigns);
	      });
	    },
	    function(bidRequestID, country, filteredCampaigns, cb){
	      console.log("Sorting filtered campaigns...");		     
	      highestCampaign.highestCampaign(country, filteredCampaigns, function(country, filteredCampaign){
	        cb(null, bidRequestID, country,  filteredCampaign);
	      });
	    },
	    function(bidRequestID, country, filteredCampaign, cb){
	      console.log("Bidding winning campaign...");		     
	      bidResponse.bidResponse(bidRequestID, country, filteredCampaign, function(country, filteredCampaign){
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

