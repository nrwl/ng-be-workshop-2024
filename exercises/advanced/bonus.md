# `📖 Exercise:` Nx Import, Powerpack, CodeOwners, Conformance

## 📚&nbsp;&nbsp;**Learning outcomes**

- Learn about the Nx import command
- Install Nx Powerpack & setup CodeOwners and Conformance rules

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Use Nx import to import an existing Angular project

As a first step, create a new Angular project in some folder outside of the current workspace. Note use Angular 18 for now as Nx support is for v19 is about to drop but might not be out yet by the time of this workshop.

```bash
npx @angular/cli@18 new my-app
```

Then run the following command to import it into the current workspace:

```bash
npx nx import <path-to-ng-project>
```

Confirm the installation of the `@nx/angular` and `@nx/jest` plugin.
Once installed, try to serve the app. Nx is directly running the script of the `package.json` from the imported Angular app.

You can even completely remove all `package.json > scripts` from the imported Angular project as the `@nx/angular` Crystal plugin will automatically detect the `angular.json` and know how to run the various targets.

### 2. Activate Powerpack

Make sure you get a license and then activate it (check the [docs for the details](https://nx.dev/nx-enterprise/activate-powerpack)).

```bash
npx nx activate-powerpack YOUR_LICENSE_KEY
```

### 3. Setup CodeOwners

Let's setup the CodeOwners Powerpack plugin. You can refer to the [docs](https://nx.dev/nx-enterprise/powerpack/owners) for all the details.

```bash
npx nx add @nx/powerpack-owners
```

Check your `nx.json` as you should have a new `sync` command registered. The [Nx sync](https://nx.dev/reference/nx-commands#sync) command synchronizes Nx config files back into code changes. In the case of the CodeOwners plugin it synchs a code owners configuration to a GitHub specific CODEOWNERS file.

Let's set it up. Your `nx.json` should also already have a `owners` section created:

```json
{
  ...
  "owners": {
    "format": "github",
    "patterns": []
  }
}
```

Use the [codeownwers docs](https://nx.dev/nx-enterprise/powerpack/owners) to learn about the syntax and setup different owners for the projects based on the tags we associated earlier.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

Here's one possible solution:

```json
{
  ...
  "owners": {
    "format": "github",
    "patterns": [
      {
        "description": "Frontend team owns all UI and feature components",
        "projects": ["tag:type:ui", "tag:type:feature"],
        "owners": ["@frontend-team"]
      },
      {
        "description": "Backend team owns all API and data-access components",
        "projects": ["tag:type:api", "tag:type:data-access"],
        "owners": ["@backend-team"]
      },
      {
        "description": "Platform team owns all utility libraries and shared scope",
        "projects": ["tag:type:util", "tag:scope:shared"],
        "owners": ["@platform-team"]
      },
      {
        "description": "Movies domain team owns all movies scope projects",
        "projects": ["tag:scope:movies"],
        "owners": ["@movies-team"]
      },
      {
        "description": "Tech leads review all application-level changes",
        "projects": ["tag:type:app"],
        "owners": ["@tech-leads"]
      }
    ]
  }
}
```

</details>

Run `nx sync` which should generate a `CODEOWNERS` file in `.github/CODEOWNERS`.

### 4. Setup Conformance rules

Install the Conformance Powerpack plugin.

```bash
npx nx add @nx/powerpack-conformance
```

Check the [docs](https://nx.dev/nx-enterprise/powerpack/conformance) to learn how to setup conformance rules that verify whether each of our projects has a codeowner defined.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

In `nx.json` add a new `conformance` section:

```json
{
  "conformance": {
    "rules": [
      {
        "rule": "@nx/powerpack-conformance/ensure-owners"
      }
    ]
  }
}
```

</details>

## 🎉&nbsp;&nbsp;Congratulations!

That's it! Keep in touch!

- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Free video courses](https://nx.dev/courses)
- [Our Discord community](https://go.nx.dev/community)
