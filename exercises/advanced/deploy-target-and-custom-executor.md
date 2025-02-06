# `📖 Exercise:` Deploy targets and custom executors

## 📚&nbsp;&nbsp;**Learning outcomes**

- Learn how to use `run-commands` to create custom deploy targets
- Understand how and when to use custome executors to wrap complex run commands into simple reusable form

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Test deployment with Surge

We'll use a CLI tool called [Surge](https://surge.sh/) to statically deploy the front-end. Create an account with Surge (it's free) to generate a token we will need for deployment:

```bash
npm i -D surge
npx surge token
```

Build the `movies-app` applications first, and then run the following command to deploy it:

```bash
npx surge dist/apps/movies-app/browser https://{chose-some-unique-url-123}.surge.sh --token {your-surge-token}
```

> ⚠️&nbsp;&nbsp;Make sure you chose a **unique value** for your domain above, otherwise it will fail as you won't have permission to deploy to an existing one.

Navigate to that URL in your browser to verify it's deployed.

> ⚠️&nbsp;&nbsp;We haven't deployed our backend yet, so no we should see error in the browser, similarly to what you see if you'd only serve the `movies-app` from your local machine.

### 2. Automate deployment via executor

Let's now abstract away the above command into an Nx target. Generate a new **"deploy"** target using the `@nx/workspace:run-commands` generator:

- under the `movies-app` project
- the `command` will be the same as the one you typed in the previous step

<details>
<summary>🐳 Hint: Run-commands generator</summary>

Consult the run-commands generator docs [here](https://nx.dev/packages/workspace/generators/run-commands).

</details>
<br/>
Explore what the changes to your `project.json` are and test your new executor.
<br/><br/>
<details>
<summary>🐳&nbsp;&nbsp;Hint: Run deploy target</summary>

```bash
npx nx deploy movies-app
```

</details>

### 3. Extract parameters to environment variables

We're now storing the surge token in `project.json`. We don't want to check-in this file and risk exposing this secret token. Also, we might want to deploy to different domains depending on the environment. Let's move these out. Create a new file `apps/movies-app/.local.env` and add our secrets to it:

```env
SURGE_TOKEN=<your-surge-token>
SURGE_DOMAIN=https://<some-unique-url-123>.surge.sh
```

Finally, update your "deploy" command, so that it loads the values from the ENV, using the `${ENV_VAR}` syntax.

> ⚠️&nbsp;&nbsp;Make sure to add `.local.env` to your root `.gitignore` file. We don't want those files to be pushed to git.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

```bash
surge dist/apps/movies-app/browser ${SURGE_DOMAIN} --token ${SURGE_TOKEN}
```

</details>

### 4. Verify everything works

Now invoke the deploy target again, and check if it all still works.

> ⚠️&nbsp;&nbsp;Note for Windows users: the command might fail, as we're trying to access env variables the Linux-way.
> To make it pass, you can generate a separate `windows-deploy` executor (make sure you keep the existing `deploy` target intact - it will be used by GitHub Actions):

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

```bash
nx generate run-commands windows-deploy --project=store --command="surge dist/apps/store %SURGE_DOMAIN% --token %SURGE_TOKEN%"
nx windows-deploy store
```

</details>
<br/>
<details>
<summary>❓&nbsp;&nbsp;How does that work?</summary>

> We did not load those environment variables into the deploy process anywhere. We just added a `.local.env` file. How did Nx know where to look?
>
> Nx [automatically picks up](https://nx.dev/recipe/define-environment-variables#setting-environment-variables) any `.env` or `.local.env` files in your workspace,
> and loads them into processes invoked for that specific app.

</details>

### 5. Ensure build is always run

We currently have to remember to always run the build before deploying an app. Can you fix this, so that it always makes sure the app is built before we deploy?

<details>
<summary>🐳&nbsp;&nbsp;Hint: `dependsOn` parameter</summary>

Consult the project configuration docs [here](https://nx.dev/reference/project-configuration#dependson).

</details>

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```json
"deploy": {
  "command": "npx surge dist/apps/movies-app/browser ${SURGE_DOMAIN} --token ${SURGE_TOKEN}",
  "dependsOn": ["build"],
}
```

</details>

### 6. Try the API build

If you run `nx build movies-api` and navigate to `cd dist/apps/movies-api && node main.js` it should work, because it has access to `node_modules`. But if you copy your built sources to some other folder on your file system and then try to `node main.js` in the folder that doesn't have access to `node_modules` - it will fail.

> 💡 By default, dependencies of server projects are not bundled together, as opposed to your Angular apps. If curious why, you can [read more here](https://github.com/nestjs/nest/issues/1706#issuecomment-579248915).

### 7. Include external dependencies in build

Let's fix the above - In `project.json`, we need to add **production** build options for the API (`targets -> build -> configurations -> production`). Our `build` is inferred from `@nx/webpack` plugin so that entire section is missing:

```jsonc
"targets": {
  // ...
  "build": {
    "configurations": {
      "production": {
        "externalDependencies": [
          "@nestjs/microservices",
          "@nestjs/microservices/microservices-module",
          "@nestjs/websockets/socket-module",
          "class-transformer",
          "class-validator",
          "cache-manager",
          "cache-manager/package.json"
        ],
      }
    }
  }
}
```

<details>
<summary>❓&nbsp;&nbsp;What does this do?</summary>

> The above option tells webpack to bundle ALL the dependencies our API requires inside `main.js`, except the ones above (which fail the build if we tell webpack to include, because they're lazily loaded).
>
> Normally, it's not recommended to bundle any dependencies with your server bundles,
> but in this case it simplifies the deployment process.

</details>

Let's build our application again. This time if we would copy the contents of our `dist`, install dependencies and run `node main.js` it would work.

### 8. Login to Fly.io and prepare configuration for the deployment

Similarly to Surge earlier, we need to login to Fly.io and store the token for later use:

```bash
# login first
flyctl auth login
```

Inside your `dist/apps/movies-api` run a command:

```bash
flyctl launch --now --name=<name of your app> --yes --copy-config --region=lax
```

This will detect our NestJS project and configure Fly.io. It will genetate following files:

- `fly.toml` where our Fly.io configuration is set
- `Dockerfile` with our Docker image specs and
- `.dockerignore` with standard docker ignore config.

Fly.io will also create the application and deploy it. If you go to `https://<your-app-name>.fly.dev` you will see your API running.
Let's copy all three files to our `apps/movies-api/src`.

While still in the dist folder run following command:

```bash
flyctl tokens create deploy -x 999999h
```

This will generate your unique auth token. Copy the output, including the FlyV1 and space at the beginning. Let's store the token in the `apps/movies-api/.local.env` environment file:

```env
FLY_API_TOKEN="<your-fly-token>"
```

As we want those three files above to be copied rather than re-generated every time, add the following to our `project.json` in `movies-api` (`targets -> build -> configurations -> production`):

```json
"assets": [
    "apps/movies-api/src/assets",
    "apps/movies-api/src/fly.toml",
    "apps/movies-api/src/Dockerfile",
    "apps/movies-api/src/.dockerignore",
],
```

When we want to deploy, we'll build our app to `dist/apps/movies-api` and we need to make sure that `fly.toml` and `Dockerfile` make it to the same folder. Fly will copy the bundled code to the remote server and run the node server.

Finally, make sure the `production` configuration is the default one by setting the `defaultConfiguration` property accordingly.

### 9. Build an executor

We can now use our `internal-plugin` to create a custom executor. Use the `@nx/plugin:executor` generator to generate a `fly-deploy` executor:

The executor should have options for:

- the target `dist` location
- the `name` of your fly app

When running, your executor should perform the following tasks, using the `fly` CLI:

- list the current fly apps: `fly apps list`
- if the app doesn't exist, launch it: `fly launch --now --name=<the name of your Fly App> --region=lax --copy-config --yes`
- if the app exists, deploy it again: `fly deploy`

Fly launch and deploy commands need to be run in the `dist` location of your app.

<details>
<summary>🐳&nbsp;&nbsp;Hint: generate executor</summary>

```shell
npx nx generate @nx/plugin:executor libs/internal-plugin/src/executors/fly-deploy --name=fly-deploy
```

</details>
<br/>
Adjust the generated `schema.json` and `schema.d.ts` file to match the required options.
<br/><br/>

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "title": "Fly deploy executor",
  "description": "",
  "type": "object",
  "properties": {
    "distLocation": {
      "type": "string"
    },
    "flyAppName": {
      "type": "string"
    }
  },
  "required": ["distLocation", "flyAppName"]
}
```

```typescript
export interface FlyDeployExecutorSchema {
  distLocation: string;
  flyAppName: string;
}
```

</details>

### 10. Add executor's logic

Implement the required fly steps using `execSync` to call the `fly` cli inside your `executor.ts` file:

```typescript
import { PromiseExecutor } from '@nx/devkit';
import { FlyDeployExecutorSchema } from './schema';
import { execSync } from 'child_process';

const runExecutor: PromiseExecutor<FlyDeployExecutorSchema> = async (options) => {
  const cwd = options.distLocation;
  const results = execSync(`flyctl apps list`);
  try {
    if (results.toString().includes(options.flyAppName)) {
      execSync(`flyctl deploy`, { cwd, stdio: 'inherit' });
    } else {
      // consult https://fly.io/docs/reference/regions/ to get best region for you
      execSync(`flyctl launch --now --name=${options.flyAppName} --yes --copy-config --region=lax`, {
        cwd,
        stdio: 'inherit',
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Deployment failed:', error);
    return { success: false };
  }
};

export default runExecutor;
```

Next we'll need to add a `deploy` target to our `apps/movies-api/project.json` file:

```jsonc
{
  "deploy": {
    "executor": "@nx-workshop/internal-plugin:fly-deploy",
    "outputs": [],
    "options": {
      "distLocation": "dist/apps/movies-api",
      "flyAppName": "my-unique-app-name" // don't forget to update this value
    },
    "dependsOn": [{ "target": "build", "projects": "self", "params": "forward" }]
  }
}
```

### 12. Final touches and test

Let's enable CORS on the server so our API can make requests to it (since they'll be deployed in separate places):

In `apps/movies-api/src/main.ts` make following change to enable CORS:

```ts
// ...
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors(); // <--- ADD THIS
  // ...
}
// ...
```

> ⚠️&nbsp;&nbsp;Normally, you want to restrict this to just a few origins. But to keep things simple in this workshop we'll enable it for all origins.

Now run the command to deploy your api!!

```shell
npx nx deploy movies-api --prod
```

Because of how we set up our `dependsOn` for the `deploy` target, Nx will know that it needs to run the production build of the api before then running the deploy!

Go to `https://<your-app-name>.fly.dev/api/genre/list` - it should return you a list of genres.

### 13. Connect frontend and backend

When we serve the Store and API locally, they work great, because of the configured proxy discussed in previous labs. The Store will think the API lives at the same address.

When deployed separately however, they do not yet know about each other. Let's configure a production URL for the API. Let's fix that.

Create `apps/movies-app/src/environments/environment.prod.ts` with following contents:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://<your-fly-app-name>.fly.dev',
};
```

Add environment file replacement in `apps/movies-app/project.json`:

```jsonc
{
  //...
  "targets": {
    //...
    "build": {
      //...
      "configurations": {
        "production": {
          //...
          // Add this property:
          "fileReplacements": [
            {
              "replace": "apps/movies-app/src/environments/environment.ts",
              "with": "apps/movies-app/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    }
  }
}
```

Deploy both frontend and backend and verify whether the movies are shown this time.

## [➡️ Next lab ➡️](./setup-ci-and-connect-nx-cloud.md)
