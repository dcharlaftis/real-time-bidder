"use strict";

var request = require("../node_modules/request");
var config = require("../config.js"); 

module.exports = {
//get list of campaigns through the campaign API
	getCampaigns: function (param, cb){
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
};