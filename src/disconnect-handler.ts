import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {ChatService} from "./service/chat-service";

const chatService = new ChatService();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    await chatService.leave(event.requestContext.connectionId!);

    return {
        statusCode: 200,
        body: 'Success'
    }
}