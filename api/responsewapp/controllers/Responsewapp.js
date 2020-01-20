"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  hookMercuryApi: async ctx => {
    let event = ctx.request.body;
    if (event.type === "message" && event.data.body && !event.data.fromMe) {
      // find sender
      let query = "Select * from senderdata where type='WrapperAPI'";
      let knexQueryBuilder = strapi.connections.default;
      let senders = await knexQueryBuilder.raw(query);
      if (senders[0]) {
        const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
        const finded = await findMessage(event.body, sender);
        if (finded) {
          sendMercuryMsg(event, finded, sender)
        }
      }
    }
  },
  setApiToken: () => {

  },

  hookChatApi: async ctx => {
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      let event = ctx.request.body.messages[0];
      if (event.type === "chat" && event.body && !event.fromMe) {
        let knexQueryBuilder = strapi.connections.default;
        let query = "Select * from senderdata where type='ChatAPI' and name LIKE '%instance" + ctx.request.body.instanceId + "%'";
        let senders = await knexQueryBuilder.raw(query);
        if (senders[0]) {
          const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
          const finded = await findMessage(event.body, sender);
          if (finded) {
            sendChatAPIMsg(event, finded, sender);
          }
        }
      }
    }
  },

  hookWrapperApi: async ctx => {
    try {
      if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
        let event = ctx.request.body.messages[0];
        if (event.type === "chat" && event.body && !event.fromMe) {
          // get sender
          const to = event.to.split("@")[0];
          let query = "Select * from senderdata where type='WrapperAPI' and phone='+" + to + "'";
          let knexQueryBuilder = strapi.connections.default;
          let senders = await knexQueryBuilder.raw(query);
          if (senders[0]) {
            const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
            const finded = await findMessage(event.body, sender);
            if (finded) {
              sendWrapperAPIMsg(event, finded, sender)
            }
          }
        }
      }
    } catch (e) {
    }
  },

  hookWhatsOfficialApi: async ctx => {
    try {

    } catch (e) {

    }
  },

  hookTelegramApi: async ctx => {
    console.log(ctx.request.body);
    // console.log('telegram');
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      let event = ctx.request.body.messages[0];
      console.log(event);
      if (event.type === 'chat' && event.body) {
        console.log(event);
        let knexQueryBuilder = strapi.connections.default;
        let query = "Select * from senderdata where type='TelegramAPI'";
        let senders = await knexQueryBuilder.raw(query);

        if(senders[0]) {
          const sender = Object.values(JSON.parse(JSON.stringify(senders[0])))[0];
          console.log(sender);
          const finded = await findMessage(event.body, sender);
          console.log(finded);
          if (finded) {
            sendTelegramAPIMsg(event, finded, sender);
          }
        }
      }
    }
  }
};

async function findMessage(message, senderData) {
  let asterik = await strapi.services.responsewapp.findOne({ message: '*' });
  let responses = await strapi.services.responsewapp.find({ senderdata: senderData.id });
  if (responses) {
    let asterik_order = 99999;
    if (asterik) {
      asterik_order = asterik.order;
    }
    const finded = responses.find(obj => obj.message.toUpperCase() === message.toUpperCase() && obj.order < asterik_order);
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
    url: sender.name + '/sendMessage?token=' + sender.apitoken,
    body: { body: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

async function sendWrapperAPIMsg(event, obj, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.name + "/sendmessage/",
    body: { token: sender.apitoken, message: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

async function sendWhatsOfficialAPIMsg(event, obj, sender) {

}

async function sendTelegramAPIMsg(event, obj, sender) {
  var request = require("request");
  var options = {
    method: "POST",
    url: sender.name + "/send_message",
    body: {
      token: sender.apitoken,
      message: obj.response,
      receiver: event.chat.phone,
      sender: sender.phone
    }
  };
  request(options, function(error, response, body) {
    if(error) throw new Error(error);
    console.log(body);
  })
}