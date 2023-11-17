import 'global-jsdom/register'
import { HtmlTemplate } from './html'
import { doc } from './doc'

export const toStatic = (temp: HtmlTemplate, docType = '<!doctype html>') => {
    doc.body.innerHTML = ''
    temp.render(doc.body)

    return docType + doc.body.innerHTML.trim()
}
