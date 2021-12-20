import {getEnvironmentVariable} from "../util/env";
import {Notification} from "../model/notification";
import AWS = require("aws-sdk");

export class NotificationClient {
    private sqs = new AWS.SQS();
    private readonly NOTIFICATION_QUEUE_URL = getEnvironmentVariable('NOTIFICATION_QUEUE_URL');

    sendNotification = async (notification: Notification) => {
        await this.sqs.sendMessage({
            QueueUrl: this.NOTIFICATION_QUEUE_URL,
            MessageBody: JSON.stringify(notification)
        }).promise();
    }
}