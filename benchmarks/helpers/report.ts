import { Bench } from 'tinybench'

export function printReport(title: string, bench: Bench, env: any) {
    console.log(`\n==================================================`)
    console.log(`BENCHMARK RESULT: ${title}`)
    console.log(`==================================================`)
    console.log(`OS:     ${env.os}`)
    console.log(`CPU:    ${env.cpu}`)
    console.log(`Node:   ${env.node}`)
    console.log(`Commit: ${env.commit}`)
    console.log(`--------------------------------------------------`)

    const table = bench.tasks.map((task) => {
        if (task.error) {
            return {
                Task: task.name,
                'Ops/sec': 'ERROR',
                'Mean (ms)': task.error.message,
                'MoE (%)': 'N/A',
            }
        }
        const result = task.result
        if (!result || typeof result.period === 'undefined') {
            return {
                Task: task.name,
                'Ops/sec': 'N/A',
                'Mean (ms)': 'N/A',
                'MoE (%)': 'N/A',
            }
        }

        return {
            Task: task.name,
            'Ops/sec': Math.round(result.hz).toLocaleString(),
            'Mean (ms)': result.period.toFixed(4),
            'MoE (%)': `±${result.rme.toFixed(2)}%`,
        }
    })

    console.table(table)
    console.log(`==================================================\n`)
}
