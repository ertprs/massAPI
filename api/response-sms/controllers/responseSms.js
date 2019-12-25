'use strict'

// const { convertRestQueryParams, buildQuery } = require('strapi-utils');

module.exports = {
    /**
     * Send an email.
     */
    setResponses: async (ctx) => {
        try {
            let response = await strapi.services.responsesms.setResponsesInNumbers(ctx.request.body)
            console.log('User response: >>>>>', ctx.request.body)
            ctx.send({
                restult : {
                    status: true,
                    changed: response
                }
            });
        } catch (err) {
            ctx.send({
                restult : {
                    status: true,
                    error: err
                }
            });
        }

    }
};
