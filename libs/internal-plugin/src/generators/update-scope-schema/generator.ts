import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { UpdateScopeSchemaGeneratorSchema } from './schema';

export async function updateScopeSchemaGenerator(
  tree: Tree,
  options: UpdateScopeSchemaGeneratorSchema
) {
  const allProjects = getProjects(tree);
  const allScopes = getScopes(allProjects);

  updateJson(
    tree,
    'libs/internal-plugin/src/generators/util-lib/schema.json',
    (json) => {
      json.properties.directory['x-prompt'].items = allScopes.map((scope) => ({
        value: scope,
        label: scope,
      }));

      json.properties.directory.enum = allScopes;

      console.log(json.properties.directory['x-prompt'].items, json.properties.directory.enum);
      return json;
    }
  );

  await formatFiles(tree);
}

function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const allScopes: string[] = Array.from(projectMap.values())
    .map((project) => {
      if (project.tags) {
        const scopes = project.tags.filter((tag: string) =>
          tag.startsWith('scope:')
        );
        return scopes;
      }
      return [];
    })
    .reduce((acc, tags) => [...acc, ...tags], [])
    .map((scope: string) => scope.slice(6));

  // remove duplicates
  return Array.from(new Set(allScopes));
}

export default updateScopeSchemaGenerator;
