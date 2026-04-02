// Registration API Error Helper
// Provides user-friendly error messages for common registration issues

export interface RegistrationError {
  field: string;
  message: string;
  code: string;
}

export class RegistrationErrorHandler {
  static formatPasswordErrors(errors: string[]): RegistrationError[] {
    return errors.map(error => ({
      field: 'password',
      message: error,
      code: 'WEAK_PASSWORD'
    }));
  }

  static formatEmailError(): RegistrationError {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    };
  }

  static formatNameError(): RegistrationError {
    return {
      field: 'name',
      message: 'Name must be between 2 and 50 characters and contain only letters, spaces, and common punctuation',
      code: 'INVALID_NAME'
    };
  }

  static formatExistingUserError(): RegistrationError {
    return {
      field: 'email',
      message: 'An account with this email already exists. Please sign in instead.',
      code: 'USER_EXISTS'
    };
  }

  static formatRateLimitError(): RegistrationError {
    return {
      field: 'general',
      message: 'Too many registration attempts. Please wait a few minutes before trying again.',
      code: 'RATE_LIMITED'
    };
  }

  static formatGeneralError(): RegistrationError {
    return {
      field: 'general',
      message: 'Registration failed. Please check your information and try again.',
      code: 'REGISTRATION_FAILED'
    };
  }
}

// Password validation hints for the frontend
export const PasswordHints = {
  length: 'At least 6 characters long',
  avoid: 'Avoid very common passwords like "password" or "123456"',
  examples: [
    'mypass',
    'simple123',
    'hello2024',
    'mysecret'
  ]
};

export default RegistrationErrorHandler;