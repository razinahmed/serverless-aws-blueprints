const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.USERS_TABLE,
    Item: { userId: data.id, name: data.name, createdAt: Date.now() }
  };
  await dynamo.put(params).promise();
  return { statusCode: 201, body: JSON.stringify({ message: 'User created' }) };
};