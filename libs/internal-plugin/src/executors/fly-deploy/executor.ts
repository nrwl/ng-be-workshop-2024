import { PromiseExecutor } from '@nx/devkit';
import { FlyDeployExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<FlyDeployExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for FlyDeploy', options);
  return {
    success: true,
  };
};

export default runExecutor;
