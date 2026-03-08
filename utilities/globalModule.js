const mysql = require('mysql');
const nodemailer = require("nodemailer");
const axios = require('axios')
const request = require('request');
const xlsx = require("xlsx");


var applicationkey = process.env.APPLICATION_KEY;

var config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: 'IST',
    multipleStatements: true,
    charset: 'UTF8_GENERAL_CI',
    timeout: 20000,
    port: 3306
}

exports.executeQuery = (query, supportKey, callback) => {
    const connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query);
        connection.query(query, callback);

        //logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}

exports.executeQueryData = (query, data, supportKey, callback) => {
    const connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query, data);
        connection.query(query, data, callback);
        // dbConfig.getConnection(function (error, connection) {
        //     if (error) {
        //         console.log(error);
        //         //connection.release();
        //         throw error;
        //     }

        //     connection.on('error', function (error) {
        //         //conso
        //         throw error;
        //         return;
        //     });
        //     logger.database(query, applicationkey, supportKey);


        //     // dbConfig.end();
        // });
        //con.query(query, callback);
        //console.log(dbConfig.getDB().query(query));
        //if(JSON.stringify(query).startsWith('UPDATE'))
        //if (supportKey)
        //logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}

exports.executeQueryDataAsync = (query, data, supportKey) => {
    const connection = mysql.createConnection(config);

    return new Promise((resolve, reject) => {
        connection.connect(err => {
            if (err) return reject(err);

            const queryData = Array.isArray(data) ? data : [data];

            connection.query(query, queryData, (error, results) => {
                connection.end();
                if (error) return reject(error);
                resolve(results);
            });
        });
    });
};

exports.rollbackConnection = (connection) => {
    try {
        connection.rollback(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.commitConnection = (connection) => {
    try {
        connection.commit(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.openConnection = () => {
    try {
        const con = mysql.createConnection(config);
        con.connect();
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
        });
        return con;
    }
    catch (error) {
        console.error(error);
    }
}

exports.executeDQL = (query, supportKey, callback) => {
    var con = this.openConnection();
    //counter += 1;
    // console.log("Counter = " + counter);
    try {
        console.log(query);

        con.query(query, callback);
        //console.log(dbConfig.getDB().query(query));
        //if(JSON.stringify(query).startsWith('UPDATE'))
        // if (supportKey)
        //     logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Error : -" + error)
    }
    finally {
        con.end();
    }
}

exports.executeDML = (query, data, supportKey, connection, callback) => {
    try {
        console.log(query, data);
        connection.query(query, data, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        callback(error);
    } finally {
        // dbConfig.end();
    }
}

exports.getSystemDate = function () {
    let date_ob = new Date();
    // current date 
    // adjust 0 before single digit date
    let day = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);
    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    date_cur = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return date_cur;
}

exports.geFormattedDate = function (dat1) {
    let date_ob = new Date(dat1);
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);
    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    date_cur = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return date_cur;
}

exports.getTimeDate = function () {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getYear().toString().slice(-2);
    let hours = ("0" + date_ob.getHours()).slice(-2);
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    let milliseconds = ("0" + date_ob.getMilliseconds()).slice(-2);
    date_cur = year + month + date + hours + minutes + seconds + milliseconds;
    return date_cur;
}
//get Intermediate dates 
exports.intermediateDates = function (startDate, endDate) {
    //console.log("intermediate" + startDate + " "+endDate);
    var startDatea = new Date(startDate); //YYYY-MM-DD
    var endDatea = new Date(endDate); //YYYY-MM-DD
    var getDateArray = function (start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            var tempDate = new Date(dt);
            let date = ("0" + tempDate.getDate()).slice(-2);
            // current month
            let month = ("0" + (tempDate.getMonth() + 1)).slice(-2);
            // current year
            let year = tempDate.getFullYear();
            arr.push(year + "-" + month + "-" + date);
            dt.setDate(dt.getDate() + 1);
        }
        console.log(arr);
        return arr;
    }

    var dateArr = getDateArray(startDatea, endDatea);
    return dateArr;
}

exports.getNumberInWords = function (number) {
    var arr = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eight', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
    return arr[number - 1];
}

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SHIPDART_EMAIL,
        pass: process.env.SHIPDART_PASSWORD
    },
});

exports.sendEmail = async (subject, body, mailId, callback) => {

    try {
        // const mailOptions = {
        //     from: process.env.SHIPDART_EMAIL,
        //     to: mailId,
        //     subject: subject,
        //     html: body
        // };

        // transporter.sendMail(mailOptions, (error, mail) => {
        //     if (error) {
        //         callback(error)
        //         console.log('Error:', error);
        //     } else {
        //         console.log('Email sent:', mail.response);
        //         callback()
        //     }
        // });

        const sendMail = await axios.post('https://demo.pickupkart.co.in/sendEmail', {
            "EMAIL_ID": mailId,
            "SUBJECT": subject,
            "MESSAGE": body
        })
        if (sendMail.data.code == 200) {
            callback()
        }
        else {
            callback(error)
        }
    } catch (error) {
        console.log("Error : -" + error)
    }
}

exports.sendWhatsAppTemplate_old = (sendTo, templateName, templateData) => {

    // templateData = [
    //     { type: "text", text: name },
    //     { type: "text", text: orderId }
    // ]


    const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
    };

    const body = {
        messaging_product: "whatsapp",
        to: sendTo,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "en_US"
            },
            components: [
                {
                    type: "body",
                    parameters: templateData
                }
            ]
        }
    };

    const options = {
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    };

    request(options, (error, response, body) => {
        if (error) {
            console.log(error);
            this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, templateData, templateName, null, 0, body], supportKey, (error, failedEntry) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("fail to send whatsapp msg.");
                }
            })
        }
        else {
            const parsed = JSON.parse(body);
            console.log("whatsapp Response:", parsed);

            this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, templateData, templateName, null, 1, body], supportKey, (error, successEntry) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("whatsapp msg sent successfully.");
                }
            })
        }
    });
}

exports.sendWhatsAppTemplate = (sendTo, templateName, templateData, supportKey) => {
    // templateData = [
    //     { type: "text", text: name },
    //     { type: "text", text: orderId }
    // ]

    const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
    };

    const body = {
        messaging_product: "whatsapp",
        to: sendTo,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "en_US"
            },
            components: [
                {
                    type: "body",
                    parameters: templateData
                }
            ]
        }
    };

    const options = {
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error("Request error:", error);
            this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 0, body], supportKey, (err) => {
                if (err) console.error("DB Error:", err);
                else console.log("Failed to send WhatsApp message.");
            });
        }
        else {
            let parsed;
            try {
                parsed = JSON.parse(body);
            } catch (e) {
                console.error("Failed to parse response:", body);
                parsed = {};
            }
            console.log("WhatsApp Response:", parsed);

            this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 1, body], supportKey, (err) => {
                if (err) console.error("DB Error:", err);
                else console.log("WhatsApp message sent successfully.");
            });
        }
    });
};

exports.formatInvoiceDate = (dateString) => {
    if (!dateString) return "";

    const dateObj = new Date(dateString.replace(" ", "T"));

    return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

exports.sendWSMS = (sendTo, templateName, templateData, encoding, customerId) => {
    const systemDate = this.getSystemDate()
    var supportKey = process.env.SUPPORT_KEY;
    var options = {
        url: process.env.GM_API + 'sendWSms',
        headers: {
            "apikey": process.env.GM_API_KEY,
            "supportkey": supportKey,
            "applicationKey": process.env.APPLICATION_KEY
        },
        body: {
            "w_sms_key": process.env.W_SMS_KEY,
            "send_to": sendTo,
            "template_name": templateName,
            "template_data": templateData,
            "encoding": encoding
        },
        json: true
    };

    const connection = this.openConnection();
    this.executeDML(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, CUSTOMER_ID) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 1, customerId], supportKey, connection, (error, insertWhatsappHistory) => {
        if (error) {
            console.error("DB Error:", error);
            this.rollbackConnection(connection)
        }
        else {
            if (!customerId) {
                request.post(options, (error, response, body) => {
                    if (body.code != 200 || error) {
                        this.rollbackConnection(connection);
                        console.error("Request error:", error);
                        this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA, CUSTOMER_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 0, JSON.stringify(body), customerId], supportKey, (error) => {
                            if (error) {
                                console.error("DB Error:", error);
                            }
                            else {
                                console.log("Failed to send WhatsApp message.");
                            }
                        });
                    }
                    else {
                        this.commitConnection(connection);
                        this.executeQueryData(`update whatsapp_messages_history set RESPONSE_DATA = ? where ID = ?`, [JSON.stringify(body), insertWhatsappHistory.insertId], supportKey, (error, updateWhatsappDetails) => {
                            if (error) {
                                console.error("DB Error:", error);
                            }
                            else {
                                console.log("WhatsApp message sent successfully.");
                            }
                        })
                    }
                });
            }
            else {
                this.executeDML(`update wallet_master set BALANCE = BALANCE - 1 where CUSTOMER_ID = ?`, customerId, supportKey, connection, (error, updateWalletAmount) => {
                    if (error) {
                        console.error("DB Error:", error);
                        this.rollbackConnection(connection)
                    }
                    else {
                        this.executeDML(`insert into transaction_master(CUSTOMER_ID, TRASACTION_TYPE, AMOUNT, EFFECT, TRANSACTION_DATETIME, CREATED_MODIFIED_DATE) values(?,?,?,?,?,?)`, [customerId, 'WA', 1, 'D', systemDate, systemDate], supportKey, connection, (error, insertTransaction) => {
                            if (error) {
                                console.log(error);
                                this.rollbackConnection(connection);
                            }
                            else {
                                request.post(options, (error, response, body) => {
                                    if (body.code != 200 || error) {
                                        this.rollbackConnection(connection);
                                        console.error("Request error:", error);
                                        this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA, CUSTOMER_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 0, JSON.stringify(body), customerId], supportKey, (error) => {
                                            if (error) {
                                                console.error("DB Error:", error);
                                            }
                                            else {
                                                console.log("Failed to send WhatsApp message.");
                                            }
                                        });
                                    }
                                    else {
                                        this.commitConnection(connection);
                                        this.executeQueryData(`update whatsapp_messages_history set RESPONSE_DATA = ? where ID = ?`, [JSON.stringify(body), insertWhatsappHistory.insertId], supportKey, (error, updateWhatsappDetails) => {
                                            if (error) {
                                                console.error("DB Error:", error);
                                            }
                                            else {
                                                console.log("WhatsApp message sent successfully.");
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                })
            }
        }
    });
}

exports.sendMediaWSMS = (sendTo, templateName, templateData, encoding, customerId, mediaData) => {
    const systemDate = this.getSystemDate()
    var supportKey = process.env.SUPPORT_KEY;
    var options = {
        url: process.env.GM_API + 'sendMediaWSms',
        headers: {
            "apikey": process.env.GM_API_KEY,
            "supportkey": supportKey,
            "applicationKey": process.env.APPLICATION_KEY
        },
        body: {
            "w_sms_key": process.env.W_SMS_KEY,
            "send_to": sendTo,
            "template_name": templateName,
            "template_data": templateData,
            "encoding": encoding,
            "mediaData": mediaData
        },
        json: true
    };
    console.log("options", mediaData);
    const connection = this.openConnection();
    this.executeDML(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, CUSTOMER_ID) VALUES (?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 1, customerId], supportKey, connection, (error, insertWhatsappHistory) => {
        if (error) {
            console.error("DB Error:", error);
            this.rollbackConnection(connection)
        }
        else {
            request.post(options, (error, response, body) => {
                if (body.code != 200 || error) {
                    this.rollbackConnection(connection);
                    console.error("Request error:", error);
                    this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO, PARAMS, TEMPLATE_NAME, MEDIA_LINK, STATUS, RESPONSE_DATA, CUSTOMER_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`, [sendTo, JSON.stringify(templateData), templateName, null, 0, JSON.stringify(body), customerId], supportKey, (error) => {
                        if (error) {
                            console.error("DB Error:", error);
                        }
                        else {
                            console.log("Failed to send WhatsApp message.");
                        }
                    });
                }
                else {
                    this.commitConnection(connection);
                    this.executeQueryData(`update whatsapp_messages_history set RESPONSE_DATA = ? where ID = ?`, [JSON.stringify(body), insertWhatsappHistory.insertId], supportKey, (error, updateWhatsappDetails) => {
                        if (error) {
                            console.error("DB Error:", error);
                        }
                        else {
                            console.log("WhatsApp message sent successfully.");
                        }
                    })
                }
            });
        }
    });
}

exports.importExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return sheetData;
}