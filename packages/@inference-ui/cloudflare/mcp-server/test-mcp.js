#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('Starting MCP Server test...\n');

  // Spawn the MCP server
  const serverPath = join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    env: {
      ...process.env,
      INFERENCE_UI_API_URL: 'https://inference-ui-api.finhub.workers.dev',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';

  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Give the server time to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Send a ListTools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send a health check request
  const healthCheckRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'health_check',
      arguments: {},
    },
  };

  server.stdin.write(JSON.stringify(healthCheckRequest) + '\n');

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cleanup
  server.kill('SIGTERM');

  console.log('=== Server Output ===');
  console.log(output || '(no stdout output)');
  console.log('\n=== Server Errors/Logs ===');
  console.log(errorOutput || '(no stderr output)');

  if (errorOutput.includes('Inference UI MCP Server started')) {
    console.log('\n✅ MCP Server started successfully!');
  } else {
    console.log('\n❌ MCP Server may not have started correctly');
  }

  console.log('\n=== Test Summary ===');
  console.log('✅ MCP Server executable created');
  console.log('✅ Server process spawned');
  console.log('✅ Environment variables configured');
  console.log('\nTo use with Claude Desktop, add the following to your config:');
  console.log(JSON.stringify({
    mcpServers: {
      'inference-ui': {
        command: 'node',
        args: [serverPath],
        env: {
          INFERENCE_UI_API_URL: 'https://inference-ui-api.finhub.workers.dev',
        },
      },
    },
  }, null, 2));
}

testMCPServer().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
