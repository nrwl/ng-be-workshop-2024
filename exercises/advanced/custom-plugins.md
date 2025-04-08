# `📖 Exercise:` Local plugins and custom generators

## 📚&nbsp;&nbsp;**Learning outcomes**

- Understand what an internal plugin is
- Understanding generators in internal plugin, including:
  - How to create them
  - How to invoke them
  - How to use one to simplify usages of other, more powerful generators

## 🏋️‍♀️&nbsp;&nbsp;Steps:

### 1. Add @nx/plugin

Add the `@nx/plugin` plugin with `nx add`.

<details>
  <summary>🐳&nbsp;&nbsp;Hint</summary>

    ```bash
    npx nx add @nx/plugin
    ```

</details>

### 2. Generate Plugin

Generate a new plugin called `internal-plugin` in the `libs` directory. This step initializes the necessary setup for your custom generator.

<details>
  <summary>🐳&nbsp;&nbsp;Hint</summary>

    ```bash
    nx generate @nx/plugin:plugin libs/internal-plugin
    ```

</details>

### 3. Generate a generator

Use the `@nx/plugin:generator` generator to generate a new generator called `util-lib`. Inspect the files that got generated and then commit everything.

<details>
  <summary>🐳&nbsp;&nbsp;Hint: See list of plugins</summary>

Run `npx nx list` to see the list of installed plugins. Then run `npx nx list @nx/plugin` to see what generators are available.

</details>

<details>
  <summary>🐳&nbsp;&nbsp;Solution</summary>
  To generate a generator into our `@nx-workshop\internal-plugin` plugin, we can run:

    ```bash
    npx nx generate @nx/plugin:generator libs/internal-plugin/src/generators/util-lib --name=util-lib
    ```

</details>

⚠️&nbsp;&nbsp;Commit your changes!

### 4. Run your generator

Try to run your generator to see what changes are being made (you can append `--dry-run` to avoid reverting using Git).

⚠️&nbsp;&nbsp;The code we generated creates a very bare-bones new library. You can use Git to undo those changes (hence why it's recommended to commit before running a generator).

### 5. Extend other generators

We can call other generators inside of our custom generator. Add `@nx/js` as a dependency of `internal-plugin`. Then, import the `@nx/js:library` generator and call it inside of the default exported function of `libs/internal-plugin/src/generators/util-lib/generator.ts`

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

```typescript
import { libraryGenerator } from '@nx/js';

export default async function (tree: Tree, options: UtilLibGeneratorSchema) {
  await libraryGenerator(tree, {
    directory: options.name,
  });
  // comment the rest of the code
  await formatFiles(tree);
}
```

</details>

### 6. Console log the properties

In `libs/internal-plugin/src/generators/util-lib/generator.ts` try to make it `console.log()` the value of the `--name` property you passed to it (can use `--dry-run` again to test it)

### 7. Add prefix

The generator should prefix any name you give to your lib with `util-`. For example:

- `nx generate @nx-workshop/internal-plugin:util-lib dates`
- Should generate a lib with the name `util-dates`

⚠️&nbsp;&nbsp;You can keep trying out your changes safely with the `--dry-run` flag.️

### 8. Add directory

Add a new property to its schema called `directory`. It should have only 3 possible values:
`"movies", "api", "shared"`. If you do not pass `--directory` as an option when invoking the
schema it should prompt the user to select from the 3 different values (similar to when you got
asked about which bundler to use when creating libs). The generator should generate the lib in the directory you pass to it:

- `movies`-> `libs/movies/{lib name}`

The generator should also add the directory as a prefix to the lib name.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

[Adding dynamic prompts](https://nx.dev/recipes/generators/generator-options#adding-dynamic-prompts)

</details>
<br />

### 9. Add tags

Because it's a `util` lib, it should automatically be generated with the `type:util` tags. We also need to add `scope` tag to it. We can use the `directory` value for this, since it signifies our scope e.g. `scope:movies`.

<details>
<summary>🐳&nbsp;&nbsp;Hint</summary>

Consult the `@nx/js:lib` [docs](https://nx.dev/packages/js/generators/library)
for possible options you can pass to it.

</details>

⚠️&nbsp;&nbsp;Before testing your changes, remember to commit them, in case you need to revert
locally generated files again.

### 10. Add a bit of logic

Let's add some functionality to the lib you just created:

- Generate a new lib called `util-notifications` in the `api` directory using our new generator
- In `libs/api/util-notifications/src/lib/api-util-notifications.ts`
- Add:
  ```typescript
  export function sendNotification(clientId: string) {
    console.log('sending notification to client: ', clientId);
  }
  ```

Now try to import the above function in `apps/movies-api/src/main.ts`

- Try to lint all the apps
- It should work because everything is in the `api` scope

Try to import it in `apps/movies-app/src/app/app.component.ts`

- It should fail because it's not within the same scope

### 11. `✨ BONUS` fixing tests

A `generator.spec.ts` file was created when we ran our generator. Try writing some meaningful tests for this generator. Use `createTreeWithEmptyWorkspace` from `@nx/devkit/testing` to generate in memory Tree and `readProjectConfiguration` from `@nx/devkit` to parse the contents of your project configuration.

<details>
<summary>🐳&nbsp;&nbsp;Solution</summary>

```typescript
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import generator from './generator';
import { UtilLibGeneratorSchema } from './schema';

describe('util-lib generator', () => {
  let appTree: Tree;
  const options: UtilLibGeneratorSchema = { name: 'foo', directory: 'movies' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should add util to the name and add appropriate tags', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'movies-util-foo');
    expect(config).toBeDefined();
    expect(config.tags).toEqual(['type:util', 'scope:movies']);
  });
});
```

</details>

### 12. Conclusion

You learned how to generate plugis and create your own generators. In the next step we will learn how to build even more complex generators.

⚠️&nbsp;&nbsp;Don't forget to commit everything before you move on.

## [➡️ Next lab ➡️](./complex-generators.md)
