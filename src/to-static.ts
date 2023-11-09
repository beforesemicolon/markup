import 'global-jsdom/register'
import { HtmlTemplate } from './html'
import { doc } from './doc'

export const toStatic = (temp: HtmlTemplate) => {
    doc.body.innerHTML = ''
    temp.render(doc.body)

    return doc.body.innerHTML.trim()
}
