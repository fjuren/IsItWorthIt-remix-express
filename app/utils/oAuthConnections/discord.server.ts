import { Authenticator } from 'remix-auth';
import { oAuthSessionStorage } from '../oAuthConnections.server';
import { DiscordStrategy } from 'remix-auth-discord';
import { DISCORD_OAUTH_NAME } from '../oAuthConnections';
import { DiscordUser } from './oAuthConnection';

// https://github.com/sergiodxa/remix-auth for docs
export const auth = new Authenticator<DiscordUser>(oAuthSessionStorage);

const discordStrategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: '/auth/discord/callback',
    // Provide all the scopes you want as an array
    scope: ['identify', 'email'],
  },
  async ({
    // accessToken,
    // refreshToken,
    // extraParams,
    profile,
  }): Promise<DiscordUser> => {
    const email = profile.emails
      ? profile.emails[0].value.trim().toLowerCase()
      : false;

    if (!email) {
      // TODO redirect to the login page and throw a toast message telling the user that they don't have an email account in their discord account
    }

    console.log('PROFILE FROM AUTHSERVER: ', profile);

    return {
      id: profile.id,
      displayName: profile.displayName,
      avatar: profile.__json.avatar,
      email: profile.__json.email,
      // accessToken,
      // refreshToken,
    };
  }
);

auth.use(discordStrategy, DISCORD_OAUTH_NAME);
