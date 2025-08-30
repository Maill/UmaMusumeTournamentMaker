import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface AppError {
  message: string;
  userMessage: string;
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  statusCode?: number;
  canRetry: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  // Convert HTTP errors to user-friendly errors
  handleHttpError(error: HttpErrorResponse): AppError {
    console.error('HTTP Error:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      return {
        message: error.error.message,
        userMessage: 'Network error. Please check your connection and try again.',
        type: 'network',
        canRetry: true
      };
    }

    // Server-side error
    const statusCode = error.status;
    let appError: AppError;

    switch (statusCode) {
      case 400:
        appError = {
          message: error.error?.message || 'Bad request',
          userMessage: error.error?.message || 'Invalid data provided. Please check your input.',
          type: 'validation',
          statusCode,
          canRetry: false
        };
        break;

      case 401:
        appError = {
          message: 'Unauthorized',
          userMessage: 'Password required. Please provide the tournament password.',
          type: 'auth',
          statusCode,
          canRetry: true
        };
        break;

      case 403:
        appError = {
          message: 'Forbidden',
          userMessage: 'Invalid password. Please check the tournament password.',
          type: 'auth',
          statusCode,
          canRetry: true
        };
        break;

      case 404:
        appError = {
          message: 'Not found',
          userMessage: 'Tournament not found. It may have been deleted.',
          type: 'validation',
          statusCode,
          canRetry: false
        };
        break;

      case 409:
        appError = {
          message: error.error?.message || 'Conflict',
          userMessage: error.error?.message || 'This action conflicts with the current tournament state.',
          type: 'validation',
          statusCode,
          canRetry: false
        };
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        appError = {
          message: 'Server error',
          userMessage: 'Server error. Please try again in a few moments.',
          type: 'server',
          statusCode,
          canRetry: true
        };
        break;

      default:
        appError = {
          message: error.error?.message || error.message || 'Unknown error',
          userMessage: 'Something went wrong. Please try again.',
          type: 'unknown',
          statusCode,
          canRetry: true
        };
    }

    return appError;
  }

  // Convert generic errors to user-friendly errors
  handleGenericError(error: any): AppError {
    console.error('Generic Error:', error);

    return {
      message: error?.message || 'Unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      type: 'unknown',
      canRetry: true
    };
  }

  // Get error icon for UI
  getErrorIcon(errorType: AppError['type']): string {
    switch (errorType) {
      case 'network':
        return 'refresh';
      case 'validation':
        return 'warning';
      case 'auth':
        return 'warning';
      case 'server':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Get error color for UI
  getErrorColor(errorType: AppError['type']): string {
    switch (errorType) {
      case 'network':
        return 'warning';
      case 'validation':
        return 'danger';
      case 'auth':
        return 'warning';
      case 'server':
        return 'danger';
      default:
        return 'info';
    }
  }

  // Check if error should show retry button
  canShowRetry(error: AppError): boolean {
    return error.canRetry;
  }
}