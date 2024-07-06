import { OAuthConnection, User } from '@prisma/client';
import { type DiscordProfile } from 'remix-auth-discord';

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
