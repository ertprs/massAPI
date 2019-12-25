'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/services.html#core-services)
 * to customize this service
 */

module.exports = {
    countResponse: async (campaign) => {
        const knexQueryBuilder = strapi.connections.default;
        let count = await knexQueryBuilder.from('campaignusers')
        .whereNotNull('response')
        .where('campaign', campaign)
        .count('*')

        let countFormat = count[0]['count(*)']

        let countAll = await knexQueryBuilder.from('campaignusers')
        .where('campaign', campaign)
        .count('*')

        let total = countAll[0]['count(*)']

        const formatFinal = (countFormat * 100) / total


        let percentage = Math.round(formatFinal * 100) / 100

        return {
            percentage
        }
    }
};
