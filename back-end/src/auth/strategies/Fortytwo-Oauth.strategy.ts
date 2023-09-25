import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

@Injectable()
export class Fortytwostrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.UID,
      clientSecret: process.env.SECRET,
      callbackURL: process.env.REDIRECT_URI,
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string, data: any) {
    const user = {
      username: data._json.login,
      firstname: data._json.first_name,
      lastname: data._json.last_name,
      email: data._json.email,
      avatar: data._json.image.link,
    };

    return user;
  }
}
