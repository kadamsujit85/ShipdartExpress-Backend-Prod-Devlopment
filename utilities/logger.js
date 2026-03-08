const mm = require('./globalModule')

exports.error = async (reqUrl, reqMethod, reqError, reqRoute) => {

    try {
        mm.executeQueryData(`insert into logger(ROUTE, REQ_URL, REQ_METHOD, ERROR, CREATED_DATETIME  ) values (?,?,?,?,?)`, [reqRoute, reqUrl, reqMethod, reqError, mm.getSystemDate()], (error, insertLog) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log("success");
            }
        })
    } catch (error) {
        console.log("addErrlog Exception : ", error);
    }
}