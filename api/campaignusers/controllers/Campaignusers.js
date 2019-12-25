'use strict'

module.exports = {
    /**
     * Send an email.
     */
    getCount: async (ctx) => {
        let url = ctx.request.url.replace('/count-response?', '')
        let campaign = url.replace('campaign=', '');
        try {
            let response = await strapi.services.campaignusers.countResponse(campaign)
            // Send response to the server.
            ctx.send({
                percentage: response.percentage
            });
        } catch (err) {
            ctx.send({
                result: err.message
            });
        }
    }
};
