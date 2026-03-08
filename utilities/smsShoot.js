// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
exports.dotenv = require('dotenv').config();

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = "AC8e8b61d26aab8e4852a7118072c9c5ec"
// const authToken = "a8123716fb3705c2c7f6beffbb9b45ee";
// const client = twilio(accountSid, authToken);
// console.log(accountSid, authToken);


// async function createMessage() {
//     const accountSid = 'AC8e8b61d26aab8e4852a7118072c9c5ec';
//     const authToken = 'a8123716fb3705c2c7f6beffbb9b45ee';
//     const client = require('twilio')(accountSid, authToken);
//     client.messages
//         .create({
//             body: 'Ahoy 👋',
//             messagingServiceSid: 'MGfeb56b6d0a05ad39c0971d900f86f86d',
//             to: '+919890011747'
//         })
//         .then(message => console.log(message.sid));
// }

// createMessage();


