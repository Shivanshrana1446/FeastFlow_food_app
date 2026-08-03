const ApiError = require('../../src/utils/ApiError');
const ApiResponse = require('../../src/utils/ApiResponse');

describe('ApiError', () => {
  it('builds correct status codes via static factories', () => {
    expect(ApiError.badRequest('bad').statusCode).toBe(400);
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict().statusCode).toBe(409);
    expect(ApiError.notImplemented().statusCode).toBe(501);
  });

  it('marks success as false', () => {
    expect(ApiError.badRequest('x').success).toBe(false);
  });
});

describe('ApiResponse', () => {
  it('derives success from statusCode', () => {
    expect(new ApiResponse(200, { a: 1 }).success).toBe(true);
    expect(new ApiResponse(404, null, 'nope').success).toBe(false);
  });

  it('sends a JSON response via res', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    new ApiResponse(201, { id: 1 }, 'created').send(res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'created', data: { id: 1 } })
    );
  });
});
