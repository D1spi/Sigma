import request from 'supertest';
import { app } from '../src/app';
import { createConnection, closeConnection } from '../src/config/db';
import { UserModel } from '../src/models/user.model';
import { httpStatus } from '../src/config/httpStatusCodes';

describe('GET /api/v1/users/:id', () => {
  beforeAll(async () => {
    // Connect to the test database
    await createConnection();

    // Create test users
    await UserModel.create({
      _id: '64af8b123456abcd12345678',
      name: 'TestUser',
      birthday: '2000-10-10',
      password: '12345',
      email: 'testUser@test.com',
    });

    await UserModel.create({
      _id: '64af8b123456abcd99999999',
      name: 'TestUser2',
      isBlocked: true,
      birthday: '2000-10-10',
      password: '12345',
      email: 'testUser2@test.com',
    });
  });

  afterAll(async () => {
    // Remove test data
    await UserModel.findOneAndDelete({ _id: '64af8b123456abcd12345678' });
    await UserModel.findOneAndDelete({ _id: '64af8b123456abcd99999999' });

    // Close the database connection
    await closeConnection();
  });

  it('should return 200 and the user when it exists', async () => {
    // ID of the existing user
    const userId = '64af8b123456abcd12345678';

    // Call the endpoint with supertest
    const response = await request(app).get(`/api/v1/users/${userId}`).expect(httpStatus.OK);

    // Verify the response
    expect(response.body).toHaveProperty('message', 'User fetched successfully');
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('id', userId);
    // For example, check the name is "TestUser"
    expect(response.body.data).toHaveProperty('name', 'TestUser');
  });

  it('should return 404 when the user does not exist', async () => {
    // An ID that does not exist
    const nonExistentId = '64af8b999999999999999999';

    // Call the endpoint
    const response = await request(app).get(`/api/v1/users/${nonExistentId}`).expect(httpStatus.NOT_FOUND);

    // Verify the response
    // The service throws an AppError with "User not found"
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should return 403 if the user is blocked (isBlocked = true)', async () => {
    // ID of the user with isBlocked = true
    const blockedUserId = '64af8b123456abcd99999999';

    // Call the endpoint
    const response = await request(app).get(`/api/v1/users/${blockedUserId}`).expect(httpStatus.FORBIDDEN);

    // Verify the response
    expect(response.body).toHaveProperty('error', 'User is blocked');
  });
});
