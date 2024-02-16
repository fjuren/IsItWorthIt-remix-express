import { json, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// look at data mutations
export const meta: MetaFunction = () => {
  return [{ title: 'Home' }, { name: 'description', content: 'Homepage' }];
};

export async function loader({ request }) {
  return json({ hello: 'world' });
}

export default function HomeRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Homepage</h1>
      <p>{data.hello}</p>
    </div>
  );
}
