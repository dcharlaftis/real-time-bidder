"use strict";
var config = require("../config.js"); 
var bidderExt = require('../bidderExt.js');

//check in candidatesBids array if a specific campaign has reached the bids limit
function canBeCandidate(id){
	for (var i = 0; i < bidderExt.candidatesBids.length; i++){
		var curCampaignBid = bidderExt.candidatesBids[i] ;
		if ((id == curCampaignBid.id ) && (curCampaignBid.bids == config.maxBids))
			return false;
	}
    return true;
}

//updates the bids foreach campaign in the global data structure
function updateCampaignBids(id, name){
   var found = false;
   for (var i = 0; i < bidderExt.candidatesBids.length; i++){		
		if (id == bidderExt.candidatesBids[i].id ){
			bidderExt.candidatesBids[i].bids ++;
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
        bidderExt.candidatesBids.push(newCampaign);
	}
}

module.exports = {
	//filter out all campaigns that are of different country than country (the first argument)
	matchTargeting: function (country, campaigns, cb){
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
};