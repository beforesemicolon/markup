import { html, HtmlTemplate } from '../html'

/**
 * will temporarily render the loading template while the
 * async action resolve or fails
 * @param asyncAction
 * @param loading
 * @param failed
 */
export const suspense = (
    asyncAction: () => Promise<unknown>,
    loading = html`<p>loading...</p>`,
    failed = (err: Error) => html`<p style="color: red">${err.message}</p>`
) => {
    return () => {
        asyncAction()
            .then((content) => {
                if (content instanceof HtmlTemplate) {
                    content.replace(loading)
                } else {
                    html`${content}`.replace(loading)
                }
            })
            .catch((err) => {
                failed(err).replace(loading)
            })

        return loading
    }
}
