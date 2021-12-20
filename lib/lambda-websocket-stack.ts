import * as cdk from '@aws-cdk/core';
import {LambdaWebSocketIntegration} from '@aws-cdk/aws-apigatewayv2-integrations';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sqs from '@aws-cdk/aws-sqs';
import {Effect} from '@aws-cdk/aws-iam';
import {SqsEventSource} from "@aws-cdk/aws-lambda-event-sources";

export class LambdaWebsocketStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectHandler = new lambda.NodejsFunction(this, 'ConnectHandler', {
      entry: 'src/connect-handler.ts',
    });

    const disconnectHandler = new lambda.NodejsFunction(this, 'DisconnectHandler', {
      entry: 'src/disconnect-handler.ts',
    });

    const notificationHandler = new lambda.NodejsFunction(this, 'NotificationHandler', {
      entry: 'src/notification-handler.ts',
    });

    const defaultHandler = new lambda.NodejsFunction(this, 'DefaultHandler', {
      entry: 'src/default-handler.ts',
    });

    const webSocketApi = new apigwv2.WebSocketApi(this, 'ChatWebsocketApi', {
      connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: connectHandler }) },
      disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: disconnectHandler }) },
      defaultRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: defaultHandler }) },
    });

    notificationHandler.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['execute-api:ManageConnections'],
      effect: Effect.ALLOW
    }))

    const stage = new apigwv2.WebSocketStage(this, 'ProdStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    const gatewayUrl = stage.url.replace('wss://', '');
    notificationHandler.addEnvironment('API_GATEWAY_ENDPOINT', gatewayUrl);
    connectHandler.addEnvironment('API_GATEWAY_ENDPOINT', gatewayUrl);
    disconnectHandler.addEnvironment('API_GATEWAY_ENDPOINT', gatewayUrl);

    const notificationQueue = new sqs.Queue(this, 'NotificationQueue', {
      queueName: 'notification-command-queue',
    });
    connectHandler.addEnvironment('NOTIFICATION_QUEUE_URL', notificationQueue.queueUrl);
    disconnectHandler.addEnvironment('NOTIFICATION_QUEUE_URL', notificationQueue.queueUrl);
    notificationHandler.addEnvironment('NOTIFICATION_QUEUE_URL', notificationQueue.queueUrl);
    notificationQueue.grantSendMessages(connectHandler);
    notificationQueue.grantSendMessages(disconnectHandler);
    notificationHandler.addEventSource(new SqsEventSource(notificationQueue, {
      batchSize: 1
    }));

    const clientTable = new dynamodb.Table(this, 'ClientTable', {
      tableName: 'ChatClients',
      partitionKey: {
        type: dynamodb.AttributeType.STRING,
        name: 'connectionId'
      }
    });
    clientTable.grantReadWriteData(connectHandler);
    clientTable.grantReadWriteData(disconnectHandler)
    clientTable.grantReadData(notificationHandler);
    connectHandler.addEnvironment('CLIENT_TABLE', clientTable.tableName);
    notificationHandler.addEnvironment('CLIENT_TABLE', clientTable.tableName);
    disconnectHandler.addEnvironment('CLIENT_TABLE', clientTable.tableName);
    defaultHandler.addEnvironment('CLIENT_TABLE', clientTable.tableName);
  }
}
