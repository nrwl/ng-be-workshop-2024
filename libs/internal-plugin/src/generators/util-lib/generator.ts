import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { UtilLibGeneratorSchema } from './schema';
import { libraryGeneratorInternal } from '@nx/js/src/generators/library/library';

export async function utilLibGenerator(
  tree: Tree,
  options: UtilLibGeneratorSchema
) {
  console.log('Passed {dir}/{name}', options.directory, '/', options.name);
  await libraryGeneratorInternal(tree, {
    name: `${options.directory}-util-${options.name}`,
    directory: `libs/${options.directory}/util-${options.name}`,
    tags: `type:util,scope:${options.directory}`, 
  });
  // const projectRoot = `libs/${options.name}`;
  // addProjectConfiguration(tree, options.name, {
  //   root: projectRoot,
  //   projectType: 'library',
  //   sourceRoot: `${projectRoot}/src`,
  //   targets: {},
  // });
  // generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default utilLibGenerator;
