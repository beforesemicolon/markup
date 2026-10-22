let cleanupScopeActive = false
let pendingCleanupErrors: unknown[] | undefined

export const throwCleanupErrors = (errors: unknown[]): void => {
    if (errors.length === 1) throw errors[0]
    if (errors.length > 1) {
        throw new AggregateError(errors, 'Multiple template operations failed.')
    }
}

/** Report reconciliation cleanup failures after the surrounding update finishes. */
export const reportCleanupErrors = (errors: unknown[]): void => {
    if (!errors.length) return
    if (cleanupScopeActive) (pendingCleanupErrors ??= []).push(...errors)
    else throwCleanupErrors(errors)
}

/** Keep nested row updates in the same synchronous reconciliation error scope. */
export const withCleanupScope = <T>(operation: () => T): T => {
    if (cleanupScopeActive) return operation()

    cleanupScopeActive = true
    let result: T | undefined
    let errors: unknown[] | undefined
    try {
        result = operation()
    } catch (error) {
        // Non-cleanup errors still interrupt the operation and keep their
        // identity when no earlier cleanup also failed.
        ;(pendingCleanupErrors ??= []).push(error)
    } finally {
        errors = pendingCleanupErrors
        pendingCleanupErrors = undefined
        cleanupScopeActive = false
    }
    if (errors) throwCleanupErrors(errors)
    return result as T
}
