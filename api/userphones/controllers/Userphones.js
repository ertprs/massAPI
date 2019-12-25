'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findByDate (ctx) {
        try {
            let requestHeader = ctx.request.url
            let filters = requestHeader.replace('/userphones?', '')

            let objNumber = await strapi.services.userphones.findPhoneByDate(filters)
            let count = objNumber.count

            ctx.send({
                numbers: objNumber.data,
                count: count
            });
        } catch (err) {
            ctx.send({
                restult : {
                    status: '500',
                    error: err
                }
            });
        }
    }
};
