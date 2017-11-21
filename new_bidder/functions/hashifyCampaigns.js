"use strict";

//var  bidderExt = require('../newBidder.js');

//country exists in hashtble
function existsCountry (country, hashedCampaigns){
	if (hashedCampaigns.length === 0)
		return false;

	for (var i=0; i < hashedCampaigns.length; i++){
		var currentBucket = hashedCampaigns[i];
		if (country === currentBucket.country.toString())
			return true;
	}
	return false;
}

function existsCampaign(campaign, country, hashedCampaigns){
    if (hashedCampaigns.length === 0)
	   return false;
    
    for (var i=0; i < hashedCampaigns.length; i++){
    	var currentBucket = hashedCampaigns[i];
		if (country === currentBucket.country.toString()){
           for (var j = 0; j < currentBucket.campaigns.length; j++){
              var currentCampaign = currentBucket.campaigns[j];
              if (currentCampaign.id.toString() === campaign.id)
              	return true;
           }
		}
    }
    return false;
}

function addSorted(campaign, country, hashedCampaigns){
    for (var i=0; i < hashedCampaigns.length; i++){
       var currentBucket = hashedCampaigns[i];
       if (country === currentBucket.country.toString()){
	       var j = 0;
	       while (j < currentBucket.campaigns.length ){
	       		var currentCampaign = currentBucket.campaigns[j];
	       		if (campaign.price < currentCampaign.price)
	       		  j++;
	       		else break;
	       }
	       campaign.bids = 0;

	       if (j === currentBucket.campaigns.length )
	       	  currentBucket.campaigns.push(campaign);
	       	else 
	       		currentBucket.campaigns.splice(j, 0, campaign); 
	       break; 
       }            
    }
}

function placeInOrder(campaign, hashedCampaigns){
    if (campaign){
    	//for each country of the campaign
	    for (var j = 0; j < campaign.targetedCountries.length; j++){
	         var currentCountry = campaign.targetedCountries[j].toString();
	         if (!existsCountry(currentCountry, hashedCampaigns)){
	         	var curBucket = {
	         		"country": currentCountry,
	         		"campaigns": []	         		
	         	}
	         	//set bit counter
                campaign.bids = 0;
                
	         	curBucket.campaigns.push(campaign);
	            hashedCampaigns.push(curBucket);
	         }
	         else if (!existsCampaign(campaign, currentCountry, hashedCampaigns)){
	            addSorted(campaign, currentCountry, hashedCampaigns);	            
	         }
		}
    }    
}

module.exports = {    
    //transforms unsorted list of campaigns to a hash table
    hashifyCampaigns: function (campaigns, hashedCampaigns, cb){    	
        for (var i = 0; i < campaigns.length; i++){
        	var currentCampaign = campaigns[i];
            placeInOrder(currentCampaign, hashedCampaigns);                       
        }
        cb(hashedCampaigns);
    }
};