const express = require('express');
const app = express();
exports.jwt = require('jsonwebtoken');
const helmet = require('helmet');
exports.dotenv = require('dotenv').config();
exports.applicationkey = process.env.APPLICATION_KEY;
const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const dbname = process.env.MYSQL_DATABASE;
const path = require('path');
const cors = require('cors');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(cors());
const schedule = require('node-schedule');
// const server = http.createServer(app);

const job = schedule.scheduleJob('*/30 * * * *', () => {
  require('./services/global').updateTrackingDetails()
});

const job2 = schedule.scheduleJob("0 1 * * *", function () {
  console.log("Job executed at 1:00 AM!");
  require('./services/global').scheduleDelhiveryOrders()
});


//routes
const globalRoutes = require('./routes/global');
app.use('/static', express.static(path.join(__dirname, './uploads')));
app.use('/', function timeLog(req, res, next) {
  var supportKey = req.headers['supportkey'];
  console.log("Requested time:", new Date().toLocaleString(), "Requested Method : -", req.method, req.url, " public Ip :", req.connection.remoteAddress, " supportkey : ", supportKey);
  let oldSend = res.send;
  res.send = function (data) {
    var txtJson = {
      method: req.method,
      route: req.url,
      date_time: require('./utilities/globalModule').getSystemDate(),
      request_headers: req.headers,
      request_body: req.body,
      response: data
    }
    var startdate = new Date();
    var filename = startdate.toLocaleString(undefined, { day: '2-digit' }) + '_' + startdate.toLocaleDateString(undefined, { month: 'short' }) + '_' + startdate.toLocaleDateString(undefined, { year: 'numeric' });
    oldSend.apply(res, arguments)
  }
  next();
});
app.use('/', globalRoutes);
app.use(helmet());
app.disable('x-powered-by');

app.listen(port, hostname, () => {
  console.log('Shipdart-Express listening on', hostname, port, '!');
  console.log("Database:", dbname);
});