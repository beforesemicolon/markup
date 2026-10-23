import 'global-jsdom/register'
import { createRepeatDomSuite } from './helpers/repeat-dom-suite.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'
import { printReport } from './helpers/report.ts'

const env = getEnvironmentInfo()
const SIZES = [20, 60, 250, 1000]

async function run() {
    for (const size of SIZES) {
        const suite = createRepeatDomSuite(size)
        try {
            await suite.bench.run()
            printReport(`DOM Mount and Update - Size ${size}`, suite.bench, env)
        } finally {
            suite.dispose()
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
