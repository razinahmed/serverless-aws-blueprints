# System Architecture

## Overview

Serverless AWS Blueprints is a collection of production-ready serverless patterns built on AWS Lambda, API Gateway, DynamoDB, and related services. It demonstrates CRUD APIs, authentication, event-driven processing, and infrastructure-as-code with the Serverless Framework.

## Infrastructure

```
Client
  |
  v
API Gateway (REST, regional)
  |
  v
Lambda Authorizer (validates JWT, attaches user context)
  |
  v
Lambda Handlers (one per route)
  |
  v
DynamoDB (single-table design)
  |
  v
DynamoDB Streams --> Lambda (post-processing, notifications)
```

## Lambda Handlers

Each API route maps to a single Lambda function in `src/handlers/`:

| Handler | Route | Description |
|---------|-------|-------------|
| `createItem` | POST /items | Validates input, generates UUID, writes to DynamoDB |
| `getItem` | GET /items/:id | Reads single item by partition key |
| `listItems` | GET /items | Scans with pagination (limit + exclusiveStartKey) |
| `updateItem` | PUT /items/:id | Conditional update (item must exist) |
| `deleteItem` | DELETE /items/:id | Removes item by partition key |
| `login` | POST /auth/login | Validates credentials, returns signed JWT |

Handlers follow a consistent pattern:
1. Parse and validate the event (body, path params, query params)
2. Call the DynamoDB document client
3. Return a formatted API Gateway response `{ statusCode, body, headers }`

## DynamoDB Table Design

Single table: `ItemsTable`

| Attribute | Type | Key |
|-----------|------|-----|
| `PK` | String | Partition key (`ITEM#<id>` or `USER#<email>`) |
| `SK` | String | Sort key (`METADATA`, `PROFILE`, etc.) |
| `GSI1PK` | String | GSI partition key (category-based access patterns) |
| `GSI1SK` | String | GSI sort key (createdAt for time-range queries) |

Access patterns:
- Get item by ID: `PK = ITEM#<id>, SK = METADATA`
- List items by category: `GSI1PK = CAT#<category>`, sorted by `GSI1SK`
- Get user by email: `PK = USER#<email>, SK = PROFILE`

## Authentication

- **Login**: The `login` handler verifies credentials against a hashed password stored in DynamoDB and returns a JWT signed with an RSA key stored in AWS Secrets Manager.
- **Authorizer**: A Lambda authorizer attached to API Gateway decodes the JWT, verifies the signature, and injects the user context into `event.requestContext.authorizer`.
- **Token expiration**: 1 hour, no refresh token in this blueprint (consumers add their own refresh flow).

## Event-Driven Processing

DynamoDB Streams trigger a `postProcess` Lambda on item creation/update:
- Sends a notification to an SNS topic (email alerts)
- Writes an audit log entry to a separate DynamoDB audit table
- Publishes metrics to CloudWatch custom metrics

## Deployment

```bash
npx serverless deploy --stage dev --region us-east-1
```

The `serverless.yml` defines all resources: Lambda functions, API Gateway, DynamoDB table, IAM roles, and environment variables. Stages (dev, staging, prod) use separate DynamoDB tables and API Gateway stages.

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest + mocked AWS SDK | Handler logic, validation, response formatting |
| Integration | Jest + real API Gateway URL | Full HTTP request/response cycle |
| Load | Artillery | Sustained traffic against dev stage |
| Infrastructure | `serverless info` | Verify deployed resources match config |
