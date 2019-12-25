'use strict';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const path = require('path');
const nodemailer = require('nodemailer');

const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');

const readHTMLFile = async (path) => {
  return await fs.readFileSync(path, { encoding: 'utf-8' });
};

/**
 * Read the documentation () to implement custom service functions
 */

 // SELECT SUM(numberShipments) FROM `campaignusers` WHERE campaign = 3
const calculateOrderAmount = async idPlan => {
    let plans = await stripe.plans.list()
    let localPlan = await strapi.services.plan.findOne(idPlan)

    return plans.data.filter(plan => {
        if (plan.nickname && lowerCaseName(plan.nickname) === localPlan.name) {
            return plan
        }
    })
};

const lowerCaseName = planName => {
    return planName.toLowerCase()
}

module.exports = {
    pay: async (req, email) => {
        const { token, idPlan } = req;
        let res = {
            status: true
        };
        const idStripePlan = calculateOrderAmount(idPlan);

        let customer = await stripe.customers.create({
            email: email,
            source: token
        })

        if (customer) {
            let subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{
                    plan: idStripePlan 
                }]
            })

            if (subscription) {
                res = subscription
            } else {
                res = {
                    status: '400',
                    message: "Subscription failed, check your fields."
                }
            }
        } else {
            res = {
                status: '400',
                message: "Customer wasn't created, check your fields."
            }
        }

        return res;
    },
    handlePaymentMethodAttached: async (paymentMethod) => {
        let result = {}
        try{
            let customer = await stripe.customers.retrieve(paymentMethod.customer);
            await sendMail(customer.email)
            result = {
                status: '200',
                message: 'Send Success.'
            }
        } catch (err) {
            result = err
        }

        return result
    },
    getMsgSent: () => {
        try {

        } catch (err) {
            
        }
    },
    getCountNumberNumberShipments: (campaign) => {
        // const knexQueryBuilder = strapi.connections.default;
        // let count = await knexQueryBuilder.from('campaignusers')
        // .where('campaign', campaign)
        // .select('SUM(numberShipments)')

        // console.log(count);
    }
};

const sendMail = async (to) => {
    let emailConfig = {};

    let currentUser = await strapi.plugins['users-permissions'].services.user.fetch(to);
    if (strapi.config.environment === 'development') {
        emailConfig = strapi.config.environments.development;
    } else if (strapi.config.environment === 'production') {
        emailConfig = strapi.config.environments.production; 
    }

    const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE, // use SSL
    auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    }));

    let templateDir = path.join(__dirname, '../', 'templates', 'invoiceByPayment.html');

    let html = await readHTMLFile(templateDir);

    var template = handlebars.compile(html);
    var replacements = {
            id: currentUser.id,
            name: currentUser.username,
            email: currentUser.email,
            plan: currentUser.plan.name
    };
    var htmlToSend = template(replacements);
    var mailOptions = {
        from: process.env.MAIL_USERNAME,
        to,
        subject : 'Invoice Plan',
        html : htmlToSend
    };
    
    return await transporter.sendMail(mailOptions);
  }
