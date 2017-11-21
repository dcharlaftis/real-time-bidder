"use strict";
var config = require("../config.js");

function printHash(hashedCampaigns){
	for (var i = 0; i < hashedCampaigns.length; i++){
		var currentBucket = hashedCampaigns[i];
		console.log (" ----" + currentBucket.country + " ----")
         for (var j=0 ; j<currentBucket.campaigns.length; j++){
           var currentCampaign = currentBucket.campaigns[j];
           console.log ("         .." + currentCampaign.name + " $ " + currentCampaign.price + "bids " + currentCampaign.bids)
	     }
    }
}

module.exports = {
	winnerCampaign: function(country, hashedCampaigns, cb){
          
          //printHash(hashedCampaigns);

          var winningCampaign = null;
          var found = false;

          for (var i = 0; i < hashedCampaigns.length; i++){
            var currentBucket = hashedCampaigns[i];
            if (currentBucket.country === country){
            	//take the first element - highest on price and check if it is valid - if not go to the next one
               for (var j=0 ; j<currentBucket.campaigns.length; j++){
               	   var currentCampaign = currentBucket.campaigns[j];
               	   if (currentCampaign.bids < config.maxBids){
               	   	   currentCampaign.bids++;
               	   	   winningCampaign = currentCampaign;               	   	   
               	   	   //console.log ("current bucket country ====" + currentBucket.country + " country === "  + country)
               	   	   //console.log ("iiiiiiiiiii" + i + "jjjjjjjjjjjjj" + j)
               	   	   found = true;
                       break;                      
               	   }
               }                            
            }
            if (found) break;              
         }
        //console.log("winner-------->" + winningCampaign.name  + " bids = " + winningCampaign.bids);
        cb(country, winningCampaign); 
    }
};