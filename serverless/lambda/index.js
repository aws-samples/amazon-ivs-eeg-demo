const AWS = require('aws-sdk');
const ivs = new AWS.IVS({
    apiVersion: '2020-07-14',
    region: 'us-east-1'
});

const response = {
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
        "Content-Type": "application/json"
    },
    "body": '',
    "isBase64Encoded": false
};

exports.send = async (event, context, callback) => {
    console.log("send event:", JSON.stringify(event, null, 2));

    let payload;
    try {
        console.log(event.body);
        payload = JSON.parse(event.body);
        console.log(payload.metadata);
    }
    catch (err) {
        console.log("send event > parse payload:", JSON.stringify(err, null, 2));
        response.statusCode = 500;
        response.body = JSON.stringify(err);
        callback(null, response);
        return;
    }

    if (!payload || !payload.channelArn || !payload.metadata) {
        console.log("send event > missing required fields: Must provide, channelArn and metadata");
        response.statusCode = 400;
        response.body = "Must provide, channelArn and metadata";
        callback(null, response);
        return;
    }

    // remove whitespaces and line breaks
    let metadata = payload.metadata.replace(/^\s+|\s+$/gm, "") // Trim beginning and ending whitespaces
        .replace(/(\r\n|\n|\r)/gm, "") // Removed line breaks
        .replace(/\s+/g, " "); // Removes double whitespaces

    // check size
    let byteLength = Buffer.byteLength(metadata, 'utf8');
    if (byteLength > 1024) {
        console.log("send event > Too big. Must be less than or equal to 1K");
        response.statusCode = 400;
        response.body = "Too big. Must be less than or equal to 1K";
        callback(null, response);
        return;
    }

    let params = {
        channelArn: payload.channelArn,
        metadata: payload.metadata
    };

    try {
        const ivsResult = await ivs.putMetadata(params).promise();
        console.info("send event > ivs putmetadata response:", JSON.stringify(ivsResult, null, 2));
        response.statusCode = 200;
        response.body = JSON.stringify({ "published": true }, '', 2);
        callback(null, response);
    }
    catch (err) {
        console.info("send event > err:", err, err.stack);
        response.statusCode = 500;
        response.body = err.stack;
        callback(null, response);
        return;
    }
};
