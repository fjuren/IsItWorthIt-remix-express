import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Signup' },
    {
      name: 'description',
      content: 'Sign up for an account',
    },
  ];
};

export default function SignupRoute() {
  return (
    <div>
      <p>Signup for an account</p>
    </div>
  );
}
