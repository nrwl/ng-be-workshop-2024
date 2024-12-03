# `📖 Excercise:` Advanced workshop intro

Welcome to our Advanced Nx Workshop! We are happy to have you joining us on this journey.

Today you will learn how to:
- Create your own `generators` and `executors`
- Use your `executors` to enable `continuous deployment`
- Enable `Nx Cloud` to benefit from the `cache replay` and `distribution`
- Configure your `target inputs` to avoid having unexpected cache misses
- Investigate `cache misses` to understand what changed between your runs
- Use `Atomizer` to further break your long-running tasks apart
- Protect from `flaky` tests breaking your CI runs
- Use the latest `Powerpack` features

## Setup & first run

If you haven't run through the setup steps please do them now:

- Fork this repo
- Clone your fork and install dependencies
  ```bash
  git clone https://github.com/{your name}/ng-be-workshop-2024.git

  npm install
  # optionally use `yarn` or `pnpm`
  ```
- If you cloned the repo earlier, ensure it's updated with upstream:
  ```bash
  git remote add upstream git@github.com:nrwl/ng-be-workshop-2024.git
  git fetch upstream main
  git rebase upstream/main
  ```

- Serve both frontend and the backend
  ```
  npx nx run-many -t serve
  ```
- Open [localhost:4200](http://localhost:4200) in your browser and click around
  <img src="../assets/movie-app.webp" alt="Movies app">
- Check the `apps` and `libs` folder
- Run `npx nx graph` to see how architecture looks like

## How the labs work

Each lab will have the following sections:
- 📚&nbsp;&nbsp;**Learning outcomes**
  - A summary of the most important things you'll learn in that lab
- 🏋️‍♀️&nbsp;&nbsp;**Steps**
  - All the lab steps you need to follow

The lab might also have this helpful sections:

- 🐳&nbsp;&nbsp;**Hints and solutions feat. Ron the whale**
  - While the _mighty narwhal_ is away on secret missions, you will occasionally see his assistant, **Ron The Whale** offering helpful hints to the different exercises. Please use these if you get stuck.
- ⚠️&nbsp;&nbsp;**Important information**
  - Sometimes there are hidden gotchas or common mistakes. Read this before running the step
- ❓&nbsp;&nbsp;**Additional learnings**
  - Sometimes there might be additional learnings included that are not strictly related to Nx itself

## Rules

Follow these simple rules for the best results:
- 💬&nbsp;&nbsp;Questions are always welcome
  - But be mindful of others
  - If the question is unrelated to the topic, use the breaks to ask it
- 🤝&nbsp;&nbsp;Help others when they get stuck and feel free to ask for help
- 🛑&nbsp;&nbsp;It's ok to get stuck. No panic. We will solve it together.
- 💙&nbsp;&nbsp;Respect others as you would like to be respected yourself
  - We are committed to providing a harassment-free experience for everyone, regardless of gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, or religion. We do not tolerate harassment of participants, trainers or staff in any form.
  - For more details read our [Code of Conduct](code-of-conduct.md)

## Happy learning!

## [➡️ Next lab ➡️](./custom-plugins.md)
