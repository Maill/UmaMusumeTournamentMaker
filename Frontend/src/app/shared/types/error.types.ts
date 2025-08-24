export enum ErrorType {
  Network = 'NETWORK',
  Validation = 'VALIDATION', 
  Authentication = 'AUTHENTICATION',
  Authorization = 'AUTHORIZATION',
  NotFound = 'NOT_FOUND',
  Conflict = 'CONFLICT',
  Server = 'SERVER',
  Timeout = 'TIMEOUT',
  Business = 'BUSINESS',
  Unknown = 'UNKNOWN'
}

export enum ErrorSeverity {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL'
}

export interface ServiceError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  code?: string | number;
  timestamp: Date;
  retryable: boolean;
  context?: Record<string, any>;
}

export interface ValidationError extends ServiceError {
  type: ErrorType.Validation;
  fieldErrors: Record<string, string[]>;
}

export interface NetworkError extends ServiceError {
  type: ErrorType.Network;
  status?: number;
  statusText?: string;
}

export interface BusinessError extends ServiceError {
  type: ErrorType.Business;
  businessRule: string;
  suggestedAction?: string;
}

export type AppError = ServiceError | ValidationError | NetworkError | BusinessError;

// Error factory functions
export class ErrorFactory {
  static createNetworkError(
    message: string,
    status?: number,
    statusText?: string,
    retryable: boolean = true
  ): NetworkError {
    return {
      type: ErrorType.Network,
      severity: ErrorSeverity.High,
      message,
      status,
      statusText,
      timestamp: new Date(),
      retryable
    };
  }

  static createValidationError(
    message: string,
    fieldErrors: Record<string, string[]>
  ): ValidationError {
    return {
      type: ErrorType.Validation,
      severity: ErrorSeverity.Medium,
      message,
      fieldErrors,
      timestamp: new Date(),
      retryable: false
    };
  }

  static createBusinessError(
    message: string,
    businessRule: string,
    suggestedAction?: string,
    retryable: boolean = false
  ): BusinessError {
    return {
      type: ErrorType.Business,
      severity: ErrorSeverity.Medium,
      message,
      businessRule,
      suggestedAction,
      timestamp: new Date(),
      retryable
    };
  }

  static createServerError(
    message: string,
    code?: string | number,
    statusText?: string,
    retryable: boolean = true
  ): ServiceError {
    return {
      type: ErrorType.Server,
      severity: ErrorSeverity.High,
      message,
      code,
      details: statusText,
      timestamp: new Date(),
      retryable
    };
  }

  static createAuthenticationError(
    message: string,
    code?: string,
    suggestedAction?: string
  ): ServiceError {
    return {
      type: ErrorType.Authentication,
      severity: ErrorSeverity.High,
      message,
      code,
      details: suggestedAction,
      timestamp: new Date(),
      retryable: false
    };
  }

  static createAuthorizationError(
    message: string,
    code?: string,
    suggestedAction?: string
  ): ServiceError {
    return {
      type: ErrorType.Authorization,
      severity: ErrorSeverity.High,
      message,
      code,
      details: suggestedAction,
      timestamp: new Date(),
      retryable: false
    };
  }

  static createNotFoundError(
    message: string,
    code?: string,
    suggestedAction?: string
  ): ServiceError {
    return {
      type: ErrorType.NotFound,
      severity: ErrorSeverity.Medium,
      message,
      code,
      details: suggestedAction,
      timestamp: new Date(),
      retryable: false
    };
  }

  static createConflictError(
    message: string,
    code?: string,
    suggestedAction?: string
  ): ServiceError {
    return {
      type: ErrorType.Conflict,
      severity: ErrorSeverity.Medium,
      message,
      code,
      details: suggestedAction,
      timestamp: new Date(),
      retryable: false
    };
  }

  static fromHttpError(error: any): AppError {
    const status = error?.status || 0;
    const message = error?.error?.message || error?.message || 'An error occurred';
    
    if (status === 0) {
      return this.createNetworkError('Unable to connect to server', status, 'Network Error');
    }
    
    if (status === 400) {
      const fieldErrors = error?.error?.errors || {};
      return this.createValidationError(message, fieldErrors);
    }
    
    if (status === 401) {
      return {
        type: ErrorType.Authentication,
        severity: ErrorSeverity.High,
        message: 'Authentication required',
        timestamp: new Date(),
        retryable: false
      };
    }
    
    if (status === 403) {
      return {
        type: ErrorType.Authorization,
        severity: ErrorSeverity.High,
        message: 'Access denied',
        timestamp: new Date(),
        retryable: false
      };
    }
    
    if (status === 404) {
      return {
        type: ErrorType.NotFound,
        severity: ErrorSeverity.Medium,
        message: 'Resource not found',
        timestamp: new Date(),
        retryable: false
      };
    }
    
    if (status === 409) {
      return {
        type: ErrorType.Conflict,
        severity: ErrorSeverity.Medium,
        message: message,
        timestamp: new Date(),
        retryable: false
      };
    }
    
    if (status >= 500) {
      return this.createServerError(message, status);
    }
    
    return {
      type: ErrorType.Unknown,
      severity: ErrorSeverity.Medium,
      message,
      timestamp: new Date(),
      retryable: true
    };
  }
}