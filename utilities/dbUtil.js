const mysql = require('mysql2/promise');

const config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

exports.executeDataQuery = async function (query, data) {
    const connection = await mysql.createConnection(config);
    try {
        const data2 = await connection.query(
            query,
            data
        );
        return data2[0];
    }
    catch (error) {
        throw error
    }
}

exports.executeQuery = async function (query) {
    const connection = await mysql.createConnection(config);
    const data = await connection.query(
        query
    );
    return data[0];
}

exports.executeTransactions = async function (transactions) {
    const connection = await mysql.createConnection(config);
    var results = [];
    try {
        await connection.beginTransaction()
        for (const transaction of transactions) {
            if (transaction.data === undefined) {
                const response = await connection.query(transaction.query)
                results.push(response)
            }
            else {
                const response = await connection.query(transaction.query, transaction.data)
                results.push(response)
            }
        }
        await connection.commit()
        return results;
    }
    catch (error) {
        console.log(error);
        await connection.rollback()
        throw "One or more transaction failed"
    }
}
