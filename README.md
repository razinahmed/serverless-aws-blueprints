<div align="center">

<img src="https://placehold.co/900x200/0a0a23/ff9900.png?text=Serverless+AWS+Blueprints&font=Montserrat" alt="Serverless AWS Blueprints Banner" width="100%" />

# Serverless AWS Blueprints

**Architectural templates for AWS Lambda, API Gateway, and DynamoDB — production patterns for event-driven serverless applications with infrastructure-as-code.**

[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Serverless](https://img.shields.io/badge/Serverless_Framework-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

[Getting Started](#-getting-started) · [Features](#-features) · [Blueprints](#-blueprints) · [Tech Stack](#-tech-stack) · [Contributing](#-contributing)

</div>

---

## :sparkles: Features

| Feature | Description |
|---|---|
| :zap: **Lambda Functions** | Pre-built handler patterns for sync/async invocations with error handling middleware |
| :globe_with_meridians: **API Gateway REST** | RESTful API templates with request validation, CORS, and custom authorizers |
| :floppy_disk: **DynamoDB CRUD** | Single-table design patterns with GSIs, pagination, and batch operations |
| :wrench: **Serverless Framework** | Complete `serverless.yml` configs with plugin ecosystem and variable resolution |
| :closed_lock_with_key: **IAM Policies** | Least-privilege IAM role templates following AWS security best practices |
| :chart_with_upwards_trend: **CloudWatch Logging** | Structured JSON logging with custom metrics and alarm configurations |
| :snowflake: **Cold Start Optimization** | Provisioned concurrency, layer sharing, and bundle size reduction strategies |
| :rocket: **Multi-stage Deploy** | Dev, staging, and production environment pipelines with promotion gates |

---

## :hammer_and_wrench: Tech Stack

| Technology | Purpose |
|---|---|
| ![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=flat-square&logo=awslambda&logoColor=white) | Serverless compute |
| ![API Gateway](https://img.shields.io/badge/API_Gateway-FF4F8B?style=flat-square&logo=amazonapigateway&logoColor=white) | HTTP/REST API management |
| ![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=flat-square&logo=amazondynamodb&logoColor=white) | NoSQL database |
| ![Serverless](https://img.shields.io/badge/Serverless_Framework-FD5750?style=flat-square&logo=serverless&logoColor=white) | Deployment framework |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Runtime environment |
| ![CloudFormation](https://img.shields.io/badge/CloudFormation-E7157B?style=flat-square&logo=amazonaws&logoColor=white) | Infrastructure as Code |

---

## :blue_book: Blueprints

| Blueprint | Description | Complexity |
|---|---|---|
| `rest-api-crud` | Basic CRUD API with DynamoDB | Beginner |
| `auth-jwt-authorizer` | JWT-based custom authorizer for API Gateway | Intermediate |
| `event-driven-pipeline` | S3 trigger -> Lambda -> SQS -> Lambda chain | Intermediate |
| `websocket-api` | Real-time WebSocket API with connection management | Advanced |
| `multi-tenant-saas` | Tenant isolation with DynamoDB and IAM policies | Advanced |
| `scheduled-jobs` | CloudWatch Events cron-triggered batch processing | Beginner |
| `image-processing` | S3 upload trigger with Sharp/Lambda Layer for thumbnails | Intermediate |
| `graphql-appsync` | AppSync GraphQL API with DynamoDB resolvers | Advanced |

---

## :package: Installation

### Prerequisites

- **Node.js** >= 18.x
- **AWS CLI** configured with credentials — `aws configure`
- **Serverless Framework** — `npm install -g serverless`

### Getting Started

```bash
# Clone the repository
git clone https://github.com/razinahmed/serverless-aws-blueprints.git

# Navigate to the project
cd serverless-aws-blueprints

# Install dependencies
npm install

# Deploy a blueprint to dev
cd blueprints/rest-api-crud
serverless deploy --stage dev

# Run locally with offline plugin
serverless offline start

# Run tests
npm test
```

---

## :open_file_folder: Project Structure

```
serverless-aws-blueprints/
├── blueprints/
│   ├── rest-api-crud/
│   │   ├── handler.js
│   │   ├── serverless.yml
│   │   └── tests/
│   ├── auth-jwt-authorizer/
│   ├── event-driven-pipeline/
│   ├── websocket-api/
│   ├── multi-tenant-saas/
│   ├── scheduled-jobs/
│   ├── image-processing/
│   └── graphql-appsync/
├── shared/
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validator.js
│   │   └── logger.js
│   ├── utils/
│   │   ├── dynamodb.js
│   │   ├── response.js
│   │   └── auth.js
│   └── layers/
│       └── common-deps/
├── infrastructure/
│   ├── vpc.yml
│   ├── dynamodb-tables.yml
│   └── iam-roles.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
└── README.md
```

---

## :zap: Usage

### Lambda Handler Pattern

```javascript
const { errorHandler } = require('../../shared/middleware/errorHandler');
const { validate } = require('../../shared/middleware/validator');
const { dynamo } = require('../../shared/utils/dynamodb');

module.exports.createItem = errorHandler(async (event) => {
  const body = validate(event.body, createItemSchema);
  
  const item = {
    PK: `ITEM#${uuid()}`,
    SK: 'METADATA',
    ...body,
    createdAt: new Date().toISOString(),
  };

  await dynamo.put({ TableName: process.env.TABLE_NAME, Item: item });

  return { statusCode: 201, body: JSON.stringify(item) };
});
```

### Serverless Configuration

```yaml
service: rest-api-crud

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: ${opt:region, 'us-east-1'}
  environment:
    TABLE_NAME: !Ref ItemsTable

functions:
  createItem:
    handler: handler.createItem
    events:
      - http:
          path: /items
          method: post
          cors: true
```

---

## :handshake: Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b blueprint/new-pattern`
3. **Commit** your changes — `git commit -m "feat: add new blueprint pattern"`
4. **Push** to the branch — `git push origin blueprint/new-pattern`
5. **Open** a Pull Request

Each new blueprint should include a `serverless.yml`, handler, tests, and a brief README.

---

## :scroll: License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with :heart: by [Razin Ahmed](https://github.com/razinahmed)**

`AWS` `Serverless` `Lambda` `API Gateway` `DynamoDB` `Cloud` `Infrastructure as Code` `AWS Architecture`

</div>
