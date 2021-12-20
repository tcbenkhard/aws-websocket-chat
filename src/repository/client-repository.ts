import AWS = require("aws-sdk");
import {getEnvironmentVariable} from "../util/env";

export class ClientRepository {
    private dynamo = new AWS.DynamoDB.DocumentClient();
    private readonly TABLE_NAME = getEnvironmentVariable('CLIENT_TABLE');

    saveClient = async (client: Client) => {
        await this.dynamo.put({
            TableName: this.TABLE_NAME,
            Item: client
        }).promise()
    }

    removeClient = async (connectionId: string) => {
        await this.dynamo.delete({
            TableName: this.TABLE_NAME,
            Key: {
                connectionId
            }
        }).promise();
    }

    findAll = async (): Promise<Array<Client>> => {
        const result = await this.dynamo.scan({
            TableName: this.TABLE_NAME
        }).promise();

        return result.Items?.map(item => item as Client) || [];
    }

    findById = async (connectionId: string): Promise<Client> => {
        const result = await this.dynamo.get({
            TableName: this.TABLE_NAME,
            Key: {
                connectionId
            }
        }).promise();

        return result.Item as Client;
    }
}