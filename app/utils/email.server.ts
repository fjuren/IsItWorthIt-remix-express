import { getErrorMessage } from './misc';

export async function sendEmail(options: {
  to: string;
  subject: string;
  html?: string;
  text: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const email = {
    from: 'fakeemail@gmail.com',
    ...options,
  };

  // 📜 https://resend.com/docs/api-reference/emails/send-email
  const url = 'https://api.resend.com/emails';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(email),
  });
  const data = await response.json();
  console.log('DATA?? ', data);
  if (!response.ok) {
    return { status: 'error', error: getErrorMessage(data) };
  }
  return { status: 'success' };
}
