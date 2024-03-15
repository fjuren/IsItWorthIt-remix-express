import { MetaFunction } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { Button } from '~/components/UI/Button';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';

export const meta: MetaFunction = () => {
  return [
    { title: 'Signup' },
    {
      name: 'description',
      content: 'Sign up for an account',
    },
  ];
};

// need loader?

export default function SignupRoute() {
  return (
    <div className="flex flex-col items-center">
      <div>
        <p>Signup for an account</p>
      </div>
      <div className="w-80 ">
        <Form>
          <div>
            <Label>First name</Label>
            <Input type="string" placeholder="" required />
          </div>
          <div>
            <Label>Last name</Label>
            <Input type="string" placeholder="" required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="" required />
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type="password" placeholder="" required />
          </div>
        </Form>
      </div>
      <div>
        <Button type="submit">Sign up</Button>
      </div>
    </div>
  );
}
