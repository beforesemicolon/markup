import { Bench } from 'tinybench'
import type { getEnvironmentInfo } from './environment.ts'

export function printReport(
    title: string,
    bench: Bench,
    env: ReturnType<typeof getEnvironmentInfo>
) {
    console.log(`\n==================================================`)
    console.log(`BENCHMARK RESULT: ${title}`)
    console.log(`==================================================`)
    console.log(`OS:     ${env.os}`)
    console.log(`CPU:    ${env.cpu}`)
    console.log(`Node:   ${env.node}`)
    console.log(`Commit: ${env.commit}`)
    console.log(`--------------------------------------------------`)

    const table = bench.tasks.map((task) => {
        const result = task.result
        if (result?.error) {
            return {
                Task: task.name,
                'Ops/sec': 'ERROR',
                'Mean (ms)': result.error.message,
                'MoE (%)': 'N/A',
            }
        }
        if (!result) {
            return {
                Task: task.name,
                'Ops/sec': 'N/A',
                'Mean (ms)': 'N/A',
                'MoE (%)': 'N/A',
            }
        }

        return {
            Task: task.name,
            'Ops/sec': Math.round(result.throughput.mean).toLocaleString(),
            'Mean (ms)': result.latency.mean.toFixed(4),
            'MoE (%)': `±${result.latency.rme.toFixed(2)}%`,
        }
    })

    console.table(table)
    console.log(`==================================================\n`)
}
