"use strict";

var AWS = require("aws-sdk");

AWS.config = new AWS.Config();

AWS.config.accessKeyId = "AKIA2L3LFHVVT3QGMT7J";

AWS.config.secretAccessKey = "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";

AWS.config.region = "us-east-1";

var argv = require("minimist")(process.argv.slice(2));

var originationNumber = "+" + argv.prefixOrigin  + argv.originationNumber;

var destinationNumber =  "+" +  argv.prefixDestination  +  argv.destinationNumber;

console.log(originationNumber)

console.log(destinationNumber)

var message = argv.message;

var applicationId = argv.applicationId;

var messageType = argv.messageType;

var registeredKeyword = argv.registeredKeyword;

var senderId = argv.senderId;

var pinpoint = new AWS.Pinpoint();

var params = {
  ApplicationId: applicationId,
  MessageRequest: {
    Addresses: {
      [destinationNumber]: {
        ChannelType: "SMS"
      }
    },
    MessageConfiguration: {
      SMSMessage: {
        Body: message,
        MessageType: messageType,
        OriginationNumber: originationNumber
      }
    }
  }
};

pinpoint.sendMessages(params, function(err, data) {
  if (err) {
    // console.log(err);
  } else {
    console.log(
      "Message sent! " +
        data["MessageResponse"]["Result"][destinationNumber]["StatusMessage"]
    );
  }
});