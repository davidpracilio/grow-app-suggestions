import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import 'dotenv/config';

const apiKey = process.env.OPENAI_API_KEY || '';

export class GrowAppSuggestionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function resource
    const growAppSuggestionsFunction = new lambda.Function(this, 'GrowAppSuggestionsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      functionName: 'GrowAppSuggestionsFunction',
      code: lambda.Code.fromAsset('lambda'),
      handler: 'grow-app-suggestions.handler', // Points to the file in the lambda directory
      timeout: cdk.Duration.seconds(30),
      environment: {
        OPENAI_API_KEY: apiKey,
      }
    });

    // Define the API Gateway resource
    const api = new apigateway.LambdaRestApi(this, 'GrowAppSuggestionsApi', {
      handler: growAppSuggestionsFunction,
      proxy: false,
    });

    // Define the '/learning-suggestions' resource with a GET method
    const learningSuggestionsResource = api.root.addResource('learning-suggestions');
    learningSuggestionsResource.addMethod('GET', new apigateway.LambdaIntegration(growAppSuggestionsFunction, {
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'integration.response.header.Access-Control-Allow-Origin': "'*'",
            'integration.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'integration.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
          },
        },
      ],
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          },
        },
      ],
    });

    // Enable CORS for the OPTIONS preflight request
    learningSuggestionsResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'integration.response.header.Access-Control-Allow-Origin': "'*'",
            'integration.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'integration.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          },
        },
      ],
    });

    // Output as a separate stack output
    new cdk.CfnOutput(this, 'GrowAppSuggestionsApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}
