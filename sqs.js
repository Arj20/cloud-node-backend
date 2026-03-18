// sqs.js
const { SQSClient } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({
  region: "us-east-1"
});

module.exports = sqs;