# `📖 Exercise:` Continuous deployment for affected projects

## 📚&nbsp;&nbsp;**Learning outcomes**

- Learn how to configure continuous deployments
- Learn how to expose custom secrets on GitHub to your CD processes
- Learn when to enable deployment caching and how to control it

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Optimizing inputs for deploy target

In the previous lab we learned how to configure the inputs and outputs to better control when is our task's cache being busted.
Both of our deploy commands are NOT using first-party `@nx/...` executors for invoking the commands, so any changes to the installed dependencies/lockfile will have their cache busted.

To avoid that, we need to limit the list of packages whose changes can influence those executors. We will use `externalDependencies` input mentioned in the previous lab. As both of them depend on the `nx` itself, we will add it via `targetDependencies` in `nx.json`:

```jsonc
"targetDefaults": {
  // ...
  "deploy": {
    "dependsOn": ["build"],
    "inputs": [
      "production",
      "^production",
      { "externalDependencies": ["nx" ]}
    ],
  },
  // ...
}
```

Since we specified `dependsOn` in our target defaults, we can go ahead and remove it from our `project.json` files. Notice how `deploy` now also depends on `production` instead of `default`. We don't want e.g. changes to unit tests to trigger the deployment.

Both of these also have their own set of dependencies:

- Surge deployment depends on the `surge` package
- Fly deployment depends on the `fly` CLIs version

Let's add those respectively to their `project.json` files.

> ⚠️&nbsp;&nbsp;Fly.io CLI tool is not an npm package, so we need to check it as a runtime dependency

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

// apps/movies-app/project.json

```jsonc
"deploy": {
  // ...
  "inputs": [{ "externalDependencies": ["nx", "surge" ] }]
  // ...
}
```

// apps/movies-api/project.json

```jsonc
"deploy": {
  // ...
  "inputs": [{ "runtime": "fly version" }]
  // ...
}
```

</details>

### 2. Providing the environment variables to pipeline

Remeber how we created those `.local.env.` files? These unfortunately stay on your machine and are not pushed to CI, so we need to feed our pipeline with those values. Go to your GitHub repo and open `Settings`. Under `Secrets and variables`, select `Actions`, and then create a `New repository secret` for each of the variables we've been keeping in `.local.env` files. Make sure to use the same names and values.

![GitHub secrets](../assets/github-secrets.png)

Then back in our `ci.yaml` file, let's expose these secrets to the processes:

```yaml
env:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  SURGE_DOMAIN: ${{ secrets.SURGE_DOMAIN }}
  SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

### 3. Install Fly.io on the CI machine

The `surge` has been added to our NPM dependencies and will be available to the CI processes, but `Fly.io` is a standalone CLI tool. We need to add it to our pipeline. Since we want to use `deploy` only on the `main` branch we can install the tool only if we are on the `main` branch. Make sure it's added before the `nx affected` command.

Use `superfly/flyctl-actions/setup-flyctl@master` to install it and `github.ref == 'refs/heads/main'` to limit it to main branch only.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```yaml
- name: Setup flyctl
  uses: superfly/flyctl-actions/setup-flyctl@master
  if: github.ref == 'refs/heads/main'
```

</details>

### 4. Add deploy to nx affected

Similarly how we limited `fly.io` CLI install to `main` branch runs, we also want to include `deploy` target to `nx affected` when that command is running on the main branch. We can use the same `ref` condition to limit the invocation of the pipeline step. We want to have two `nx affected ...` commands:

- One that includes `deploy` and ONLY runs on `main`
- One that excludes `deploy` and DOESN'T run on `main`

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```yaml
- run: npx nx affected -t lint test build e2e deploy
  if: github.ref == 'refs/heads/main'

- run: npx nx affected -t lint test build e2e
  if: github.ref != 'refs/heads/main'
```

</details>

### 5. Final checks and tests

Your CI pipeline is now be ready for continuous deployment. Let's make some changes to see how they influence our pipeline.

Let's first make a change to `movies-api` (again any line comment would do, but you can also change the name of one movie for example to make the change visible). Push the change to `main` branch and let's monitor the Nx Cloud dashboard. We should see the deploy target being run for `movies-api` project.

Let's now change a contents of a `spec.ts` file within `movies-api`. Our project will still be affected since project was touched, but the changes should not bust the cache. We should see results being replayed from the cache - e.g. no re-deploy being triggered.

> ⚠️&nbsp;&nbsp;If your deployment doesn't work, consult the CI pipeline below for the correctness.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

env:
  SURGE_DOMAIN: ${{ secrets.SURGE_DOMAIN }}
  SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

permissions:
  actions: read
  contents: read

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # This enables task distribution via Nx Cloud
      # - run: npx nx-cloud start-ci-run --distribute-on="3 linux-medium-js" --stop-agents-after="e2e-ci"

      # Cache node_modules
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci --legacy-peer-deps
      - run: npx playwright install --with-deps
      - uses: nrwl/nx-set-shas@v4

      - name: Setup flyctl
        uses: superfly/flyctl-actions/setup-flyctl@master
        if: github.ref == 'refs/heads/main'

      - run: npx nx affected -t lint test build e2e deploy
        if: github.ref == 'refs/heads/main'

      - run: npx nx affected -t lint test build e2e
        if: github.ref != 'refs/heads/main'
```

</details>

### 6. `✨ BONUS` Should deployment be cacheable?

This is a very opinionated question and there is no right/wrong answer.

Why would we want `deploy` to be cacheable?

- The `nx affected ...` marks project as affected if any file belonging to that project changes even if it's unrelated to production bundle. Caching can limit the scope of it
- Caching is mandatory if we want to distribute `deploy` tasks across multiple agents (more on distribution in the next lab)
- Restarting the pipeline should not re-deploy already deployed projects

Why would we want `deploy` NOT to be cacheable?

- Deploy targets depend on external services which we cannot control. If something goes wrong we might end up with cache created while deployment failed (in this case both `surge` and `fly` should not return status 0 if their deployment fails). In order to fix that we need to bust the cache of those projects which would also restart `build` and other tasks.
- Cacheable targets store logs and artifacts in the cache. In case of `deploy` those artifacts end up on some third-party cloud storage to which `Nx Cloud` has no access so it can't replay those artifacts.

There are workarounds to the above mentioned problems:

- Having runtime input that changes with every CIPE, which enables cacheability and distribution but is effectively useless outside of that CIPE
- Using third-party storage like `Artifactory` to store built docker images and keep ID to built artifact in the output `dist` folder which both is a warrant for success and enables us to re-use the deployed artifacts.

For now, it's helpful for you to know potential challenges to make the best decision when the time comes.

## [➡️ Next lab ➡️](./nx-agents.md)
