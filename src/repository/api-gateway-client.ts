import * as AWS from "aws-sdk";
import {getEnvironmentVariable} from "../util/env";

export class ApiGatewayClient {
    private readonly API_GATEWAY_ENDPOINT = getEnvironmentVariable('API_GATEWAY_ENDPOINT');
    private apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: this.API_GATEWAY_ENDPOINT
    });

    send = async (connectionId: string, message: string) => {
        await this.apigwManagementApi.postToConnection({
            ConnectionId: connectionId!,
            Data: JSON.stringify({
                action: 'notification',
                data: {
                    text: message
                }
            })
        }).promise()
    }
}