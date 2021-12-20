import {ClientRepository} from "../repository/client-repository";
import {NotificationClient} from "../repository/notification-client";
import {Notification} from "../model/notification";
import * as AWS from "aws-sdk";
import {ApiGatewayClient} from "../repository/api-gateway-client";

export class ChatService {
    private clientRepository = new ClientRepository();
    private notificationClient = new NotificationClient();
    private apiGatewayClient = new ApiGatewayClient();



    join = async (client: Client) => {
        console.log(`${client.alias ? client.alias : client.connectionId} has joined the server!`);
        await this.clientRepository.saveClient(client);
        await this.notificationClient.sendNotification({
            message: `${client.alias ? client.alias : client.connectionId} has joined the server`
        });
    }

    sendNotification = async (notification: Notification) => {
        console.log(`Sending notification [${notification.message}]`);
        const clients = await this.clientRepository.findAll();
        const notificationPromises = clients.map(client => this.apiGatewayClient.send(client.connectionId, notification.message));
        await Promise.all(notificationPromises);
    }

    leave = async (connectionId: string) => {
        const client = await this.clientRepository.findById(connectionId);
        if(client) {
            console.log(`${client.alias ? client.alias : client.connectionId} has left the server!`);
            await Promise.all([
                this.clientRepository.removeClient(connectionId),
                this.notificationClient.sendNotification({
                    message: `${client.alias ? client.alias : client.connectionId} has left the server!`
                })
            ]);
        }
    }
}