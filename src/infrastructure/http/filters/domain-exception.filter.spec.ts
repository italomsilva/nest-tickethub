import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';

export class JustificationRequiredException extends Error {
  constructor() {
    super('A text justification is required when marking a ticket as INCONSISTENT.');
    this.name = 'JustificationRequiredException';
  }
}

export class TicketNotFoundException extends Error {
  constructor() {
    super('Ticket not found.');
    this.name = 'TicketNotFoundException';
  }
}

describe('DomainExceptionFilter (Senior Unit Tests)', () => {
  let filter: DomainExceptionFilter;

  // Mocking variables
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn().mockReturnThis();
  
  const mockResponse = {
    status: mockStatus,
    json: mockJson,
  };

  const mockHost = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => ({
        url: '/tickets/123/status',
      }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainExceptionFilter],
    }).compile();

    filter = module.get<DomainExceptionFilter>(DomainExceptionFilter);
    jest.clearAllMocks();
  });

  it('should intercept JustificationRequiredException and respond with 400 Bad Request', () => {
    const exception = new JustificationRequiredException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'A text justification is required when marking a ticket as INCONSISTENT.',
      error: 'Bad Request',
      path: '/tickets/123/status',
      timestamp: expect.any(String),
    });
  });

  it('should intercept TicketNotFoundException and respond with 404 Not Found', () => {
    const exception = new TicketNotFoundException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Ticket not found.',
      error: 'Not Found',
      path: '/tickets/123/status',
      timestamp: expect.any(String),
    });
  });

  it('should fallback generic typescript errors to 500 Internal Server Error', () => {
    const exception = new Error('Connection timeout on infrastructure layer');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: '/tickets/123/status',
      timestamp: expect.any(String),
    });
  });
});
