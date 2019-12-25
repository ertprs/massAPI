"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  hook: async ctx => {
    console.log('hook');
    console.log(ctx.request.body);
    let event = ctx.request.body;

    if (event.type === "message" && event.data.body && !event.data.fromMe) {
      let message = event.data.body;

      let knexQueryBuilder = strapi.connections.default;
      let v_messages = await knexQueryBuilder.raw(
        "SELECT * FROM responsewapps order by 'order' asc;"
      );

      console.log(v_messages)

      if (v_messages[0]) {
        var finded = v_messages[0].find(obj => {
          if (message.toUpperCase() === obj.message.toUpperCase()) {
            return obj
          }
        });
        if (finded == undefined || finded == null) {
          finded = v_messages[0].find(obj => obj.message === '*');
        }
        if (finded) {
          sendMsg(event, finded)
        }
      }
    }
  },
  setApiToken: () => {

  },
  hookChatApi: async ctx => {
    console.log('hook');
    if (ctx.request.body && ctx.request.body.messages && ctx.request.body.messages.length > 0) {
      let event = ctx.request.body.messages[0];
      // console.log(event);

      if (event.type === "chat" && event.body && !event.fromMe) {
        let message = event.body;

        let knexQueryBuilder = strapi.connections.default;
        let v_messages = await knexQueryBuilder.raw(
          "SELECT * FROM responsewapps order by 'order' asc;"
        );

        // console.log(v_messages)

        if (v_messages[0]) {
          var finded = v_messages[0].find(obj => {
            if (message.toUpperCase() === obj.message.toUpperCase()) {
              return obj
            }
          });
          if (finded == undefined || finded == null) {
            finded = v_messages[0].find(obj => obj.message === '*');
          }
          if (finded) {
            sendMsg(event, finded)
          }
        }
      }
    }
  },
};


async function sendMsg(event, obj) {
  var request = require("request");
  let user = await strapi.services.senderdata.findOne({ id: 1 });
  // console.log('entra')
  var options = {
    method: "POST",
    url: " https://eu8.chat-api.com/instance86074/sendMessage?token=4kuv9u2yfxervwek",
    body: { body: obj.response, phone: event.author.split("@")[0] },
    json: true
  };

  // console.log(event);
  // console.log(obj.response);
  // console.log(event.author.split("@")[0]);

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
}
