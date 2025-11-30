/**
 * Benchmark script for Fracticons
 * Tests generation performance at different resolutions and sizes
 */

import { generateFracticon, FracticonOptions } from './dist/index.js';

interface BenchmarkResult {
  resolution: number;
  size: number;
  fractalType: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  opsPerSecond: number;
  pngSizeKb: number;
}

function generateTestHashes(count: number): string[] {
  const hashes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate pseudo-random hashes
    let hash = '';
    for (let j = 0; j < 64; j++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    hashes.push(hash);
  }
  return hashes;
}

function benchmark(
  hashes: string[],
  options: FracticonOptions
): BenchmarkResult {
  const iterations = hashes.length;
  let totalPngSize = 0;

  // Warm up
  generateFracticon(hashes[0], options);

  const start = performance.now();
  
  for (const hash of hashes) {
    const dataUrl = generateFracticon(hash, options);
    totalPngSize += dataUrl.length;
  }
  
  const end = performance.now();
  const totalMs = end - start;
  const avgMs = totalMs / iterations;
  
  return {
    resolution: options.resolution ?? 64,
    size: options.size ?? 128,
    fractalType: options.fractalType ?? 'julia',
    iterations,
    totalMs: Math.round(totalMs * 100) / 100,
    avgMs: Math.round(avgMs * 100) / 100,
    opsPerSecond: Math.round((iterations / totalMs) * 1000 * 100) / 100,
    pngSizeKb: Math.round((totalPngSize / iterations / 1024) * 100) / 100
  };
}

function formatTable(results: BenchmarkResult[]): string {
  const header = '| Resolution | Size | Fractal | Avg (ms) | Ops/sec | PNG Size |';
  const divider = '|------------|------|---------|----------|---------|----------|';
  
  const rows = results.map(r => 
    `| ${r.resolution.toString().padEnd(10)} | ${r.size.toString().padEnd(4)} | ${r.fractalType.padEnd(7)} | ${r.avgMs.toFixed(2).padStart(8)} | ${r.opsPerSecond.toFixed(0).padStart(7)} | ${r.pngSizeKb.toFixed(1).padStart(6)} KB |`
  );
  
  return [header, divider, ...rows].join('\n');
}

async function main(): Promise<void> {
  console.log('🌀 Fracticons Benchmark\n');
  console.log('Generating test hashes...');
  
  const iterations = 50;
  const hashes = generateTestHashes(iterations);
  
  console.log(`Running ${iterations} iterations per configuration...\n`);
  
  const results: BenchmarkResult[] = [];
  
  // Test different resolutions
  const resolutions = [16, 32, 64, 128, 256];
  const sizes = [64, 128, 256];
  const fractalTypes = ['julia', 'mandelbrot', 'burning-ship', 'tricorn'] as const;
  
  console.log('Testing resolutions with default fractal (julia)...');
  for (const resolution of resolutions) {
    const result = benchmark(hashes, { resolution, size: 128 });
    results.push(result);
    console.log(`  Resolution ${resolution}: ${result.avgMs.toFixed(2)}ms avg`);
  }
  
  console.log('\nTesting fractal types at resolution 64...');
  for (const fractalType of fractalTypes) {
    const result = benchmark(hashes, { resolution: 64, size: 128, fractalType });
    results.push(result);
    console.log(`  ${fractalType}: ${result.avgMs.toFixed(2)}ms avg`);
  }
  
  console.log('\nTesting output sizes at resolution 64...');
  for (const size of sizes) {
    const result = benchmark(hashes, { resolution: 64, size });
    results.push(result);
    console.log(`  Size ${size}px: ${result.avgMs.toFixed(2)}ms avg, ${result.pngSizeKb.toFixed(1)} KB`);
  }
  
  console.log('\nTesting circular mask overhead...');
  const withoutCircle = benchmark(hashes, { resolution: 64, size: 128, circular: false });
  const withCircle = benchmark(hashes, { resolution: 64, size: 128, circular: true });
  console.log(`  Without circle: ${withoutCircle.avgMs.toFixed(2)}ms`);
  console.log(`  With circle: ${withCircle.avgMs.toFixed(2)}ms (+${(withCircle.avgMs - withoutCircle.avgMs).toFixed(2)}ms)`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary Table:\n');
  console.log(formatTable(results));
  
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Recommendations:');
  
  const res64 = results.find(r => r.resolution === 64 && r.fractalType === 'julia');
  const res32 = results.find(r => r.resolution === 32 && r.fractalType === 'julia');
  
  if (res64 && res64.avgMs < 5) {
    console.log('  ✅ Resolution 64 is fast enough for real-time use');
  } else if (res32 && res32.avgMs < 5) {
    console.log('  ⚠️  Consider using resolution 32 for better performance');
  }
  
  if (res64) {
    console.log(`  📦 Average PNG size at resolution 64: ${res64.pngSizeKb.toFixed(1)} KB`);
  }
}

main().catch(console.error);
