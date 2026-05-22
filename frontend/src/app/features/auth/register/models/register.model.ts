export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'EMPTY' | 'TOO SHORT' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY STRONG';
  color: string;
}
