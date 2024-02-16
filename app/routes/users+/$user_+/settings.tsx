// import type { MetaFunction } from '@remix-run/node';

import { Link } from '@remix-run/react';

// export const meta: MetaFunction = () => {
//   return [{ title: 'Home' }, { name: 'description', content: 'Homepage' }];
// };

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
