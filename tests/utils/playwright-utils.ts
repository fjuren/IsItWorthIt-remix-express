export function extractOtp(emailHtmlBody: string) {
  const match = emailHtmlBody.match(/code (\d+)\./);
  const otpCode = match ? match[1] : '';
  return otpCode;
}
