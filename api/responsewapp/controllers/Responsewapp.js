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
            sendMercuryMsg(event, finded, sender)
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
              sendChatAPIMsg(event, finded, sender);
            }
          }
        }
      }
    }
  },

  hookWrapperApi: async ctx => {
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
                sendWrapperAPIMsg(event, finded, sender)
              }
            }
          }
        }
      }
    } catch (e) {
    }
  },

  hookWhatsOfficialApi: async ctx => {
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
                sendWhatsOfficialAPIMsg(event, finded, sender);
              }
            }
          }
        }
      }
    } catch (e) {

    }
  },

  hookTelegramApi: async ctx => {
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
              sendTelegramAPIMsg(event, finded, sender);
            }
          }
        }
      }
    }
  },

  hookWAGOApi: async ctx => {
    try {
      console.log('hookWAGOApi');
      if (ctx.request.body) {
        const event = ctx.request.body;
        console.log(event);
        if (!event.fromMe) {
          const knexQueryBuilder = strapi.connections.default;
          const num = "8616526586273";
          const query = "Select * from senderdata where type='WA.GO' and phone='" + num + "'";
          const senders = await knexQueryBuilder.raw(query);
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            console.log(sender);
            if (sender.conn == "on") {
              const finded = await findMessage(event.message, sender);
              if (finded) {
                sendWAGOAPIMsg(event, finded, sender);
              }
            }
          }
        }
        
      }
    } catch (e) {
      
    }
  }
};

async function findMessage(message, senderData) {
  const asterik = await strapi.services.responsewapp.findOne({ message: '*', autoreply: senderData.autoreply });
  const responses = await strapi.services.responsewapp.find({ autoreply: senderData.autoreply });
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

async function sendMercuryMsg(event, obj, sender) {
  var request = require("request");
  //let user = await strapi.services.senderdata.findOne({ type:  });
  var options = {
    method: "POST",
    url: "https://api.mercury.chat/sdk/whatsapp/sendMessage",
    qs: {
      api_token: senderData.apitoken,
      instance: event.data.instance_number
    },
    headers: {
      "cache-control": "no-cache",
      Connection: "keep-alive",
      Accept: "*/*",
      "Content-Type": "application/json"
    },
    body: { body: obj.response, phone: event.data.author.split("@")[0] },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log('error');
    }
  });
}

async function sendChatAPIMsg(event, obj, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + '/sendMessage?token=' + sender.apitoken,
    body: { body: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

async function sendWrapperAPIMsg(event, obj, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + "/sendmessage/",
    body: { token: sender.apitoken, message: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

async function sendWhatsOfficialAPIMsg(event, obj, sender) {
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
          number: event.number,
          message: obj.response
        }
      ]
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

async function sendTelegramAPIMsg(event, obj, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + "/send_message/",
    body: {
      token: sender.apitoken,
      sender: sender.phone,
      receiver: event.chat.phone,
      message: obj.response
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  })
}

async function sendWAGOAPIMsg(event, obj, sender) {
  console.log(event);
  console.log(obj);
  console.log(sender);
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.endpoint + "/api/send/text",
    body: {
      sessionId: sender.apitoken,
      text: obj.response,
      numberReplyIds: [
        {
          number: event.from,
          replyToMessageId: ''
        }
      ]
    },
    json: true
  };
  request(options, function(error, response, body) {
    if(error) throw new Error(error);
  });
}