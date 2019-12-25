'use strict';

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
    pay: async (ctx) => {
        const currentUser = await strapi.plugins['users-permissions'].services.user.fetch(ctx.request.body.userId);
        let result = {}
        try {
            result = await strapi.services.stripe.pay(ctx.request.body, ctx.request.body.email, currentUser);
        } catch(err) {
            result = err;
        }
        
        ctx.send({
            result
        });
    },
    hook: (ctx) => {
        let event = ctx.request.body;
        // Handle the event
        switch (event.type) {
        case 'payment_method.attached':
            const payment_method = event.data.object;
            strapi.services.stripe.handlePaymentMethodAttached(payment_method);
            break;
        default:
            // Unexpected event type
            ctx.send({
                status: '404',
                message: 'Insert hook failed.'
            });
        }
    },
    getCounterSMS: (ctx) => {
        let campaign = ctx.request.body.campaign;
        strapi.services.stripe.getCountNumberNumberShipments(campaign);
    }
};
