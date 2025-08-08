import { PipelineExecutor } from './executor.ts';
import { type Run, type ExecutableFunction } from './types.ts';

export async function runPipelineFromFile(
  filePath: string,
  executableFunction?: ExecutableFunction,
): Promise<void> {
  try {
    const pipelineModule = await import(filePath);
    const pipeline: Run = pipelineModule.default || pipelineModule.pipeline;

    if (!pipeline) {
      throw new Error(
        'No pipeline found in file. Export a default pipeline or named "pipeline"',
      );
    }

    const executor = new PipelineExecutor(false, executableFunction);
    const result = await executor.executeRun(pipeline);

    console.log(`\n📊 Pipeline Results for: ${pipeline.name}`);
    console.log(`Overall Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Duration: ${result.totalDuration}ms`);

    if (!result.success && result.error) {
      console.log(`Error: ${result.error}`);
    }

    console.log('\n📋 Step Results:');
    result.stepResults.forEach((stepResult, index) => {
      const step = pipeline.steps[index];
      console.log(
        `${
          stepResult.success ? '✅' : '❌'
        } ${step.name}: ${stepResult.duration}ms`,
      );
      if (!stepResult.success && stepResult.error) {
        console.log(`  Error: ${stepResult.error}`);
      }
    });

    if (result.testResults.length > 0) {
      console.log('\n🧪 Test Results:');
      result.testResults.forEach((testResult, index) => {
        const test = pipeline.tests![index];
        console.log(
          `${
            testResult.success ? '✅' : '❌'
          } ${test.name}: ${testResult.duration}ms`,
        );
        if (!testResult.success && testResult.error) {
          console.log(`  Error: ${testResult.error}`);
        }
      });
    }

    Deno.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Failed to run pipeline:', error);
    Deno.exit(1);
  }
}

export async function runPipelineDirectly(
  pipeline: Run,
  executableFunction?: ExecutableFunction,
): Promise<void> {
  try {
    const executor = new PipelineExecutor(false, executableFunction);
    const result = await executor.executeRun(pipeline);

    console.log(`\n📊 Pipeline Results for: ${pipeline.name}`);
    console.log(`Overall Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Duration: ${result.totalDuration}ms`);

    if (!result.success && result.error) {
      console.log(`Error: ${result.error}`);
    }

    console.log('\n📋 Step Results:');
    result.stepResults.forEach((stepResult, index) => {
      const step = pipeline.steps[index];
      console.log(
        `${
          stepResult.success ? '✅' : '❌'
        } ${step.name}: ${stepResult.duration}ms`,
      );
      if (!stepResult.success && stepResult.error) {
        console.log(`  Error: ${stepResult.error}`);
      }
    });

    if (result.testResults.length > 0) {
      console.log('\n🧪 Test Results:');
      result.testResults.forEach((testResult, index) => {
        const test = pipeline.tests![index];
        console.log(
          `${
            testResult.success ? '✅' : '❌'
          } ${test.name}: ${testResult.duration}ms`,
        );
        if (!testResult.success && testResult.error) {
          console.log(`  Error: ${testResult.error}`);
        }
      });
    }

    Deno.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Failed to run pipeline:', error);
    Deno.exit(1);
  }
}
