import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {ChatService} from "./service/chat-service";
import moment = require("moment");

const chatService = new ChatService();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.log(event);
    await chatService.join({
        connectionId: event.requestContext.connectionId!,
        connectedOn: moment().toISOString()
    });

    return {
        statusCode: 200,
        body: 'Success'
    }
}