const mm = require('./globalModule');

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.saveOTP = async (email, otp) => {
    const systemDate = mm.getSystemDate();
    
    return new Promise((resolve, reject) => {
        mm.executeQueryData(
            `INSERT INTO user_otp_store (email, otp, created) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             otp = VALUES(otp), 
             created = VALUES(created)`,
            [email, otp, systemDate],
            'SYSTEM',
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};

exports.verifyOTP = async (email, otp) => {
    return new Promise((resolve, reject) => {
        mm.executeQueryData(
            `SELECT * FROM user_otp_store 
             WHERE email = ? AND otp = ? 
             AND created >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
            [email, otp],
            'SYSTEM',
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.length > 0);
                }
            }
        );
    });
};

exports.deleteOTP = async (email) => {
    return new Promise((resolve, reject) => {
        mm.executeQueryData(
            `DELETE FROM user_otp_store WHERE email = ?`,
            [email],
            'SYSTEM',
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}; 