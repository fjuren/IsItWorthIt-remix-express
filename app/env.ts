// File is recommended from remix to react-router v7 doc. See step 9 here: https://reactrouter.com/upgrading/remix#9-update-types-for-apploadcontext
// This file is not needed yet
declare module "react-router" {
  // Your AppLoadContext used in v2
  interface AppLoadContext {
    // Add your context properties here
  }

  // TODO: remove this once we've migrated to `Route.LoaderArgs` instead for our loaders
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated to `Route.ActionArgs` instead for our actions
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}

export {}; // necessary for TS to treat this as a module
