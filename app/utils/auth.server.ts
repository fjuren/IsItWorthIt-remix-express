// added to avoid sending bcrypt to the client (See remix docs https://remix.run/docs/en/main/discussion/server-vs-client)
// @ts-expect-error check this error
import bcrypt from 'bcryptjs';

export { bcrypt };
