# `📖 Exercise:` Exploring flaky task detection on Nx Agents

## 📚&nbsp;&nbsp;**Learning outcomes**

- Create a flaky task
- Learn how Nx Agents automatically detect them and

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Create a flaky task

Flaky tasks don't have to be tests necessarily, however that's the most common scenario.

> ℹ️ How does it work? Check the [docs](https://nx.dev/ci/features/flaky-tasks) for more details how Nx Agents detect and automatically retry flaky tasks.

Feel free to use your imagination for creating a flaky test.

Commit the change and push it to trigger a new CI run.

### 2. Cause a couple of CI runs to see the flaky task detection in action

Make a couple of arbitrary changes and push them to trigger to a new CI run.

> Feel free to adjust the CI setup to restrict it to just the flaky targets to speed things up.

If you succeed you should see a note at the top of the dashboard indicating the presence of some flaky tasks.

![flaky tasks](../images/flaky-tasks.png)

Also if you open the the project containing the flaky task you should see how it got retried:

![flaky task retry](../images/flaky-task-retry.png)

## That's it! 🎉

You made it all the way through! Are you up for some [✨ bonus tasks ✨](./bonus.md)?
