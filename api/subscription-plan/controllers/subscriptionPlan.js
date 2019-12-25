'use strict'

// const { convertRestQueryParams, buildQuery } = require('strapi-utils');

module.exports = {
    /**
     * Send an email.
     */
    send: async (ctx) => {
        let result = {
            status: 200,
            result: true
        }
        
        let confirmation = ctx.request.body.confirmation
        // test
        //let confirmation = 'COSU.23eef2f6-2e1b-4e8b-8698-6c751a13c812'

        const currentUser = await strapi.plugins['users-permissions'].services.user.fetch(ctx.request.body.user);
        const email = currentUser.email
        try {
            await strapi.services.subscriptionplan.sendMail(email, currentUser, confirmation);
        } catch(err) {
            result = err;
        }
        
        ctx.send({
            result
        });
    }
};
