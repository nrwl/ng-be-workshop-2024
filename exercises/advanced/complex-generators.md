# `📖 Exercise:` Complex generators

## 📚&nbsp;&nbsp;**Learning outcomes**

- Explore some more advanced, real-world usages of generators
- Understand how to modify existing source code with generators

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. New generator

Generate another generator called `update-scope-schema`. Use it to set the `defaultProject` to `movies-app` in our `nx.json` file.

<details>
  <summary>🐳&nbsp;&nbsp;Hint</summary>

- Use the [updateJson](https://nx.dev/nx-api/devkit/documents/updateJson) utility
- update the generator schema such that no `name` property is required
- Try it first before you head over to the solution
</details>
<br/>
<details>
  <summary>🐳&nbsp;&nbsp;Solution</summary>

```typescript
import { formatFiles, Tree, updateJson } from '@nx/devkit';

export default async function (tree: Tree) {
  updateJson(tree, 'nx.json', (json) => ({
    ...json,
    defaultProject: 'movies-app',
  }));
  await formatFiles(tree);
}
```

</details>

### 2. Add scope crawling

Now that we had some practice with the `updateJson` util - Let's build something even more useful:

- When large teams work in the same workspace, they will occasionally be adding new projects and hence, **new scope tags**
- We want to make sure that scope tags specified in our `util-lib` generator are up to date and take into account all these new scopes that teams have been adding
- We want to check if there is a new scope tag in any of our `project.json` files and update our generator schema
- We can use the [`getProjects`](https://nx.dev/nx-api/devkit/documents/getProjects) util to read all the projects at once.
- `✨ BONUS:` Modify your generator so it fetches list of scopes from all the `project.json` files and updates the schema in `util-lib` with any new ones

<details>
<summary>🐳&nbsp;&nbsp;Hint: Function to extract all scopes</summary>

```typescript
function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const allScopes: string[] = Array.from(projectMap.values())
    .map((project) => {
      if (project.tags) {
        const scopes = project.tags?.filter((tag: string) => tag.startsWith('scope:')) ?? [];
        return scopes;
      }
      return [];
    })
    .reduce((acc, tags) => [...acc, ...tags], [])
    .map((scope: string) => scope.slice(6));

  // remove duplicates
  return Array.from(new Set(allScopes));
}
```

</details>

Use `updateJson` function from `@nx/devkit` to update the `schema.json` file

<details>
<summary>🐳&nbsp;&nbsp;Hint: Schema replacement</summary>

```typescript
updateJson(
  tree,
  'libs/internal-plugin/src/generators/util-lib/schema.json',
  (schemaJson) => {
    schemaJson.properties.directory['x-prompt'].items = scopes.map(
      (scope) => ({
        value: scope,
        label: scope,
      })
    );
    schemaJson.properties.directory.enums = scopes;
    return schemaJson;
  }
);
```

</details>

⚠️ It's good practice to have your generator run your modified files through Prettier after modifying them. You might already have this, but just in case you removed it bring back the `formatFiles` async function at the end of your generator.

### 3. Updating non-JSON files

Our `index.ts` also has a `Schema` interface that should be updated. Although it's recommended to use ASTs for more complex code replacement cases, in this case we will use simple `tree.read(path)` and `tree.write(path, content)` methods.

<details>
<summary>🐳&nbsp;&nbsp;Hint: Replacing scopes</summary>

```typescript
function replaceScopes(content: string, scopes: string[]): string {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const PATTERN = /interface UtilLibGeneratorSchema \{\n.*\n.*\n\}/gm;
  return content.replace(
    PATTERN,
    `interface UtilLibGeneratorSchema {
  name: string;
  directory: ${joinScopes};
}`
  );
}
```

</details>
<br/>
<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```ts
import {
  Tree,
  updateJson,
  formatFiles,
  ProjectConfiguration,
  getProjects,
} from '@nx/devkit';

export async function generator(tree: Tree) {
  const scopes = getScopes(getProjects(tree));
  updateSchemaJson(tree, scopes);
  updateSchemaInterface(tree, scopes);
  await formatFiles(tree);
}

function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const projects: any[] = Array.from(projectMap.values());
  const allScopes: string[] = projects
    .map((project) =>
      project.tags?.filter((tag: string) => tag.startsWith('scope:')) ?? []
    )
    .reduce((acc, tags) => [...acc, ...tags], [])
    .map((scope: string) => scope.slice(6));
  return Array.from(new Set(allScopes));
}

function updateSchemaJson(tree: Tree, scopes: string[]) {
  updateJson(
    tree,
    'libs/internal-plugin/src/generators/util-lib/schema.json',
    (schemaJson) => {
      schemaJson.properties.directory['x-prompt'].items = scopes.map(
        (scope) => ({
          value: scope,
          label: scope,
        })
      );
      schemaJson.properties.directory.enums = scopes;
      return schemaJson;
    }
  );
}

function updateSchemaInterface(tree: Tree, scopes: string[]) {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const interfaceDefinitionFilePath =
    'libs/internal-plugin/src/generators/util-lib/schema.d.ts';
  const newContent = `export interface UtilLibGeneratorSchema {
  name: string;
  directory: ${joinScopes};
}`;
  tree.write(interfaceDefinitionFilePath, newContent);
}
```
</details>

### 4. Let's test it

Create a new app and define a brand new scope for it. Run your generator and notice the resulting changes. Commit them so you start fresh on your next lab.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

```shell
nx generate app video-games --tags=scope:video-games
```

Our `internal-plugin` doesn't have tags either. Let's add some:

```jsonc
{
  // ...
  "tags": ["type:util", "scope:internal"]
}
```

Run generator again.

</details>

### 5. `✨ BONUS` Automate generator update

Use a tool like [Husky](https://typicode.github.io/husky/#/) to run your
generator automatically before each commit. This will ensure developers never forget to add
their scope files.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```json
{
  "scripts": {
    "postinstall": "husky install",
    "pre-commit": "npx nx g @nx-workshop/internal-plugin:update-scope-schema"
  }
}
```

You may need to install husky with `npm install -D husky`.

</details>

### 6. `✨ BONUS` Create a unit test to verify functionality

Create a test to automate verification of this generator in `libs/internal-plugin/src/generators/update-scope-schema/generator.spec.ts`. This will be particularly difficult, as you'll need to create a project with the actual source code of your `util-lib` generator as part of the setup for this test.

> ⚠️&nbsp;&nbsp;Check the solution if you get stuck!

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```typescript
import { readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/js';
import { generatorGenerator, pluginGenerator } from '@nx/plugin/generators';
import { readFileSync } from 'fs';
import { join } from 'path';

import { Linter } from '@nx/eslint';
import { generator } from './generator';

describe('update-scope-schema generator', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace();
    await addUtilLibProject(appTree);
    await libraryGenerator(appTree, {
      name: 'foo',
      tags: 'scope:foo',
      directory: 'foo',
    });
    await libraryGenerator(appTree, {
      name: 'bar',
      tags: 'scope:bar',
      directory: 'bar',
    });
  });

  it('should adjust the util-lib generator based on existing projects', async () => {
    await generator(appTree);
    const schemaJson = readJson(
      appTree,
      'libs/internal-plugin/src/generators/util-lib/schema.json'
    );
    expect(schemaJson.properties.directory['x-prompt'].items).toEqual([
      {
        value: 'foo',
        label: 'foo',
      },
      {
        value: 'bar',
        label: 'bar',
      },
    ]);
    const schemaInterface = appTree.read(
      'libs/internal-plugin/src/generators/util-lib/schema.d.ts',
      'utf-8'
    );
    expect(schemaInterface).toContain(`export interface UtilLibGeneratorSchema {
  name: string;
  directory: 'foo' | 'bar';
}`);
  });
});

async function addUtilLibProject(tree: Tree) {
  await pluginGenerator(tree, {
    name: 'internal-plugin',
    directory: 'libs/internal-plugin',
    skipTsConfig: false,
    unitTestRunner: 'jest',
    linter: Linter.EsLint,
    compiler: 'tsc',
    skipFormat: false,
    skipLintChecks: false,
  });
  await generatorGenerator(tree, {
    name: 'util-lib',
    path: 'libs/internal-plugin/src/generators/util-lib',
    unitTestRunner: 'jest',
  });
  const filesToCopy = [
    '../util-lib/generator.ts',
    '../util-lib/schema.json',
    '../util-lib/schema.d.ts',
  ];
  for (const file of filesToCopy) {
    tree.write(
      `libs/internal-plugin/src/generators/util-lib/${file}`,
      readFileSync(join(__dirname, file))
    );
  }
}

```

</details>

### 7. Conclusion

You learned how to generate and test complex generators. In the next step we will learn how to use `run-commands` executor and build our own custom executor.

⚠️&nbsp;&nbsp;Don't forget to commit everything before you move on.

## [➡️ Next lab ➡️](./setup-ci-and-connect-nx-cloud.md)
