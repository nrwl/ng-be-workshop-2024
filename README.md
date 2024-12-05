<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="100"></a>

<h1 align="center">✨ Nx Masterclass Workshop ✨ </h2>

> In this workshop we will be extending the Nx workspace containing two applications and several feature and utility libraries that represent a simple IMDB clone.
>
> Our frontend application is built with Angular and our backend is built with NestJS but we will be focusing on the Nx itself rather than the actual codebase.
>
> Feel free to change the style or business logic of those apps prior to workshop to your liking.
>
> This is what we're working with:
>
> <img src="exercises/assets/movie-app.webp" alt="Movies app">

---

## Setup

### Prerequisites

- Node v20+
  - Check with `node --version`
- Optionally [Yarn](https://yarnpkg.com/) or [Pnpm](https://pnpm.io/)
- [GitHub](https://github.com/) account
- IDE of your choice
- A [Fly.io](https://fly.io/) account with CLI installed
  - Check with: `fly help`
  - `Note` No need to set up the Credit card, we will use free tier

### Getting the repo

- Fork this repo
- Clone your fork and install dependencies

  ```bash
  git clone https://github.com/{your name}/ng-be-workshop-2024.git

  npm install
  # optionally use `yarn` or `pnpm`
  ```

### Get acquainted with the application

- Serve both frontend and the backend
  ```
  npx nx run-many -t serve
  ```
- Open [localhost:4200](http://localhost:4200) in your browser and click around
- Bonus if you spot some missing or broken functionality and you fix them
- Check the `apps` and `libs` folder
- Run `npx nx graph` to see how architecture looks like

### Discord workshop channel

Join the [Discord channel](https://discord.gg/xr95Aap5)

---

## Let's get started

| `Advanced course`                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [📖 Course introduction](./exercises/advanced/advanced-intro.md)                                                                                                               |
| 📖 [Automate your workspace with local plugins and custom generators](./exercises/advanced/custom-plugins.md)                                                                  |
| `☕ Break`                                                                                                                                                                     |
| 📖 [Learn how to write and test your complex generators](./exercises/advanced/complex-generators.md)                                                                           |
| 📖 [Write advanced deployment targets using a custom executor](./exercises/advanced/deploy-target-and-custom-executor.md)                                                      |
| `☕ Break`                                                                                                                                                                     |
| 📖 [Set up CI for your pull requests, connect to Nx Cloud, enable remote caching and the GitHub integration](./exercises/advanced/setup-ci-and-connect-nx-cloud.md)            |
| 📖 [Nx Caching deep dive: Strategies for debugging cache misses, optimization strategies, and fine-tuning cache inputs and outputs](./exercises/advanced/caching-deep-dive.md) |
| 📖 [Set up continuous deployment pipeline for affected applications](./exercises/advanced/continuous-deployment.md)                                                            |
| `☕ Break`                                                                                                                                                                     |
| 📖 [Configure task distribution on CI with Nx Agents, including exploring custom launch templates and dynamic agent scaling.](./exercises/advanced/nx-agents.md)               |
| 📖 [Leverage Nx Crystal plugins and Nx Atomizer to configure task splitting for improving CI distribution and speed](./exercises/advanced/atomizer.md)                         |
| 📖 [Explore flaky task detection](./exercises/advanced/flaky-tasks.md)                                                                                                         |
| `Bonus:` [Infer Fly.io deploy target](./exercises/advanced/infer-target.md)                                                                                                    |
| `Bonus:` [Nx import, CodeOwners, and Conformance](./exercises/advanced/bonus.md)                                                                                               |

---

## Extras

### Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
