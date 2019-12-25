'use strict'

// const { convertRestQueryParams, buildQuery } = require('strapi-utils');

module.exports = {
    /**
     * Send an email.
     */
    send: async (ctx) => {
        const newPass = Math.random().toString(36).slice(-8);
        let result = true
        let status = 200;
        const currentUser = await strapi.plugins['users-permissions'].services.user.fetch(ctx.request.body);

        if (currentUser) {
            await strapi.plugins['users-permissions'].services.user.edit(currentUser, { password: newPass });
            await strapi.services.resetpassword.sendMail(ctx.request.body.email, newPass);
        } else {
            result = false;
            status = 404;
        }

        // Send response to the server.
        ctx.send({
            result,
            status
        });
    }
};
