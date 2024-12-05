import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { UpdateScopeSchemaGeneratorSchema } from './schema';

export async function updateScopeSchemaGenerator(
  tree: Tree,
  options: UpdateScopeSchemaGeneratorSchema
) {
  const projectRoot = `libs/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  updateJson(tree, 'nx.json', (json) => ({
    ...json,
    defaultProject: 'movies-app',
  }));
  await formatFiles(tree);
}

export default updateScopeSchemaGenerator;
