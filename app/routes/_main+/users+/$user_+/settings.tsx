// import type { MetaFunction } from '@remix-run/node';

import { Link, MetaFunction } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings' },
    { name: 'description', content: 'Settings page' },
  ];
};

export default function UserSettings() {
  return (
    <div>
      <h1>Settings</h1>
      <Link to=".." relative="path">
        back
      </Link>
    </div>
  );
}
