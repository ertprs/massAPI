'use strict'
require('dotenv').config()
// const { convertRestQueryParams, buildQuery } = require('strapi-utils');

module.exports = {
    /**
     * Send an email.
     */
    generate: async (ctx) => {
        let result = true

        const currentUser = await strapi.plugins['users-permissions'].services.user.fetch(ctx.request.body.userId);
        // admin User
        const email =process.env.MAIL_SUPER_ADMIN
        try {
            result = await strapi.services.generatenumber.sendMail(currentUser, email)
        } catch (err) {
            result = err
        }

        // Send response to the server.
        ctx.send({
            result
        });
    }
};
