import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { PlaylistContent } from '../partials/playlist-content'
import tutorialTraining from '../data/tutorial.json'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = IntroGroup.list[3]

export default DocPageLayout(
    page.path,
    html`${Heading(page.name)} ${PlaylistContent(tutorialTraining)}
    ${DocPrevNextNav({
        prev: {
            label: IntroGroup.list[2].name,
            link: IntroGroup.list[2].path,
        },
        next: {
            label: IntroGroup.list[4].name,
            link: IntroGroup.list[4].path,
        },
    })}`
)

// const reordableList = helper(
// 	(list, renderItem, renderContainer, withDrop) => {
// 		const placeholder = element('div', {
// 			attributes: {
// 				style: 'background: cyan; height: 3px; border-radius: 1px;'
// 			}
// 		})
// 		let draggingElement = null;
// 		let prevY = 0;
//
// 		const onDragOver = e => {
// 			e.preventDefault();
// 			const draggingOverElement = e.target.closest('[draggable][data-order]');
//
// 			if(draggingOverElement && draggingOverElement !== draggingElement) {
// 				if (e.pageY < prevY) {
// 					draggingOverElement.before(placeholder)
// 				} else if (e.pageY > prevY) {
// 					draggingOverElement.after(placeholder)
// 				}
// 			}
//
// 			prevY = e.pageY;
// 		}
//
// 		const onDragStart = (e) => {
// 			draggingElement = e.currentTarget;
// 		}
//
// 		const onDrop = (e) => {
// 			if(placeholder.isConnected) {
// 				placeholder.parentNode.replaceChild(draggingElement, placeholder)
//
// 				if(container) {
// 					withDrop?.(
// 						Array.from(container.querySelectorAll('[draggable][data-order]'), el => el.dataset.order)
// 					)
// 				}
// 			}
// 		}
//
// 		const container = renderContainer();
//
// 		container.addEventListener('dragover', onDragOver)
// 		container.addEventListener('drop', onDrop)
//
// 		const temp = html`
//       ${repeat(list, (item, idx) => {
// 			const el = renderItem(item);
//
// 			el.setAttribute('draggable', 'true')
// 			el.dataset.order = idx;
// 			el.addEventListener('dragstart', onDragStart)
//
// 			return el;
// 		})}
//     `;
//
// 		temp.render(container);
//
// 		return () => container;
// 	}
// )
