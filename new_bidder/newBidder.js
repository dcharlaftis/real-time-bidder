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
var hashifyCampaigns = require("./functions/hashifyCampaigns.js");
var winnerCampaign = require("./functions/winnerCampaign.js");
var parseBidRequest = require("./functions/parseBidRequest.js");

//data structure to hold info for every campaign - used for the pacing algorithm
var requestBids = [];
var _hashedCampaigns = [];

exports.requestBids = requestBids;
exports._hashedCampaigns = _hashedCampaigns;

//set the interval in which the bids counters will be cleared
var millisecs = config.bidIntervalInSeconds * 1000;
setInterval(function(){
   for (var i = 0; i < _hashedCampaigns.length; i++){
      var currentBucket = _hashedCampaigns[i];
      for (var j = 0; j < currentBucket.campaigns.length; j++)
          currentBucket.campaigns[j].bids = 0;
   }        
}, millisecs);


function fetchBidRequest(){
    var req = null;
    if (requestBids.length > 0){
    	req = requestBids[requestBids.length - 1];
        requestBids.splice(requestBids.length - 1, 1);
   	    console.log("current valid request =>" + req) ;   
    }   	 
    return req;
}


// describes what happens when the bidder receives a bid request
function bidderCycle(req, callbk){
    console.log('\n Processing bid request...');
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
	      console.log("Hashifying campaigns...");		     
	      hashifyCampaigns.hashifyCampaigns(campaigns, _hashedCampaigns, function(hashedCampaigns){
	        cb(null, bidRequestID, country, hashedCampaigns);
	      });
	    },
	    function(bidRequestID, country, hashedCampaigns, cb){
	      console.log("Finding winner campaign...");		     
	      winnerCampaign.winnerCampaign(country, hashedCampaigns, function(country, winningCampaign){
	        cb(null, bidRequestID, country, winningCampaign);
	      });
	    },
	    function(bidRequestID, country, winningCampaign, cb){
	      console.log("Bidding winning campaign...");		     
	      bidResponse.bidResponse(bidRequestID, country, winningCampaign, function(country, winningCampaign){
	        cb(null);
	      });
	    }
    ], 
    function (err) {
      if (err) { throw err; }    
    });
    
    callbk();
}

function runBidder(timeout){
   var item = fetchBidRequest();
   //console.log("current item fetched = " + item);

   if (item)
   	 bidderCycle(item, runBidder);
   	else {
   		setTimeout(runBidder, timeout);
   	}
}

app.post('/', function(req, res){
	console.log('\n Got bid request...');
    requestBids.push(req);
    res.end('ok');
});

runBidder(1000);

port = config.port;
app.listen(port);
console.log('Listening at http://localhost:' + port);

