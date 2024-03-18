import { MetaFunction, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
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

type ActionErrors = {
  formErrors: Array<string>;
  fieldErrors: {
    email: Array<string>;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');

  const errors: ActionErrors = {
    formErrors: [],
    fieldErrors: {
      email: [],
    },
  };

  //TODO Error logic

  return { email, errors };
}

// need loader?

export default function SignupRoute() {
  const actionData = useActionData<typeof action>();

  console.log(actionData);

  return (
    <div>
      <Card>
        <div>
          <p>Signup for an account</p>
        </div>
        <div className="w-80 ">
          <Form method="post">
            <div>
              <Label htmlFor="firstName">First name (Optional)</Label>
              <Input id="firstName" name="firstName" type="string" />
            </div>
            <div>
              <Label htmlFor="lastName">Last name (Optional)</Label>
              <Input id="lastName" name="lastName" type="string" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="string" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <div>
              <Button type="submit">Sign up</Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
