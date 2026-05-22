export interface RefreshTokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
