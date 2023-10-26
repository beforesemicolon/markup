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
    failed = (msg: string) => html`<p style="color: red">${msg}</p>`
) => {
    asyncAction()
        .then((content) => {
            if (content instanceof HtmlTemplate) {
                content.replace(loading)
            } else {
                failed(
                    'async action did not return a "html`...`" instance'
                ).replace(loading)
            }
        })
        .catch((err) => {
            failed(err.message).replace(loading)
        })

    return loading
}
