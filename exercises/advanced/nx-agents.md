# `📖 Exercise:` Task distribution with Nx Agents

## 📚&nbsp;&nbsp;**Learning outcomes**

- How to adjust your CI to enable task distribution with Nx Agents
- How to create a custom launch template for Nx Agents

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Update your CI config to enable Nx Agents

- open `.github/workflows/ci.yml`
- uncomment the corresponding line to enable Nx Agents
- have agents stop after `e2e` tasks
- for now, uncomment the `deploy` target (we'll come back to this later)
- commit the changes and push them to trigger a new CI run
- Inspect the Nx Cloud dashboard to see the Agents instantiate and process tasks

<details>
<summary>🐳&nbsp;&nbsp;Hint: uncomment agents</summary>

```bash
- run: npx nx-cloud start-ci-run --distribute-on="3 linux-medium-js" --stop-agents-after="e2e"
```

</details>

### 2. Dynamically scale Nx Agents based on the size of the changeset

- Create a new file `.nx/workflows/dynamic-changesets.yaml`. [Check the docs](https://nx.dev/ci/features/dynamic-agents) for help on the format.
- Adjust your Nx Agent setup in your CI config to use the new launch template.
- Test it out by triggering new CI runs with different changeset sizes.

<details>
<summary>🐳&nbsp;&nbsp;Solution (changesets)</summary>

```yaml
distribute-on:
  small-changeset: 2 linux-medium-js
  medium-changeset: 5 linux-medium-js
  large-changeset: 8 linux-medium-js
```

</details>

Use the

### 3. Create a custom template to install Fly.io

Re-enable the `deploy` target in your CI config and check the output log. You should probably see an error about not being able to find `fly` in the PATH.

```bash
/bin/sh: 1: flyctl: not found
```

This is because the [default Nx Agents templates](https://github.com/nrwl/nx-cloud-workflows/tree/main/launch-templates) do not include the `fly` CLI.

To use the Fly CLI on Nx Agents we need to create a custom launch template. Use the [docs](https://nx.dev/ci/reference/launch-templates) as a reference to create a new template in `.nx/workflows/agents.yaml`.

<details>
<summary>🐳&nbsp;&nbsp;Hint: Installing Fly.io</summary>

```
curl -L https://fly.io/install.sh | sh
```

To add it to the PATH, you can use the following command:

```
echo PATH="$HOME/.fly/bin:$PATH" >> $NX_CLOUD_ENV
```

</details>

<details>
<summary>🐳&nbsp;&nbsp;Solution (custom launch template)</summary>

```yaml
launch-templates:
  ngbe-linux-medium-js:
    resource-class: 'docker_linux_amd64/medium'
    image: 'ubuntu22.04-node20.11-v10'
    init-steps:
      - name: Checkout
        uses: 'nrwl/nx-cloud-workflows/v4/workflow-steps/checkout/main.yaml'
      - name: Restore Node Modules Cache
        uses: 'nrwl/nx-cloud-workflows/v4/workflow-steps/cache/main.yaml'
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml'
          paths: 'node_modules'
          base-branch: 'main'
      - name: Restore Browser Binary Cache
        uses: 'nrwl/nx-cloud-workflows/v4/workflow-steps/cache/main.yaml'
        inputs:
          key: 'package-lock.json|yarn.lock|pnpm-lock.yaml|"browsers"'
          paths: |
            '../.cache/Cypress'
          base-branch: 'main'
      - name: Install Node Modules
        uses: 'nrwl/nx-cloud-workflows/v4/workflow-steps/install-node-modules/main.yaml'
      - name: Install Browsers (if needed)
        uses: 'nrwl/nx-cloud-workflows/v4/workflow-steps/install-browsers/main.yaml'
      - name: Install Fly.io
        script: |
          curl -L https://fly.io/install.sh | sh
          echo PATH="$HOME/.fly/bin:$PATH" >> $NX_CLOUD_ENV
```

</details>

Use the new launch template in your CI config, then commit and push the changes to trigger a new CI run.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

If you're using dynamic scaling, you'll need to update the Nx agent image that's being used in the `dynamic-changesets.yaml` file.

</details>

Inspect the Nx Cloud dashboard. You should see your new launch template being used.

![custom-launch-template](images/nx-cloud-custom-launch-template.png)

> ⚠️&nbsp;&nbsp;Your Fly.io deployment might still not work. Check the logs on Nx CLoud to see why.

Use the following [docs page](https://nx.dev/ci/reference/launch-templates#pass-environment-variables-to-agents) to fix the issue.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

You need to forward the environment variables to the Nx Agents by using the `--with-env-vars` flag:

```bash
 --with-env-vars="SURGE_DOMAIN_STORE,SURGE_TOKEN,FLY_API_TOKEN"
```

</details>

## [➡️ Next lab ➡️](.)
