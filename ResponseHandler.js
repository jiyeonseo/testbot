const MessengerHelper = require('./MessengerHelper');
const API = require('./API');
const translations = require('./translations');
var nodemailer = require('nodemailer');

function profile_replace(user, text) {
  var out = text.replace('USER_FIRST_NAME', user['first_name']);
  out = out.replace('USER_LAST_NAME', user['last_name']);
  return out;
}

function translate(user, text) {
  switch (user.locale) {
    case 'th_TH': 
      if (translations.dict['th_TH'][text] !== null) {
        return profile_replace(user, translations.dict['th_TH'][text]);
      }
      else {
        return profile_replace(user, translations.dict['th_TH']['bad_request']);
      }
    default:
      if (translations.dict['en_US'][text] !== null) {
        
        var x = profile_replace(user, translations.dict['en_US'][text]);
        return profile_replace(user, translations.dict['en_US'][text]);
      }
      else {
        return profile_replace(user, translations.dict['en_US']['bad_request']);
      }
  }
}

function get_started(user, psid, messagingEvent) {
  var response_text = translate(user, 'luckydraw_intro');
  var obj = {
    "text": response_text,
    "quick_replies":[
      {
        "content_type":"user_phone_number"
      }
    ]
  }
  MessengerHelper.sendMessageObj(psid, obj);
  API.sendAppEvent(psid, 'fb_mobile_content_view');
  API.sendAppEvent(psid, 'Visit');
}


exports.receivedMessage = function(user, messagingEvent) {

  const psid = messagingEvent.sender.id;
  if (messagingEvent.message !== null && !messagingEvent.message.is_echo) {
    var phone_number = messagingEvent.message.text;
    console.log('!!!');
    console.log(phone_number);
    phone_number = phone_number.replace('+', '');
    phone_number = phone_number.replace(' ', '');
    phone_number = phone_number.replace('(', '');
    phone_number = phone_number.replace(')', '');

    if (isNaN(phone_number)) { 
      var response_text = translate(user, 'bad_request');
      MessengerHelper.sendMessageText(psid, response_text);
      return;
    }

    var response_text = translate(user, 'luckydraw_success');
    MessengerHelper.sendMessageText(psid, response_text);
    API.sendAppEvent(psid, 'fb_mobile_add_to_cart');
    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'retailmebot@gmail.com',
        pass: 'R3tailM3B0t'
      }
    });

    var mailOptions = {
      from: 'retailmebot@gmail.com',
      to: 'nthieu@fb.com,ljwong@fb.com',
      subject: '[Wild Goose] Retail Demo',
      text: `${user.first_name} ${user.last_name} \t ${messagingEvent.message.text}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } 
}

exports.receivedPostback = function(user, messagingEvent) {
  const psid = messagingEvent.sender.id;
  // MessengerHelper.sendMessageObj(messagingEvent.sender.id, createButtonTemplate('a',[createPostbackButton('Search12','start_buy')]));
  console.log('postback logging');
  // console.log(messagingEvent);
  if(messagingEvent.postback !== 'undefined') {
    switch(messagingEvent.postback.payload) {
      case 'GET_STARTED0':
        // console.log('received Getting Started');
        var response_text = translate(user, 'welcome');
        
        MessengerHelper.sendMessageText(psid, response_text);
        
        if (messagingEvent.postback.referral) {
          setTimeout(function () {
            get_started(user, psid, messagingEvent);
          }, 1000);
          // console.log(messagingEvent.postback.referral);
          // get_started(user, psid, messagingEvent);
        }
        
        break;
    }
  }
};

exports.receivedReferral = function(user, messagingEvent) {
  const psid = messagingEvent.sender.id;
  
  // console.log(messagingEvent);
  if(messagingEvent.referral !== 'undefined') {
    var ref = messagingEvent.referral.ref;
    var ref_json = JSON.parse(ref);
    if (ref_json.ev === null) {
      return;
    }
    
    switch (ref_json.ev) {
      case 'visit': 
        get_started(user, psid, messagingEvent);
        break;
      case 'redemption':
        var response_text = translate(user, 'thankyou');
        MessengerHelper.sendMessageText(psid, response_text); 
        API.sendAppEvent(psid, 'fb_mobile_purchase');
        API.sendAppEvent(psid, 'Redemption');
        break;
    }

    //API.sendAppEvent(psid, 'fb_mobile_purchase');
  }
};

exports.receivedPersistentMenuPayload = function(user, messagingEvent) {
  const psid = messagingEvent.sender.id;
  // MessengerHelper.sendMessageObj(messagingEvent.sender.id, createButtonTemplate('a',[createPostbackButton('Search12','start_buy')]));
  if(messagingEvent.postback !== 'undefined') {
    switch(messagingEvent.postback.title) {
      case 'Get Started':
        var response_text = translate(user, 'welcome');
        MessengerHelper.sendMessageText(psid, response_text);
        setTimeout(function () {
            get_started(user, psid, messagingEvent);
        }, 1000);
        
        
        // console.log('received Getting Started');
        // var response_text = 'Here is how you can get started.';
        // if (messagingEvent.postback.referral) {
        //   console.log(messagingEvent.postback.referral);
        //   response_text += messagingEvent.postback.referral.ref;
        // }
        
        //MessengerHelper.sendMessageText(psid, response_text);
        break;
        
    }
  }
};



/*


received message

{ sender: { id: '713785838745651' },

  recipient: { id: '231862483906243' },

  timestamp: 1524628563415,

  message: 

   { mid: 'mid.$cAADS4LezsMBpLDbt11i-vGl7H3bX',

     seq: 335249,

     text: 'testing' } }
     
     
     
     
     
     "messaging": [
        {
          "sender": {
            "id": "1254459154682919"
          },
          "recipient": {
            "id": "682498171943165"
          },
          "timestamp": 1502905976377,
          "message": {
            "quick_reply": {
              "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
            },
            "mid": "mid.$cAAJsujCd2ORkHXKOOVd7C1F97Zto",
            "seq": 9767,
            "text": "Green"
          }
        }
      ]
*/
      
    
      
    