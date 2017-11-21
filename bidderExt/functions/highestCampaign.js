"use strict";

module.exports = {
//find highest campaign among filtered campaigns. If filtered campaigns = empty then send appropriate message.
// if two maximun candidates found, the functiuon returns the first one.
//we do not need to sort the campaigns, but get the highest one (less complexity O(2n) = O(n) while sorting we would have O(nlog(n)) 
	highestCampaign: function (country, filteredCampaigns, cb){	
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
};