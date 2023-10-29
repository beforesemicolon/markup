import 'global-jsdom/register'
import { HtmlTemplate } from './html'

export const toStatic = (temp: HtmlTemplate) => {
    document.body.innerHTML = ''
    temp.render(document.body)

    return document.body.innerHTML.trim()
}
