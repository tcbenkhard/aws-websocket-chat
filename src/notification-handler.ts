import {SQSEvent} from "aws-lambda";
import {ChatService} from "./service/chat-service";

const chatService = new ChatService();

export const handler = async (event: SQSEvent) => {
    console.log(`Received event`, event);
    const notificationPromises = event
        .Records
        .map(record => JSON.parse(record.body))
        .map(notification => chatService.sendNotification(notification));

    await Promise.all(notificationPromises);
}