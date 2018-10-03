// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const MessengerHelper = require('./MessengerHelper');
const ResponseHandler = require('./ResponseHandler');
var bodyParser = require('body-parser');
const API = require('./API');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// Braintree
var braintree = require('braintree');
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   't9rvykyd9cpq2gy6',
    publicKey:    'xftzrcbdj7r7vb22',
    privateKey:   '9d4cc8d255956707f9d0d78c3e8b433c'
});

app.get('/get_token', function (req,res) {
  gateway.clientToken.generate({}, function(err, response) {
      res.send(response);
  });
});


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//webhok verification
app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'SALES_BOT') {
        console.log('FB Webhook verification request received');
        res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed FB Webhook verification');
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  //console.log(data);
  // Make sure this is a page subscription
  if (data && data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      //console.log(pageEntry.standby);
      if(pageEntry.messaging) {
        //console.log('in messaging');
        // Iterate over each messaging event
        pageEntry.messaging.forEach(function(messagingEvent) { 
          MessengerHelper.sendSenderAction(messagingEvent.sender.id, 'mark_seen');
          if (!messagingEvent.message && 
              !messagingEvent.postback &&
              !messagingEvent.referral
             ) {
            //console.log("Webhook received unknown messagingEvent: ", messagingEvent);
            return;
          }

          var user = API.getUser(messagingEvent.sender.id, function (user){
            if (messagingEvent.message) {
              // console.log('received message');
              // console.log(messagingEvent.message);
              // DB.addNewUser(userId);
              ResponseHandler.receivedMessage(user, messagingEvent);

            } else if (messagingEvent.postback) {
             //  console.log('received postback');
              ResponseHandler.receivedPostback(user, messagingEvent);

            } else if (messagingEvent.referral) {
              // console.log('received referral');
              ResponseHandler.receivedReferral(user, messagingEvent);
            }
            else {
              // console.log("Webhook received unknown messagingEvent: ", messagingEvent);
            }
          });
          
        });
      } 
      /*else if(pageEntry.standby) {
        console.log('here');
        pageEntry.standby.forEach(function(messagingEvent) { 
          ResponseHandler.receivedPersistentMenuPayload(messagingEvent);
        });
      }*/
      
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
  else {
    console.log("undefined data");
    res.sendStatus(200);
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

