"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  hookMercuryApi: async ctx => {
    let event = ctx.request.body;
    if (event.type === "message" && event.data.body && !event.data.fromMe) {
      console.log('hook mercury api');
      const finded = await findMessage(event.data.body);
      console.log(finded);
      if (finded) {
        sendMercuryMsg(event, finded)
      }
    }
  },
  setApiToken: () => {

  },
  hookChatApi: async ctx => {
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      let event = ctx.request.body.messages[0];
      if (event.type === "chat" && event.body && !event.fromMe) {
        console.log('hook chat api');
        const finded = await findMessage(event.body);
        console.log(finded);
        if (finded) {
          sendChatAPIMsg(event, finded)
        }
      }
    }
  },

  hookWrapperApi: async ctx => {
    console.log('hook wrapper api');
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      let event = ctx.request.body.messages[0];
      if (event.type === "chat" && event.body && !event.fromMe) {
        console.log('hook wrapper api');
        const finded = await findMessage(event.body);
        console.log(finded);
        if (finded) {
          sendChatAPIMsg(event, finded)
        }
      }
    }
  }
};

async function findMessage(message) {
  let knexQueryBuilder = strapi.connections.default;
  let v_messages = await knexQueryBuilder.raw(
    "SELECT * FROM responsewapps where blocked=false order by 'order' asc;"
  );
  if (v_messages[0]) {
    const asterik = v_messages[0].find(obj => obj.message === '*');
    let asterik_order = 99999;
    if (asterik) {
      asterik_order = asterik.order;
    }
    const finded = v_messages[0].find(obj => obj.message.toUpperCase() === message.toUpperCase() && obj.order < asterik_order);
    if (finded) {
      return finded;
    } else {
      return asterik;
    }
  }
}


async function sendMercuryMsg(event, obj) {
  var request = require("request");
  //let user = await strapi.services.senderdata.findOne({ type:  });
  let senderData = await strapi.services.senderdata.findOne({ type: 'Mercury' });
  if (senderData) {
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
        "User-Agent": "PostmanRuntime/7.20.1",
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
}

async function sendChatAPIMsg(event, obj) {
  var request = require("request");
  console.log('here');
  let senderData = await strapi.services.senderdata.findOne({ type: 'ChatAPI' });
  console.log(senderData.name + '/sendMessage?token=' + senderData.apitoken);
  var options = {
    method: "POST",
    url: senderData.name + '/sendMessage?token=' + senderData.apitoken,
    body: { body: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

async function sendWrapperAPIMsg(event, obj) {

}
