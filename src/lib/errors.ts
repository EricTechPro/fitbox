/**
 * Custom error types for FitBox application business logic
 * Provides structured error handling with specific error codes and contexts
 */

export enum ErrorCodes {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_POSTAL_CODE = 'INVALID_POSTAL_CODE',
  INVALID_DATE = 'INVALID_DATE',
  
  // Business logic errors
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  INVALID_DELIVERY_ZONE = 'INVALID_DELIVERY_ZONE',
  ORDER_DEADLINE_PASSED = 'ORDER_DEADLINE_PASSED',
  MEAL_NOT_AVAILABLE = 'MEAL_NOT_AVAILABLE',
  SUBSCRIPTION_INACTIVE = 'SUBSCRIPTION_INACTIVE',
  
  // Authentication errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Payment errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CARD_DECLINED = 'CARD_DECLINED',
  INSUFFICIENT_LOYALTY_POINTS = 'INSUFFICIENT_LOYALTY_POINTS',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

/**
 * Base application error class
 */
export abstract class AppError extends Error {
  public readonly code: ErrorCodes
  public readonly statusCode: number
  public readonly isOperational: boolean = true
  public readonly context?: Record<string, any>
  public readonly timestamp: Date

  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: number,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.timestamp = new Date()

    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    }
  }
}

/**
 * Business logic validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, context)
  }
}

/**
 * Business rule violation errors (422)
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    code: ErrorCodes = ErrorCodes.VALIDATION_ERROR,
    context?: Record<string, any>
  ) {
    super(message, code, 422, context)
  }
}

/**
 * Authentication and authorization errors (401/403)
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    code: ErrorCodes = ErrorCodes.UNAUTHORIZED,
    context?: Record<string, any>
  ) {
    const statusCode = code === ErrorCodes.UNAUTHORIZED ? 401 : 403
    super(message, code, statusCode, context)
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number,
    context?: Record<string, any>
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    
    super(message, ErrorCodes.RESOURCE_NOT_FOUND, 404, {
      resource,
      identifier,
      ...context
    })
  }
}

/**
 * Resource conflict errors (409)
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, ErrorCodes.RESOURCE_CONFLICT, 409, context)
  }
}

/**
 * Payment processing errors (402)
 */
export class PaymentError extends AppError {
  constructor(
    message: string,
    code: ErrorCodes = ErrorCodes.PAYMENT_FAILED,
    context?: Record<string, any>
  ) {
    super(message, code, 402, context)
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = 'External service unavailable',
    context?: Record<string, any>
  ) {
    super(`${service}: ${message}`, ErrorCodes.EXTERNAL_SERVICE_ERROR, 502, {
      service,
      ...context
    })
  }
}

/**
 * Database operation errors (500)
 */
export class DatabaseError extends AppError {
  constructor(
    operation: string,
    message: string = 'Database operation failed',
    context?: Record<string, any>
  ) {
    super(`Database ${operation}: ${message}`, ErrorCodes.DATABASE_ERROR, 500, {
      operation,
      ...context
    })
  }
}

/**
 * Rate limiting errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    limit: number,
    window: string,
    context?: Record<string, any>
  ) {
    super(
      `Rate limit exceeded: ${limit} requests per ${window}`,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      429,
      { limit, window, ...context }
    )
  }
}

/**
 * Inventory management errors
 */
export class InventoryError extends BusinessLogicError {
  constructor(
    mealName: string,
    requested: number,
    available: number,
    context?: Record<string, any>
  ) {
    super(
      `Insufficient inventory for "${mealName}": requested ${requested}, available ${available}`,
      ErrorCodes.INSUFFICIENT_INVENTORY,
      { mealName, requested, available, ...context }
    )
  }
}

/**
 * Delivery zone validation errors
 */
export class DeliveryZoneError extends BusinessLogicError {
  constructor(
    postalCode: string,
    message: string = 'Invalid delivery zone',
    context?: Record<string, any>
  ) {
    super(
      `${message} for postal code ${postalCode}`,
      ErrorCodes.INVALID_DELIVERY_ZONE,
      { postalCode, ...context }
    )
  }
}

/**
 * Order deadline errors
 */
export class OrderDeadlineError extends BusinessLogicError {
  constructor(
    deadline: Date,
    deliveryDate: Date,
    context?: Record<string, any>
  ) {
    super(
      `Order deadline (${deadline.toISOString()}) has passed for delivery date ${deliveryDate.toISOString()}`,
      ErrorCodes.ORDER_DEADLINE_PASSED,
      { deadline: deadline.toISOString(), deliveryDate: deliveryDate.toISOString(), ...context }
    )
  }
}

/**
 * Error factory for consistent error creation
 */
export class ErrorFactory {
  static validation(message: string, field?: string): ValidationError {
    return new ValidationError(message, field ? { field } : undefined)
  }

  static notFound(resource: string, id?: string | number): NotFoundError {
    return new NotFoundError(resource, id)
  }

  static conflict(message: string): ConflictError {
    return new ConflictError(message)
  }

  static unauthorized(message?: string): AuthenticationError {
    return new AuthenticationError(message)
  }

  static businessLogic(message: string, code?: ErrorCodes): BusinessLogicError {
    return new BusinessLogicError(message, code)
  }

  static payment(message: string, code?: ErrorCodes): PaymentError {
    return new PaymentError(message, code)
  }

  static database(operation: string, details?: string): DatabaseError {
    return new DatabaseError(operation, details)
  }

  static externalService(service: string, message?: string): ExternalServiceError {
    return new ExternalServiceError(service, message)
  }
}

/**
 * Error handler utility for consistent error processing
 */
export class ErrorHandler {
  /**
   * Determine if error is operational (expected) vs programming error
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  }

  /**
   * Extract safe error details for client response
   */
  static toClientResponse(error: Error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          ...(error.context && { context: error.context })
        }
      }
    }

    // For non-operational errors, return generic message
    return {
      success: false,
      error: {
        message: 'An internal error occurred',
        code: ErrorCodes.DATABASE_ERROR,
        statusCode: 500
      }
    }
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: Error, context?: Record<string, any>) {
    const logData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    }

    if (error instanceof AppError) {
      logData.code = error.code
      logData.statusCode = error.statusCode
      logData.context = error.context
      
      // Log level based on severity
      if (error.statusCode >= 500) {
        console.error('Application Error:', logData)
      } else if (error.statusCode >= 400) {
        console.warn('Client Error:', logData)
      } else {
        console.info('Application Info:', logData)
      }
    } else {
      console.error('System Error:', logData)
    }
  }
}

/**
 * Async error wrapper for route handlers
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      ErrorHandler.logError(error as Error, {
        function: fn.name,
        arguments: args
      })
      throw error
    }
  }
}