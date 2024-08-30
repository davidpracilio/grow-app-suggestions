import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class GrowAppSuggestionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function resource
    const growAppSuggestionsFunction = new lambda.Function(this, 'GrowAppSuggestionsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'grow-app-suggestions.handler', // Points to the file in the lambda directory
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      }
    });

    // Define the API Gateway resource
    const api = new apigateway.LambdaRestApi(this, 'GrowAppSuggestionsApi', {
      handler: growAppSuggestionsFunction,
      proxy: false,
    });

    // Define the '/learning-suggestions resource with a GET method
    const learningSuggestionsResource = api.root.addResource('learning-suggestions');
    learningSuggestionsResource.addMethod('GET');

    // Output as a separate stack output
    new cdk.CfnOutput(this, 'GrowAppSuggestionsApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}
