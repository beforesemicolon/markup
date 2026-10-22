import { createRepeatCacheSuite } from './helpers/repeat-cache-suite.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'
import { printReport } from './helpers/report.ts'

const env = getEnvironmentInfo()
const SIZES = [20, 60, 250, 1000]

async function run() {
    for (const size of SIZES) {
        const suite = createRepeatCacheSuite(size)
        try {
            await suite.bench.run()
            printReport(
                `Repeat Cache Bookkeeping - Size ${size}`,
                suite.bench,
                env
            )
        } finally {
            suite.dispose()
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
