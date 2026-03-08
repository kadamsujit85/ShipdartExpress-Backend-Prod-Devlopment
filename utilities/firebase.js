const admin = require('firebase-admin');
const serviceAccount = require('./shipdart-express-firebase-adminsdk-fbsvc-5d2ce242d7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
