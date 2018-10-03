const config = require('./config');
const request = require('request');

exports.sendSenderAction = function(psid, action) {
  let messageObj = {
      recipient: {
        id: psid,
      },
      sender_action: action
    };  
  const options = {
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.9/me/messages',
    qs: { access_token: config.PAGE_ACCESS_TOKEN },
    json: messageObj
  }
  
  request(options, function(err, res, body) {
    console.log("Message Sent");
    console.log(body);
  });
};

exports.sendMessageText = function(psid, message) {
  let messageObj = {
    recipient: {
      id: psid,
    },
    message: {
      text: message
    }
  };
      
  const options = {
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.9/me/messages',
    qs: { access_token: config.PAGE_ACCESS_TOKEN },
    json: messageObj
  }
  this.sendSenderAction(psid, 'typing_on');
  setTimeout(function () {
    request(options, function(err, res, body) {
      console.log("Message Sent");
      console.log(body);
    });
  }, 800); 
  
  
}

exports.sendMessageObj = function(psid, message) {
  let messageObj = {
      recipient: {
        id: psid,
      },
      message: message
    };  
  const options = {
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.9/me/messages',
    qs: { access_token: config.PAGE_ACCESS_TOKEN },
    json: messageObj
  }
  
  this.sendSenderAction(psid, 'typing_on');
  setTimeout(function () {
    request(options, function(err, res, body) {
      console.log("Message Sent");
      console.log(body);
    });
  }, 800); 
  
};
