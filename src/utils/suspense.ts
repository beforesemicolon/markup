import { html, HtmlTemplate } from '../html'

/**
 * will temporarily render the loading template while the
 * async action resolve or fails
 * @param asyncAction
 * @param loading
 * @param failed
 */
export const suspense = (
    asyncAction: () => Promise<HtmlTemplate>,
    loading = html`<p>loading...</p>`,
    failed = (err: Error) => html`<p style="color: red">${err.message}</p>`
) => {
    asyncAction()
        .then((content) => {
            if (content instanceof HtmlTemplate) {
                content.replace(loading)
            } else {
                failed(
                    new Error(
                        'async action did not return a HTMLTemplate instance'
                    )
                ).replace(loading)
            }
        })
        .catch((err) => {
            failed(err).replace(loading)
        })

    return loading
}
