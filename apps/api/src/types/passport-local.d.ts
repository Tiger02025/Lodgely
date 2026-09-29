declare module 'passport-local' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  interface IStrategyOptions {
    usernameField?: string;
    passwordField?: string;
    passReqToCallback?: boolean;
    session?: boolean;
  }

  declare class Strategy extends PassportStrategy {
    constructor(
      verify: (
        username: string,
        password: string,
        done: (error: any, user?: any, info?: any) => void,
      ) => void,
    );
    constructor(
      options: IStrategyOptions,
      verify: (
        username: string,
        password: string,
        done: (error: any, user?: any, info?: any) => void,
      ) => void,
    );
  }

  export { Strategy };
}
