import { execSync } from 'child_process'
import os from 'os'

export function getEnvironmentInfo() {
    let commit = 'unknown'
    try {
        commit = execSync('git rev-parse --short HEAD', {
            encoding: 'utf8',
        }).trim()
    } catch {}

    return {
        node: process.version,
        os: `${os.type()} ${os.release()} (${os.arch()})`,
        cpu: os.cpus()[0]?.model || 'unknown',
        commit,
    }
}
