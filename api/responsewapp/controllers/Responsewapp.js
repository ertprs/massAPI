"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  hookMercuryApi: async ctx => {
    const event = ctx.request.body;
    if (event.type === "message" && event.data.body && !event.data.fromMe) {
      // find sender
      const query = "Select * from senderdata where type='WA.Mercury'";
      const knexQueryBuilder = strapi.connections.default;
      const senders = await knexQueryBuilder.raw(query);
      if (senders[0]) {
        const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
        if (sender.conn == "on") {
          const finded = await findMessage(event.body, sender);
          if (finded) {
            sendWAMercuryApiMsg(event, finded.response, sender)
          }
        }
      }
    }
  },

  setApiToken: () => {

  },

  hookChatApi: async ctx => {
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      const event = ctx.request.body.messages[0];
      if (event.type === "chat" && event.body && !event.fromMe) {
        const knexQueryBuilder = strapi.connections.default;
        const query = "Select * from senderdata where type='WA.Chat' and name LIKE '%instance" + ctx.request.body.instanceId + "%'";
        const senders = await knexQueryBuilder.raw(query);
        if (senders[0]) {
          const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
          if (sender.conn == "on") {
            const finded = await findMessage(event.body, sender);
            if (finded) {
              sendWAChatApiMsg(event.author.split("@")[0], finded.response, sender);
              ctx.send('Sent');
            } else {
              ctx.send('Message not found');
            }
          } else {
            ctx.send('Sender is off');
          }
        } else {
          ctx.send('Sender not found');
        }
      }
    }
  },

  // hook for WhatsApp Python Api
  hookWAPythonApi: async ctx => {
    try {
      if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
        const event = ctx.request.body.messages[0];

        if (event.type === "chat" && event.body && !event.fromMe) {
          // get sender
          const to = event.to.split("@")[0];
          const query = "Select * from senderdata where type='WA.Python' and phone='" + to + "'";
          const knexQueryBuilder = strapi.connections.default;
          const senders = await knexQueryBuilder.raw(query);
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            if (sender.conn == "on") {
              const finded = await findMessage(event.body, sender);
              if (finded) {
                sendWAPythonApiMsg(event.author.split("@")[0], finded.response, sender);
                ctx.send('Sent');
              } else {
                ctx.send('Message not found');
              }
            } else {
              ctx.send('Sender is off');
            }
          } else {
            ctx.send('Sender not found');
          }
        }
      }
    } catch (e) {
      ctx.send('Error');
    }
  },

  // hook for Telegram Python Api
  hookTGPythonApi: async ctx => {
    try {
      if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
        const event = ctx.request.body.messages[0];
        if (event.type === 'chat' && event.body && !event.fromMe) {
          const knexQueryBuilder = strapi.connections.default;
          const query = "Select * from senderdata where type='TG.Python' and phone='" + event.to.phone + "'";
          const senders = await knexQueryBuilder.raw(query);
  
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            if (sender.conn == "on") {
              const finded = await findMessage(event.body, sender);
              if (finded) {
                sendTGPythonApiMsg(event.chat.phone, finded.response, sender);
                ctx.send('Sent');
              } else {
                ctx.send('Message not found');
              }
            } else {
              ctx.send('Sender is off');
            }
          } else {
            ctx.send('Sender not found');
          }
        }
      }
    } catch(e) {
      ctx.send('Error');
    }
  },

  // hook for WhatsApp Official Api
  hookWAOfficialApi: async ctx => {
    try {
      if (ctx.request.body) {
        const event = ctx.request.body;
        if (event.type === 1 && event['message-in']) {
          const knexQueryBuilder = strapi.connections.default;
          const query = "Select * from senderdata where type='WA.Official' and phone='" + event.owner + "'";
          const senders = await knexQueryBuilder.raw(query);
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            if (sender.conn == "on") {
              const finded = await findMessage(event['message-in'], sender);
              if (finded) {
                sendWAOfficialApiMsg(event.number, finded.response, sender);
                ctx.send('Sent');
              } else {
                ctx.send('Message not found');
              }
            } else {
              ctx.send('Sender is off');
            }
          } else {
            ctx.send('Sender not found');
          }
        }
      }
    } catch (e) {
      ctx.send('Error');
    }
  },

  // hook for WhatsApp GO Api
  hookWAGoApi: async ctx => {
    try {
      if (ctx.request.body) {
        const event = ctx.request.body;
        if (event.fromMe == 'false' || event.fromMe == false) {
          const knexQueryBuilder = strapi.connections.default;
          const query = "Select * from senderdata where type='WA.GO' and phone='" + event.to + "'";
          const senders = await knexQueryBuilder.raw(query);
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            if (sender.conn == "on") {
              const finded = await findMessage(event.text, sender);
              if (finded) {
                console.log('before go whats send');
                sendWaGoApiMsg(event.from, finded.response, sender, 0, "Text", "");
                ctx.send('Sent');
              } else {
                ctx.send('Not found');
              }
            }
          } else {
            ctx.send('Not Found');
          }
        }

      }
    } catch (e) {
      ctx.send('Error');
    }
  },

  // 
  hookWAGOApiOther: async ctx => {
    ctx.send('Find');
  },

  // send bulk message api endpoint
  sendWAGoBulkSendApi: async ctx => {
    try {
      if (ctx.request.body) {
        const senderId = ctx.request.body.senderId;
        const message = ctx.request.body.message;
        const phones = ctx.request.body.phones;
        const times = ctx.request.body.times;
        const delay = ctx.request.body.delay;
        const attachUrl = ctx.request.body.attachUrl;
        const attachType = ctx.request.body.attachType;

        const knexQueryBuilder = strapi.connections.default;
        const query = "Select * from senderdata where id=" + senderId;
        const senders = await knexQueryBuilder.raw(query);
        if (senders[0]) {
          const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
          sendWaGoApiMsgBulk(phones, times, delay, message, sender, attachType, attachUrl);
          ctx.send("sent");
        } else {
          ctx.send("fail");
        }
      }
    } catch (e) {
      ctx.send("fail");
    }
  }
};

// find response
async function findMessage(message, sender) {
  const asterik = await strapi.services.responsewapp.findOne({ message: '*', autoreply: sender.autoreply, blocked: 0 });
  const responses = await strapi.services.responsewapp.find({ autoreply: sender.autoreply, blocked: 0 });
  if (responses) {
    let asterik_order = 99999;
    if (asterik) {
      asterik_order = asterik.order;
    }
    const finded = responses.find(obj => obj.message.toUpperCase().trim() === message.toUpperCase().trim() && obj.order < asterik_order);
    if (finded) {
      return finded;
    } else {
      return asterik;
    }
  } else {
    return asterik;
  }
}

// send whatsapp message via mercury api
async function sendWAMercuryApiMsg(event, message, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: "https://api.mercury.chat/sdk/whatsapp/sendMessage",
    qs: {
      api_token: sender.apitoken,
      instance: event.data.instance_number
    },
    headers: {
      "cache-control": "no-cache",
      Connection: "keep-alive",
      Accept: "*/*",
      "Content-Type": "application/json"
    },
    body: { body: message, phone: event.data.author.split("@")[0] },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log('error');
    }
  });
}

// send whatsapp message via chat api
async function sendWAChatApiMsg(to, message, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + '/sendMessage?token=' + sender.apitoken,
    body: { body: message, phone: to },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

// send whatsapp message via python api
async function sendWAPythonApiMsg(to, message, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + "/sendmessage/",
    body: {
      token: sender.apitoken,
      message: message,
      phone: to
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

// send whatsapp message via official api
async function sendWAOfficialApiMsg(to, message, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint,
    body: {
      token: sender.apitoken,
      application: 8,
      globalmessage: obj.response,
      data: [
        {
          number: to,
          message: message
        }
      ]
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

// send telegram message via python api
async function sendTGPythonApiMsg(to, message, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + "/send_message/",
    body: {
      token: sender.apitoken,
      sender: sender.phone,
      receiver: to,
      message: message
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  })
}

// send whatsapp message and attach via go api
async function sendWaGoApiMsg(to, message, sender, type, attach) {
  var request = require("request");
  var options = createWAGOOption(to, message, sender, type, attach);
  // console.log(options);
  request(options, function (err, resp, body) {
    if (err) {
      // console.log('wago send error');
      // console.log(err);
    } else {
      // console.log('wago sent');
      // console.log(body);
    }
  });
}

// generate whatsapp option for go api
function createWAGOOption(to, message, sender, type, attachUrl) {
  var numOpt = { number: to, replyToMessageId: 'string' };
  // console.log(numOpt);
  if (type == 'Text') {
    return {
      method: "POST",
      url: sender.endpoint + "/api/send/text",
      body: {
        sessionId: sender.apitoken,
        text: message,
        numberReplyIds: [numOpt]
      },
      json: true
    };
  } else if (type == 'Doc') {
    return {
      method: "POST",
      url: sender.endpoint + "/api/send/doc",
      body: {
        sessionId: sender.apitoken,
        doc: attachUrl,
        title: message,
        numberReplyIds: [numOpt]
      },
      json: true
    }
  } else if (type == 'Audio') {
    return {
      method: "POST",
      url: sender.endpoint + "/api/send/audio",
      body: {
        sessionId: sender.apitoken,
        audio: attachUrl,
        numberReplyIds: [numOpt]
      },
      json: true
    }
  } else if (type == 'Video') {
    return {
      method: "POST",
      url: sender.endpoint + "/api/send/video",
      body: {
        sessionId: sender.apitoken,
        video: attachUrl,
        caption: message,
        numberReplyIds: [numOpt]
      },
      json: true
    }
  } else if (type == 'Image') {
    return {
      method: "POST",
      url: sender.endpoint + "/api/send/image",
      body: {
        sessionId: sender.apitoken,
        image: attachUrl,
        caption: message,
        numberReplyIds: [numOpt]
      },
      json: true
    }
  }
}

// send whatsapp bulk message via go api
async function sendWaGoApiMsgBulk(phones, times, delay, message, sender, type, attach) {

  const v = phones.split(/[,]/);
  const count = v.length;
  let arr = [];
  for (var i = 0; i < times; i++) {
    for (var j = 0; j < count; j++) {
      const index = ((i * count) + (j + 1));
      arr.push({
        phone: v[j],
        message: message + "\n-----------" + index + ' / ' + (times * count) + '-------'
      });
    }
  }
  let k = 0;
  console.log('sending ' + (times * count) + ' messages started');
  let func = setInterval(() => {
    console.log('inside internal : ' + (k + 1));
    if (k == times * count) {
      clearInterval(func);
      console.log('sending ' + (times * count) + ' messages ended');
      return 1;
    }
    sendWaGoApiMsg(arr[k].phone, arr[k].message, sender, type, attach);
    k++;
  }, delay);
}