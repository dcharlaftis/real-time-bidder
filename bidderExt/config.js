"use strict";

module.exports = {
  //url used for getting the campaigns list
  "campaignsURL": "https://private-anon-4127e0783c-campaignapi9.apiary-mock.com/campaigns",
  
  //url used for the posting the winning campaign 
  "bidResponseURL": "private-anon-4c69b4baf2-bidderapi.apiary-mock.com",

  "bidderURL": "http://localhost",

  //bidder server listens to port
  "port":3000,

  //max bids allowed per interval
  "maxBids": 3,

   //the interval (in seconds) in which max bids are allowed
  "bidIntervalInSeconds": 60,

  //test scenarios
  "tests":{
    "firstTest" : ["USA", "GRC", "USA", "USA","WAIT", "USA"],
    "secondTest": ["GBR", "USA", "GRC", "USA", "USA", "USA", "WAIT", "USA", "CYP"],
    "thirdTest" : ["HUN", "MEX", "BRA", "HUN", "MEX", "CYP", "WAIT", "GBR"] 
  }
};