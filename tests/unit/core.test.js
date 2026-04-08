const { handler: createItem } = require('../../src/handlers/createItem');
const { handler: getItem } = require('../../src/handlers/getItem');
const { handler: listItems } = require('../../src/handlers/listItems');
const { handler: deleteItem } = require('../../src/handlers/deleteItem');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

jest.mock('@aws-sdk/lib-dynamodb');

const mockSend = jest.fn();
DynamoDBDocumentClient.prototype.send = mockSend;

function apiEvent(body, pathParams = {}, queryParams = {}) {
  return {
    body: JSON.stringify(body),
    pathParameters: pathParams,
    queryStringParameters: queryParams,
    headers: { 'Content-Type': 'application/json' },
  };
}

describe('createItem handler', () => {
  beforeEach(() => mockSend.mockReset());

  it('returns 201 with created item on valid input', async () => {
    mockSend.mockResolvedValue({});
    const event = apiEvent({ name: 'Widget', price: 9.99, category: 'tools' });
    const result = await createItem(event);
    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.name).toBe('Widget');
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  it('returns 400 when name is missing', async () => {
    const event = apiEvent({ price: 9.99 });
    const result = await createItem(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toMatch(/name/i);
  });

  it('returns 500 when DynamoDB put fails', async () => {
    mockSend.mockRejectedValue(new Error('DynamoDB error'));
    const event = apiEvent({ name: 'Widget', price: 9.99, category: 'tools' });
    const result = await createItem(event);
    expect(result.statusCode).toBe(500);
  });
});

describe('getItem handler', () => {
  beforeEach(() => mockSend.mockReset());

  it('returns 200 with item data', async () => {
    mockSend.mockResolvedValue({ Item: { id: 'abc', name: 'Widget', price: 9.99 } });
    const event = apiEvent(null, { id: 'abc' });
    const result = await getItem(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).name).toBe('Widget');
  });

  it('returns 404 when item does not exist', async () => {
    mockSend.mockResolvedValue({ Item: undefined });
    const event = apiEvent(null, { id: 'missing' });
    const result = await getItem(event);
    expect(result.statusCode).toBe(404);
  });
});

describe('listItems handler', () => {
  beforeEach(() => mockSend.mockReset());

  it('returns paginated results', async () => {
    mockSend.mockResolvedValue({
      Items: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }],
      LastEvaluatedKey: { id: '2' },
    });
    const event = apiEvent(null, {}, { limit: '2' });
    const result = await listItems(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.items).toHaveLength(2);
    expect(body.nextToken).toBeDefined();
  });

  it('returns empty array when table is empty', async () => {
    mockSend.mockResolvedValue({ Items: [], LastEvaluatedKey: undefined });
    const event = apiEvent(null, {}, {});
    const result = await listItems(event);
    const body = JSON.parse(result.body);
    expect(body.items).toHaveLength(0);
    expect(body.nextToken).toBeNull();
  });
});

describe('deleteItem handler', () => {
  beforeEach(() => mockSend.mockReset());

  it('returns 204 on successful delete', async () => {
    mockSend.mockResolvedValue({});
    const event = apiEvent(null, { id: 'abc' });
    const result = await deleteItem(event);
    expect(result.statusCode).toBe(204);
  });

  it('returns 500 when DynamoDB delete fails', async () => {
    mockSend.mockRejectedValue(new Error('Condition check failed'));
    const event = apiEvent(null, { id: 'abc' });
    const result = await deleteItem(event);
    expect(result.statusCode).toBe(500);
  });
});
