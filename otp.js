// use this script to convert the otpUri to a code
// run node otp.js
import { generateTOTP } from '@epic-web/totp';

// test code: 12036314

// Paste your string here. It should start with "otpauth://totp/" and include a secret and other params
const otpString = `otpauth://totp/localhost%3A3000:test%40gmail.com?secret=4EDQELGDNHP57HWR&issuer=localhost%3A3000&algorithm=SHA256&digits=8&period=600
`;

const otpUri = new URL(otpString);
const { secret, algorithm, digits, period } = Object.fromEntries(
  otpUri.searchParams.entries()
);

const { otp } = generateTOTP({
  secret,
  algorithm,
  digits,
  period,
});

console.log(otp);
