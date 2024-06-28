import { type DiscordProfile } from 'remix-auth-discord';

export interface DiscordUser {
  id: DiscordProfile['id'];
  displayName: DiscordProfile['displayName'];
  avatar?: DiscordProfile['__json']['avatar'];
  email?: DiscordProfile['__json']['email'];
  // accessToken: string;
  // refreshToken: string;
}
