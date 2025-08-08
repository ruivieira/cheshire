import { SimpleStep, ParallelStep, TemplateStep } from "../steps.ts";
import { PipelineExecutor } from "../executor.ts";
import { type Run } from "../types.ts";

/**
 * Comprehensive example demonstrating parallel steps in a real-world deployment pipeline.
 * 
 * This example shows how to use ParallelStep to create efficient deployment pipelines
 * that install, configure, and verify multiple services simultaneously.
 * 
 * The pipeline demonstrates:
 * - Parallel service installation
 * - Parallel service configuration
 * - Parallel service verification
 * - Sequential final deployment
 * 
 * This approach significantly reduces deployment time compared to sequential execution.
 */

// Individual service installation steps
const installDatabase = new SimpleStep(
  "install-db",
  "Install Database",
  "echo 'Installing PostgreSQL...' && sleep 2 && echo 'Database installed'"
);

const installWebServer = new SimpleStep(
  "install-web",
  "Install Web Server",
  "echo 'Installing Nginx...' && sleep 3 && echo 'Web server installed'"
);

const installCache = new SimpleStep(
  "install-cache",
  "Install Cache",
  "echo 'Installing Redis...' && sleep 1 && echo 'Cache installed'"
);

const installMonitoring = new SimpleStep(
  "install-monitoring",
  "Install Monitoring",
  "echo 'Installing Prometheus...' && sleep 2 && echo 'Monitoring installed'"
);

// Parallel step to install all services simultaneously
const installServices = new ParallelStep(
  "install-services",
  "Install All Services",
  [installDatabase, installWebServer, installCache, installMonitoring],
  {
    description: "Installs database, web server, cache, and monitoring services in parallel",
    timeout: 60000, // 60 second timeout
  }
);

// Configuration steps that run after installation
const configureDatabase = new TemplateStep(
  "configure-db",
  "Configure Database",
  "echo 'Configuring ${dbName} with port ${dbPort}...' && sleep 1",
  { dbName: "postgres", dbPort: 5432 }
);

const configureWebServer = new TemplateStep(
  "configure-web",
  "Configure Web Server",
  "echo 'Configuring ${webServer} on port ${webPort}...' && sleep 1",
  { webServer: "nginx", webPort: 80 }
);

const configureCache = new TemplateStep(
  "configure-cache",
  "Configure Cache",
  "echo 'Configuring ${cacheName} on port ${cachePort}...' && sleep 1",
  { cacheName: "redis", cachePort: 6379 }
);

// Parallel configuration step
const configureServices = new ParallelStep(
  "configure-services",
  "Configure All Services",
  [configureDatabase, configureWebServer, configureCache],
  {
    description: "Configures all services in parallel",
  }
);

// Final verification steps
const verifyDatabase = new SimpleStep(
  "verify-db",
  "Verify Database",
  "echo 'Verifying database connection...' && sleep 1 && echo 'Database OK'"
);

const verifyWebServer = new SimpleStep(
  "verify-web",
  "Verify Web Server",
  "echo 'Verifying web server...' && sleep 1 && echo 'Web server OK'"
);

const verifyCache = new SimpleStep(
  "verify-cache",
  "Verify Cache",
  "echo 'Verifying cache...' && sleep 1 && echo 'Cache OK'"
);

const verifyMonitoring = new SimpleStep(
  "verify-monitoring",
  "Verify Monitoring",
  "echo 'Verifying monitoring...' && sleep 1 && echo 'Monitoring OK'"
);

// Parallel verification step
const verifyServices = new ParallelStep(
  "verify-services",
  "Verify All Services",
  [verifyDatabase, verifyWebServer, verifyCache, verifyMonitoring],
  {
    description: "Verifies all services are running correctly",
  }
);

// Final deployment step
const deployApplication = new SimpleStep(
  "deploy-app",
  "Deploy Application",
  "echo 'Deploying application...' && sleep 2 && echo 'Application deployed successfully!'"
);

// Create the complete pipeline
const deploymentPipeline: Run = {
  id: "deployment-pipeline",
  name: "Service Deployment Pipeline",
  description: "Deploys a complete application stack with parallel service installation",
  platform: "linux",
  steps: [
    installServices,
    configureServices,
    verifyServices,
    deployApplication,
  ],
};

/**
 * Main function that executes the deployment pipeline.
 * 
 * This function demonstrates how to run a complex pipeline with multiple
 * parallel execution phases and provides detailed output about the results.
 */
async function main() {
  console.log("🚀 Starting Service Deployment Pipeline\n");
  
  const executor = new PipelineExecutor(true); // Enable verbose output for detailed logging
  const result = await executor.executeRun(deploymentPipeline);
  
  console.log("\n" + "=".repeat(50));
  if (result.success) {
    console.log("✅ Deployment Pipeline Completed Successfully!");
    console.log(`⏱️  Total Duration: ${result.totalDuration}ms`);
  } else {
    console.log("❌ Deployment Pipeline Failed!");
    if (result.error) {
      console.log(`💥 Error: ${result.error}`);
    }
  }
  
  // Show step results summary
  console.log("\n📊 Step Results Summary:");
  result.stepResults.forEach((stepResult) => {
    const status = stepResult.success ? "✅" : "❌";
    console.log(`${status} ${stepResult.stepId}: ${stepResult.duration}ms`);
  });
}

if (import.meta.main) {
  main().catch(console.error);
}
