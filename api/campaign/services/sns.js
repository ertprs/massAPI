// require aws library
var AWS = require("aws-sdk");
// get config file
AWS.config.loadFromPath(__dirname + "/config.json");
// Allow change the region
AWS.config.update({region: 'ap-southeast-2'});
// Create an SNS service object
var sns = new AWS.SNS({ apiVersion: "2010-03-31" });

/*
 * Allow to send a message to a topic
 * Santiago Blanco
 */
function publishMessageToTopic(data) {
  var params = {
    Message: data.message,
    TopicArn: data.topic
  };

  return sns.publish(params).promise();
}

/*
 * Allow subscribe to a topic
 * Santiago Blanco
 */
function subscribeToTopic(topicARN, phoneNumber) {
  var params = {
    Protocol: "sms",
    TopicArn: topicARN,
    Endpoint: phoneNumber
  };
  return sns.subscribe(params).promise();
}

/*
 * Allow subscribe to a topic
 * Santiago Blanco
 */
function unsubscribeToTopic(SubscriptionArn) {
  var params = {
    SubscriptionArn: SubscriptionArn
  };
  return sns.unsubscribe(params).promise();
}

/*
 * Allow create a topic
 * Santiago Blanco
 */
function createTopic(topicName) {
  return sns.createTopic({ Name: topicName }).promise();
}

/*
 * Allow delete a topic
 * Santiago Blanco
 */
function deleteTopic(topicArn) {
  return new AWS.SNS({ apiVersion: "2010-03-31" })
    .deleteTopic({ TopicArn: topicArn })
    .promise();
}

module.exports = {
  publishMessageToTopic,
  createTopic,
  deleteTopic,
  subscribeToTopic,
  unsubscribeToTopic
};