# `📖 Exercise:` Automated Task Splitting with Nx Atomizer

## 📚&nbsp;&nbsp;**Learning outcomes**

- Understand the concept of Nx Atomizer and why it is useful
- Learn how to use Nx Atomizer to split tasks into smaller chunks for our Playwright tests

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 0. Remove obsolete Playwright installation on GH Actions

Notice the GH actions log and how we're installing Playwright on GH Actions even though we moved running these to Nx Agents. Optimize the CI config to avoid such duplication.

Test whether your CI still works properly.

### 1. Inspect whether Atomizer is already enabled

Open the project detail view for our `movies-app-e2e` project. You should see multiple runnable targets per Playwright spec file. If that's the case then Atomizer is enabled for our Playwright e2e tests.

**How?** This is because in `nx.json` we have the `@nx/playwright/plugin` registered which automatically enables Atomizer. Find the `plugins` section in `nx.json` and set `ciTargetName` to `false` on the Nx Playwright plugin configuration. This is how you switch off Atomizer. Check again the project detail view which should reflect that accordingly.

Check out the [docs on Atomizer](https://nx.dev/ci/features/split-e2e-tasks) for more information.

### 2. Enable Atomizer on CI

Make sure you have the `ciTargetName` set or remove it at all (since it is enabled by default).

Then adjust your CI configuration to leverage Atomized e2e targets instead of the default `e2e`.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

- use the `e2e-ci` target instead of `e2e`
- make sure to update the stop-agents-after property accordingly

</details>

Push your changes to the remote repository and observe the CI logs and whether e2e tasks are now split across multiple agents.

### 3. Make sure atomized e2e tasks are distributed across multiple agents

**Did it work?** Note, for e2e tests we don't want to run multiple of them at the same time on the same machine, to avoid side-effects.

By default Nx runs tasks in parallel which can be controlled by the `--parallel` flag that can be passed to the Nx commands.

We don't want to have multiple run-many commands though like

```yaml
- run: npx nx affected -t lint test build deploy
- run: npx nx affected -t e2e-ci --parallel 1
```

As an alternative you can se the `parallelism` property on the target. Go to `nx.json` and make sure it is set to `false` for all `e2e-ci` targets.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

Since `e2e-ci` targets are generated dynamically and have different names you need to leverage wildcards.

```json
"e2e-ci--**/*": {
  ...
  "parallelism": false
}
```

</details>

Once you adjusted the `parallelism` property, push your changes to the remote repository and observe the CI logs and whether e2e tasks are now distributed across multiple agents.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```json
"e2e-ci--**/*": {
  ...
  "parallelism": false
}
```

</details>

## [➡️ Next lab ➡️](./flaky-tasks.md)
