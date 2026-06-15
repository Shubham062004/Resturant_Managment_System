import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        id: 'mock-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      },
    });
  }),
  // Additional mocked endpoints go here
];
