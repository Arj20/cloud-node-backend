const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");
require("dotenv").config();

const sqs = new SQSClient({ region: "us-east-1" });

async function poll() {
  while (true) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
      }),
    );

    if (!res.Messages) continue;

    for (const msg of res.Messages) {
      const data = JSON.parse(msg.Body);

      console.log("Processing:", data);

      // simulate background job
      if (data.type === "TASK_CREATED") {
        console.log(`Send email for task ${data.title}`);
      }

      // delete message after processing
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_URL,
          ReceiptHandle: msg.ReceiptHandle,
        }),
      );
    }
  }
}

poll();
