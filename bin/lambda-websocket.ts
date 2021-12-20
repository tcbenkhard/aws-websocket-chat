#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaWebsocketStack } from '../lib/lambda-websocket-stack';

const app = new cdk.App();
new LambdaWebsocketStack(app, 'LambdaWebsocketStack', {
  env: {
      account: '111972343318',
      region: 'eu-west-1'
  }
});
