================================
REAL TIME BIDDER
developed by Dimitris Charlaftis
================================

This real time bidder has been implemented using the Node js 8.9.1 LTS platform.
Current implementation was made in Windows 10 x 64bit.
Please read the following steps to install and run the demo exercise.


[1] INSTALLATION
----------------
Install node js (https://nodejs.org/en/)


[2] CONFIGURATION
-----------------
In the config.js file, the URLs used are those of the mock servers.
They can be changed to the production ones, if necessary.
Also, the max bids and interval counters used for the pacing algorithm can be changed at will for testing.
The tests section describes the several input bids for each testing case.


[3] RUN
-------
a) cd into the bidder directory
   >cd bidder
b) install necessary dependencies 
   >npm install 
c) start the bidder server
   >node bidder.js 


[4] TEST
--------
Using an application for sending http/https requests (i.e  postman), 
send a test bid http POST request with the following info:

a) (winner campaign expected in output)

    URL:  http://localhost:3000/
    HEADERS: Content-type : application/json
	BODY:
	{
	  "id": "e7fe51ce4f6376876353ff0961c2cb0d",
	  "app": {
	    "id": "e7fe51ce-4f63-7687-6353-ff0961c2cb0d",
	    "name": "Morecast Weather"
	  },
	  "device": {
	    "os": "Android",
	    "geo": {
	      "country": "USA",
	      "lat": 0,
	      "lon": 0
	    }
	  }
	}

b)  (winner campaign not expected in output) 

    URL:  http://localhost:3000/
    HEADERS: Content-type : application/json
	BODY:
	{
	  "id": "e7fe51ce4f6376876353ff0961c2cb0d",
	  "app": {
	    "id": "e7fe51ce-4f63-7687-6353-ff0961c2cb0d",
	    "name": "Morecast Weather"
	  },
	  "device": {
	    "os": "Android",
	    "geo": {
	      "country": "CYP",
	      "lat": 0,
	      "lon": 0
	    }
	  }
	}

NOTE: 
======
In the following tests we suppose that Max bids = 3 and reset interval = 60 secs.
This configuration can be changed in the config.js file


(4.1). Automated tests
----------------------
i) >cd bidder

ii) run server: 
    >node bidder.js

iii) open another console window and run test client
     >node test-bidder.js <test no>

     where <test no> is either 1, 2 or 3 and corresponds to the test scenario defined in config.js.

Output results are shown in testResults.txt. For better view of the results (lines one below another),
please open this file with Wordpad or a similar text editor.


(4.2). Manual tests
-------------------
For the tests to be done correctly, in order to see the results of the pacing algorithm, 
you should change the BODY.device.geo.country parameter to USA, GBR, GRC, MEX, HUN, CYP,
BRA, EGY in the interval (in secs) configured in config.js.


(4.3). Test Scenarios
---------------------
Below there are three test scenarios. The country column describes the input bid in bid request and the
winning campaign describes the expected output in bid response.


Test Scenario 1.
----------------

Bid no.  | Country | Expected Output (Winning Campaign)
-------------------------------------------------------
   1     |  USA    | Test Campaign 1
-------------------------------------------------------         
   2     |  GRC    | Test Campaign 1
------------------------------------------------------- 
   3     |  USA    | Test Campaign 1
------------------------------------------------------- 
   4     |  USA    | Test Campaign 4
-------------------------------------------------------
  wait for the interval to pass
------------------------------------------------------- 
   5     |  USA    | Test Campaign 1
-------------------------------------------------------


Test Scenario 2.
----------------

Bid no.  | Country | Expected Output (Winning Campaign)
-------------------------------------------------------
   1     |  GBR    | Test Campaign 5 
-------------------------------------------------------         
   2     |  USA    | Test Campaign 1
------------------------------------------------------- 
   3     |  GRC    | Test Campaign 1
------------------------------------------------------- 
   4     |  USA    | Test Campaign 4
------------------------------------------------------- 
   5     |  USA    | Test Campaign 4
-------------------------------------------------------
   6     |  USA    | None
-------------------------------------------------------
  wait for the interval to pass
-------------------------------------------------------
   7     |  USA    | Test Campaign 1
-------------------------------------------------------
   8     |  CYP    | None 
------------------------------------------------------- 


Test Scenario 3.
----------------

Bid no.  | Country | Expected Output (Winning Campaign)
-------------------------------------------------------
   1     |  HUN    | Test Campaign 3 
-------------------------------------------------------         
   2     |  MEX    | Test Campaign 3
------------------------------------------------------- 
   3     |  BRA    | Test Campaign 2
------------------------------------------------------- 
   4     |  HUN    | Test Campaign 3
------------------------------------------------------- 
   5     |  MEX    | None
-------------------------------------------------------
   6     |  CYP    | None
-------------------------------------------------------
  wait for the interval to pass
-------------------------------------------------------
   7     |  GBR    | Test Campaign 5
-------------------------------------------------------