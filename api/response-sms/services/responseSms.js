
module.exports = {
      setResponsesInNumbers : (body) => {
      const destination = body.destinationNumber.replace("+", "")
      const origination = body.originationNumber.replace("+", "")

      const message = body.messageBody

      const knexQueryBuilder = strapi.connections.default;

      return knexQueryBuilder.from('campaignusers')
      .innerJoin('campaigns', 'campaigns.id', 'campaignusers.campaign')
      .where('campaigns.phoneNumber', destination)
      .where('campaignusers.phone', origination)
      .select('campaignusers.*')
      .update({ response: message })
    }
};
