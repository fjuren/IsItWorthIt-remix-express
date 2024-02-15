import { json, type LoaderFunction, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{ title: 'Home' }, { name: 'description', content: 'Homepage' }];
};

// var requestOptions = {
//   method: 'GET',
//   redirect: 'follow'
// };

// fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));

export async function loader({ request }: LoaderFunction) {
  return json({ hello: 'world' });
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Homepage</h1>
      <p>{data.hello}</p>
    </div>
  );
}
