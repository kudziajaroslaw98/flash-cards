import { SignInResponse } from './sign-in-response.type';

export type SignUpResponse = SignInResponse | { message: string };
