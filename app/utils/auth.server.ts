// added to avoid sending bcrypt to the client (See remix docs)
// @ts-expect-error check this error
import bcrypt from 'bcryptjs';

export { bcrypt };
