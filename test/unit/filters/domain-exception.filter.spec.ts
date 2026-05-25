import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from '../../../src/infrastructure/http/filters/domain-exception.filter';
import { JustificationRequiredException } from '../../../src/domain/exceptions/justification-required.exception';
import { TicketNotFoundException } from '../../../src/domain/exceptions/ticket-not-found.exception';
import { SolutionRequiredException } from '../../../src/domain/exceptions/solution-required.exception';
import { UnauthorizedActionException } from '../../../src/domain/exceptions/unauthorized-action.exception';

describe('DomainExceptionFilter (Clean Architecture Unit Tests)', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainExceptionFilter],
    }).compile();

    filter = module.get<DomainExceptionFilter>(DomainExceptionFilter);

    // Setup responses and HTTP context mocks
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      getType: jest.fn(),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should format standard NestJS HttpException to appropriate HTTP status and message format', () => {
    const httpException = new HttpException('Bad Request custom error', HttpStatus.BAD_REQUEST);

    filter.catch(httpException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request custom error',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map domain JustificationRequiredException to 400 Bad Request exception response', () => {
    const domainException = new JustificationRequiredException();

    filter.catch(domainException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: domainException.message,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map domain TicketNotFoundException to 404 Not Found exception response', () => {
    const domainException = new TicketNotFoundException('ticket-123');

    filter.catch(domainException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: domainException.message,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map domain SolutionRequiredException to 400 Bad Request exception response', () => {
    const domainException = new SolutionRequiredException();

    filter.catch(domainException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: domainException.message,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map domain UnauthorizedActionException to 403 Forbidden exception response', () => {
    const domainException = new UnauthorizedActionException();

    filter.catch(domainException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: domainException.message,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should capture unmapped standard Errors and respond with 500 Internal Server Error status', () => {
    const generalException = new Error('Database connection failed.');

    filter.catch(generalException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection failed.',
        timestamp: expect.any(String),
      }),
    );
  });
});
