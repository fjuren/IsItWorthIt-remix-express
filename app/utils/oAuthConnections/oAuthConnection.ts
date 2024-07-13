import { OAuthConnection, User } from '@prisma/client';
import { type DiscordProfile } from 'remix-auth-discord';
import { DISCORD_OAUTH_NAME } from '../oAuthConnections';

export interface OAuthUser {
  email: User['email'];
  oAuthConnectionProviderId: OAuthConnection['id'];
  oAuthConnectionProviderName: OAuthConnection['connectionName'];
  username: User['username'];
  avatar?: string;
}

export interface DiscordUser {
  id: DiscordProfile['id'];
  userName: DiscordProfile['__json']['username'];
  // displayName?: DiscordProfile['displayName'];
  avatar?: DiscordProfile['__json']['avatar'];
  email?: DiscordProfile['__json']['email'];
  // accessToken: string;
  // refreshToken: string;
}

export interface SupportedOAuthTypes {
  id: string | undefined;
  connectionId: string | undefined;
  connectionName: string;
  createdAtFormatted: Date | string | undefined;
  hasConnection: boolean;
}
// created an array of supported oAuth connection providers. Extend this array as new oAuth providers are supported (only discord is supported at this time)
export const supportedOauthConnections: SupportedOAuthTypes[] = [
  {
    id: undefined,
    connectionId: undefined,
    connectionName: DISCORD_OAUTH_NAME,
    createdAtFormatted: undefined,
    hasConnection: false,
  },
];
