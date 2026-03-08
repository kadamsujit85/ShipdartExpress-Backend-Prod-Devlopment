const admin = require('./firebase');
const mm = require('../utilities/globalModule');
const logger = require('../utilities/logger')

exports.sendNotification = function (titleData, bodyData, senderId, receiverId) {

    var supportKey = 655
    mm.executeQueryData(`select W_CLOUD_ID from customer_master where ID = ? AND W_CLOUD_ID is not null;`, supportKey, [receiverId], (error, selectCloudId) => {
        if (error) {
            console.log(error);
        }
        else {
            if (selectCloudId.length > 0 && selectCloudId[0].W_CLOUD_ID && selectCloudId[0].W_CLOUD_ID != ' ') {
                const message = {
                    notification: {
                        title: titleData,
                        body: bodyData,
                    },
                    token: selectCloudId[0].W_CLOUD_ID,
                };

                admin.messaging().send(message).then((response) => {
                    mm.executeQueryData(`insert into notification_master(TITLE,MESSAGE,SENDER_EMP_ID,RECEIVER_EMP_ID,READ_STATUS,STATUS) values(?,?,?,?,?,?)`, [titleData, bodyData, senderId, receiverId, 'U', 1], supportKey, (error, insertLocation) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Successfully sent message:', response);
                        }
                    })
                }).catch((error) => {
                    console.log('Error sending message:', error);
                    mm.executeQueryData(`insert into notification_master(TITLE,MESSAGE,SENDER_EMP_ID,RECEIVER_EMP_ID,READ_STATUS,STATUS) values(?,?,?,?,?,?)`, [titleData, bodyData, senderId, receiverId, 'U', 1], supportKey, (error, insertLocation) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Successfully sent message:', response);
                        }
                    })
                });
            }
            else {
                console.log("cloud Id not found");
                mm.executeQueryData(`insert into notification_master(TITLE,MESSAGE,SENDER_EMP_ID,RECEIVER_EMP_ID,READ_STATUS,STATUS) values(?,?,?,?,?,?)`, [titleData, bodyData, senderId, receiverId, 'U', 1], supportKey, (error, insertLocation) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Successfully sent message:', response);
                    }
                })
            }
        }
    })
}