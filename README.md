Seeding DB: Use npx prisma db seed to seed the db.

Migrating to VITE setup documentation from [here](https://remix.run/docs/en/main/guides/vite#migrating-from-remix-app-server)

- install vite
- updated remix.config.js to vite.config.ts, updated with code
- Removed <LiveReload />
- Updated tsconfig
- Deleted remix.env.d.ts
- updated server.js
- updated package.json with dev/build/start scripts
- Come back to [here](https://remix.run/docs/en/main/guides/vite#migrate-references-to-build-output-paths) since you skipped it. May need to configure a netlify.toml file to manually configure deployment
- installed npm install -D vite-tsconfig-paths to configure path aliases in vite like I did with remix which OOB
- uninstall npm uninstall @remix-run/css-bundle since this is handled by VITE now, and remove its reference from /app/root.tsx links
- Skipped 'Fix up CSS imports referenced in links'. I don't think this applies to me since I'm using tailwind
- updated import tailwindFontsStylesheet from './styles/tailwind.css' by appending ?url. This is to accommodate tailwind css referencing in [links](https://remix.run/docs/en/main/styling/css) functions
-
