const mm = require('./globalModule');
const logger = require('../utilities/logger');

exports.sendOrderPlacedMessage = (orderId) => {
    const supportKey = 23456;
    try {
        if (orderId && orderId != ' ') {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, PICKUP_CITY_NAME, CITY_NAME, SHIPPING_DATETIME, MOBILE_NO from view_order_master where ID = ?`, orderId, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                }
                else {
                    if (getOrderDetails.length > 0) {
                        mm.executeQueryData(`select ID from customer_whatsapp_configuration_details where CUSTOMER_ID = ? AND STATUS = 1 AND SHIPMENT_CREATED = 1`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getConfiguration) => {
                            if (error) {
                                console.log(error);
                                // logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                            }
                            else {
                                if (getConfiguration.length > 0) {
                                    mm.executeQueryData(`select ID from wallet_master where BALANCE >= 1 AND CUSTOMER_ID = ?`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getBalanceDetails) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        else {
                                            if (getBalanceDetails.length > 0) {
                                                let templateData = [
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                                                    { type: "text", text: getOrderDetails[0].PICKUP_CITY_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].CITY_NAME.trim() },
                                                    { type: "text", text: mm.formatInvoiceDate(getOrderDetails[0].SHIPPING_DATETIME).trim() },
                                                    { type: "text", text: (getOrderDetails[0].SHIPPING_DATETIME).split(' ')[1].trim() },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() }
                                                ]

                                                if (getOrderDetails[0].MOBILE_NO.trim() != '') {
                                                    mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdart_shipment_created`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                                                }
                                                else {
                                                    console.log("mobile number not found");
                                                }
                                            }
                                            else {
                                                console.log("Insufficient Balance..");
                                            }
                                        }
                                    })
                                }
                                else {
                                    console.log("Not authorised to send message");
                                }
                            }
                        })
                    }
                    else {
                        console.log('Order not found');
                    }
                }
            })
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendCancelShipmentMessage = (orderId) => {
    const supportKey = 23456;
    try {
        if (orderId && orderId != ' ') {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, PICKUP_CITY_NAME, CITY_NAME, CANCEL_DATETIME, CANCEL_REMARK, MOBILE_NO from view_order_master where ID = ?`, orderId, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                    logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                }
                else {
                    if (getOrderDetails.length > 0) {
                        mm.executeQueryData(`select ID from customer_whatsapp_configuration_details where CUSTOMER_ID = ? AND STATUS = 1 AND SHIPMENT_CANCELLED = 1`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getConfiguration) => {
                            if (error) {
                                console.log(error);
                                // logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                            }
                            else {
                                if (getConfiguration.length > 0) {

                                    mm.executeQueryData(`select ID from wallet_master where BALANCE >= 1 AND CUSTOMER_ID = ?`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getBalanceDetails) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        else {
                                            if (getBalanceDetails.length > 0) {
                                                let templateData = [
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                                                    { type: "text", text: getOrderDetails[0].PICKUP_CITY_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].CITY_NAME.trim() },
                                                    { type: "text", text: mm.formatInvoiceDate((getOrderDetails[0].CANCEL_DATETIME)).trim() },
                                                    { type: "text", text: (getOrderDetails[0].CANCEL_DATETIME).split(' ')[1].trim() },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].CANCEL_REMARK.trim() }
                                                ]

                                                if (getOrderDetails[0].MOBILE_NO.trim() != '') {
                                                    mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdart_shipment_cancelled`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                                                }
                                                else {
                                                    console.log("mobile number not found");
                                                }
                                            }
                                            else {
                                                console.log("Insufficient Balance..");
                                            }
                                        }
                                    })


                                }
                                else {
                                    console.log("Not Authorised to send msg");
                                }
                            }
                        })
                    }
                    else {
                        console.log('Order not found');
                    }
                }
            })
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendServiceVerificationMessage = (MOBILE_NO, OTP, CUSTOMER_ID) => {
    try {
        if (MOBILE_NO && MOBILE_NO != ' ' && OTP && OTP != ' ') {
            let templateData = [
                { type: "text", text: OTP }
            ]
            mm.sendWSMS(MOBILE_NO, `shipdart_otp`, templateData, "en_US", CUSTOMER_ID);
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendDeliveredMessage = (orderId) => {
    const supportKey = 23456;
    try {
        if (orderId && orderId != ' ') {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, PICKUP_CITY_NAME, CITY_NAME, ORDER_STATUS_UPDATED_DATETIME,  MOBILE_NO from view_order_master where ID = ?`, orderId, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                    logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                }
                else {
                    if (getOrderDetails.length > 0) {
                        mm.executeQueryData(`select ID from customer_whatsapp_configuration_details where CUSTOMER_ID = ? AND STATUS = 1 AND SHIPMENT_DELIVERED = 1`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getConfiguration) => {
                            if (error) {
                                console.log(error);
                                // logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                            }
                            else {
                                if (getConfiguration.length > 0) {
                                    mm.executeQueryData(`select ID from wallet_master where BALANCE >= 1 AND CUSTOMER_ID = ?`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getBalanceDetails) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        else {
                                            if (getBalanceDetails.length > 0) {
                                                let templateData = [
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: mm.formatInvoiceDate((getOrderDetails[0].ORDER_STATUS_UPDATED_DATETIME)).trim() },
                                                    { type: "text", text: (getOrderDetails[0].ORDER_STATUS_UPDATED_DATETIME).split(' ')[1].trim() },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() }
                                                ]

                                                if (getOrderDetails[0].MOBILE_NO.trim() != '') {
                                                    mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdartexpress_delivered`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                                                }
                                                else {
                                                    console.log("mobile number not found");
                                                }
                                            }
                                            else {
                                                console.log("Insufficient Balance..");
                                            }
                                        }
                                    })


                                }
                                else {
                                    console.log("Not Authorised to send msg");
                                }
                            }
                        })
                    }
                    else {
                        console.log('Order not found');
                    }
                }
            })
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendOutOfDeliveredMessage = (orderId) => {
    const supportKey = 23456;
    try {
        if (orderId && orderId != ' ') {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, PICKUP_CITY_NAME, CITY_NAME, ORDER_STATUS_UPDATED_DATETIME, MOBILE_NO from view_order_master where ID = ?`, orderId, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                    logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                }
                else {
                    if (getOrderDetails.length > 0) {
                        mm.executeQueryData(`select ID from customer_whatsapp_configuration_details where CUSTOMER_ID = ? AND STATUS = 1 AND SHIPMENT_OUT_OF_DELIVERY = 1`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getConfiguration) => {
                            if (error) {
                                console.log(error);
                                // logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                            }
                            else {
                                if (getConfiguration.length > 0) {
                                    mm.executeQueryData(`select ID from wallet_master where BALANCE >= 1 AND CUSTOMER_ID = ?`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getBalanceDetails) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        else {
                                            if (getBalanceDetails.length > 0) {
                                                let templateData = [
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                                                    { type: "text", text: getOrderDetails[0].CITY_NAME.trim() },
                                                    { type: "text", text: mm.formatInvoiceDate((getOrderDetails[0].ORDER_STATUS_UPDATED_DATETIME)).trim() },
                                                    { type: "text", text: "19:00:00" },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() }
                                                ]

                                                if (getOrderDetails[0].MOBILE_NO.trim() != '') {
                                                    mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdart_out_for_delivery`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                                                }
                                                else {
                                                    console.log("mobile number not found");
                                                }
                                            }
                                            else {
                                                console.log("Insufficient Balance..");
                                            }
                                        }
                                    })


                                }
                                else {
                                    console.log("Not Authorised to send msg");
                                }
                            }
                        })
                    }
                    else {
                        console.log('Order not found');
                    }
                }
            })
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendInTransitMessage = (orderId) => {
    const supportKey = 23456;
    try {
        if (orderId && orderId != ' ') {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, PICKUP_CITY_NAME, CITY_NAME, ORDER_STATUS_UPDATED_DATETIME, MOBILE_NO from view_order_master where ID = ?`, orderId, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                    logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                }
                else {
                    if (getOrderDetails.length > 0) {
                        mm.executeQueryData(`select ID from customer_whatsapp_configuration_details where CUSTOMER_ID = ? AND STATUS = 1 AND SHIPMENT_IN_TRANSIT = 1`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getConfiguration) => {
                            if (error) {
                                console.log(error);
                                // logger.error(req.url, req.method, JSON.stringify(error), req.baseUrl + req.url)
                            }
                            else {
                                if (getConfiguration.length > 0) {
                                    mm.executeQueryData(`select ID from wallet_master where BALANCE >= 1 AND CUSTOMER_ID = ?`, getOrderDetails[0].CUSTOMER_ID, supportKey, (error, getBalanceDetails) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        else {
                                            if (getBalanceDetails.length > 0) {
                                                let templateData = [
                                                    { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                                                    { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                                                    { type: "text", text: getOrderDetails[0].CITY_NAME.trim() },
                                                    { type: "text", text: mm.formatInvoiceDate((getOrderDetails[0].ORDER_STATUS_UPDATED_DATETIME)).trim() },
                                                    { type: "text", text: (getOrderDetails[0].ORDER_STATUS_UPDATED_DATETIME).trim() },
                                                    { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() }
                                                ]

                                                if (getOrderDetails[0].MOBILE_NO.trim() != '') {
                                                    mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdart_in_transit`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                                                }
                                                else {
                                                    console.log("mobile number not found");
                                                }
                                            }
                                            else {
                                                console.log("Insufficient Balance..");
                                            }
                                        }
                                    })


                                }
                                else {
                                    console.log("Not Authorised to send msg");
                                }
                            }
                        })
                    }
                    else {
                        console.log('Order not found');
                    }
                }
            })
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendKycMessage = (mobileNo, name, customerId) => {
    const supportKey = 23456;
    try {
        if (mobileNo && mobileNo != ' ' && name && name.trim() != '') {
            const templateData = [{ type: "text", text: name.trim() }],
                mediaData = [
                    {
                        type: 'image',
                        image: {
                            link: "https://admin.shipdartexpress.com:9445/static/kyc/kyc.jpg"
                        }
                    }
                ];

            mm.sendMediaWSMS(mobileNo, "shipdart_kyc", templateData, "en_US", customerId, mediaData)

        }
        else {
            console.log("Parameter Missing.");
        }
    } catch (error) {
        console.log(error);
    }
}

// this.sendKycMessage(9890011747, "Harshvardhan", 28);

exports.sendRegistrationOtp = (MOBILE_NO, OTP) => {
    try {
        if (MOBILE_NO && MOBILE_NO != ' ' && OTP && OTP != ' ') {
            let templateData = [
                { type: "text", text: OTP }
            ]
            mm.sendWSMS(MOBILE_NO, `shipdart_otp`, templateData, "en_US", null);
        }
        else {
            console.log('parameter missing');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.sendNdrCreateMessage = (ORDER_ID, date) => {
    const supportKey = 212313;
    try {
        if (ORDER_ID && date) {
            mm.executeQueryData(`select DELIVER_TO as CUSTOMER_NAME, CUSTOMER_ID, CARRIER_NAME, AWB_NO, ADDRESS, MOBILE_NO from view_order_master where ID = ? `, ORDER_ID, supportKey, (error, getOrderDetails) => {
                if (error) {
                    console.log(error);
                }
                else {
                    if (getOrderDetails.length > 0) {
                        let templateData = [
                            { type: "text", text: getOrderDetails[0].CUSTOMER_NAME.trim() },
                            { type: "text", text: getOrderDetails[0].AWB_NO.trim() },
                            { type: "text", text: getOrderDetails[0].MOBILE_NO.trim() },
                            { type: "text", text: getOrderDetails[0].ADDRESS.trim() },
                            { type: "text", text: mm.formatInvoiceDate(date).trim() },
                            { type: "text", text: getOrderDetails[0].CARRIER_NAME.trim() }
                        ]

                        if (getOrderDetails[0].MOBILE_NO.trim() && getOrderDetails[0].MOBILE_NO.trim() != '') {
                            mm.sendWSMS(getOrderDetails[0].MOBILE_NO.trim(), `shipdart_reattempt`, templateData, "en_US", getOrderDetails[0].CUSTOMER_ID);
                        }
                        else {
                            console.log("Mobile number not found.");
                        }
                    }
                    else {
                        console.log("Invalid order Id");
                    }
                }
            })
        }
        else {
            console.log("No order id found");
        }
    } catch (error) {
        console.log(error);
    }
}