'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/services.html#core-services)
 * to customize this service
 */

module.exports = {
    findPhoneByDate: async (filters) => {
        let currentDate = new Date()

        const knexQueryBuilder = strapi.connections.default

        let filtersArray = filters.split('&')

        let userCondition = filtersArray[0].split('=')

        let data = []

        if (filtersArray[1]) {
            let start = filtersArray[1].split('=')
            let limit = filtersArray[2].split('=')
    
            data = await knexQueryBuilder.from('userphones')
            .where(userCondition[0], '=', userCondition[1])
            .where('dateEnd', '>=', currentDate)
            .limit(parseInt(limit[1]))
            .offset(parseInt(start[1]))
            .select('*')
        } else {
            data = await knexQueryBuilder.from('userphones')
            .where(userCondition[0], '=', userCondition[1])
            .where('dateEnd', '>=', currentDate)
            .select('*')
        }
    

        let count =  await knexQueryBuilder.from('userphones')
        .where(userCondition[0], '=', userCondition[1])
        .where('dateEnd', '>=', currentDate)
        .count('*')

        let countFormat = count[0]['count(*)']

        return {
            count: countFormat,
            data
        }
    }
};
