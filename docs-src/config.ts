import HomePage from './index.page'
import NotFoundPage from './404.page'
import DocumentationPage from './documentation/index.page'
import InstallationPage from './documentation/installation.page'
// import EssentialTrainingPage from './documentation/essential-training.page'
// import TutorialPage from './documentation/tutorial.page'
// import ExamplesPage from './documentation/examples.page'
import CreatingAndRenderingPage from './documentation/creating-and-rendering.page'
import GetStartedPage from './documentation/get-started.page'
import TemplatingValuesPage from './documentation/template-values.page'
import ReplacingContentPage from './documentation/replacing-content.page'
import DOMReferencesPage from './documentation/dom-references.page'
import ConditionalAttributesPage from './documentation/conditional-attributes.page'
import EventHandlingPage from './documentation/event-handling.page'
import DynamicValuesAndUpdatePage from './documentation/dynamic-values-and-update.page'
import StatValuesPage from './documentation/state-values.page'
import WhatIsAHelperPage from './documentation/what-is-a-helper.page'
import EffectHelperPage from './documentation/effect-helper.page'
import ConditionalRenderingPage from './documentation/conditional-rendering.page'
import RepetitionAndListsPage from './documentation/repetition-and-lists.page'
import IsIsNotHelpersPage from './documentation/is-isnot-helpers.page'
import OrAndOneOfHelpersPage from './documentation/or-and-oneof-helpers.page'
import PickHelperPage from './documentation/pick-helper.page'
import CustomHelperPage from './documentation/custom-helper.page'
import ElementUtilPage from './documentation/element-util.page'
import SuspenseUtilPage from './documentation/suspense-util.page'
import FunctionComponentsPage from './documentation/function-components.page'
import WebComponentsPage from './documentation/web-components.page'
import ServerSideRenderingPage from './documentation/server-side-rendering.page'
import StateStorePage from './documentation/state-store.page'
import { DocumentsGroup, Page } from './type'

const config: { name: string; pages: Page[] } = {
    name: 'Markup',
    pages: [
        {
            path: '/',
            name: 'Markup',
            title: 'Markup',
            description: 'HTML Templating System by Before Semicolon',
            component: HomePage,
            group: '',
            root: true,
        },
        {
            path: '/404',
            name: '404',
            title: '404: Page Not Found',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: NotFoundPage,
            group: '',
            root: false,
        },
        {
            path: '/documentation/',
            name: 'What is Markup?',
            title: 'Documentation: What is Markup?',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: DocumentationPage,
            group: 'Introduction',
            root: true,
        },
        {
            path: '/documentation/get-started',
            name: 'Get Started',
            title: 'Documentation: Get Started',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: GetStartedPage,
            group: 'Introduction',
            root: false,
        },
        {
            path: '/documentation/installation',
            name: 'Installation',
            title: 'Documentation: Installation',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: InstallationPage,
            group: 'Introduction',
            root: false,
        },
        // {
        //     path: '/documentation/essential-training',
        //     name: 'Essential Training',
        //     title: 'Markup Essential Training',
        //     description: 'Markup: HTML Templating System by Before Semicolon',
        //     component: EssentialTrainingPage,
        //     group: 'Introduction',
        //     root: false,
        // },
        // {
        //     path: '/documentation/tutorials',
        //     name: 'Tutorials',
        //     title: 'Markup Tutorials',
        //     description: 'Markup: HTML Templating System by Before Semicolon',
        //     component: TutorialPage,
        //     group: 'Introduction',
        //     root: false,
        // },
        // {
        //     path: '/documentation/examples',
        //     name: 'Examples',
        //     title: 'Markup Code Examples',
        //     description: 'Markup: HTML Templating System by Before Semicolon',
        //     component: ExamplesPage,
        //     group: 'Introduction',
        //     root: false,
        // },
        {
            path: '/documentation/creating-and-rendering',
            name: 'Creating & Rendering',
            title: 'Documentation: Creating & Rendering',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: CreatingAndRenderingPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/templating-values',
            name: 'Templating Values',
            title: 'Documentation: Templating Values',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: TemplatingValuesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/replacing-content',
            name: 'Replacing Content',
            title: 'Documentation: Replacing Content',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: ReplacingContentPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/dom-references',
            name: 'DOM References',
            title: 'Documentation: DOM References',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: DOMReferencesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/conditional-attributes',
            name: 'Conditional Attributes',
            title: 'Documentation: Conditional Attributes',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: ConditionalAttributesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/event-handling',
            name: 'Event Handling',
            title: 'Documentation: Event Handling',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: EventHandlingPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/dynamic-values-and-update',
            name: 'Dynamic Values & Update',
            title: 'Documentation: Dynamic Values & Update',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: DynamicValuesAndUpdatePage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/state-values',
            name: 'State Values',
            title: 'Documentation: State Values',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: StatValuesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/what-is-a-helper',
            name: 'What is a Helper?',
            title: 'Documentation: What is a Helper?',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: WhatIsAHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/effect-helper',
            name: 'Effect Helper',
            title: 'Documentation: Effect Helper',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: EffectHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/conditional-rendering',
            name: 'Conditional Rendering',
            title: 'Documentation: Conditional Rendering',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: ConditionalRenderingPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/repetition-and-lists',
            name: 'Repetition & Lists',
            title: 'Documentation: Repetition & Lists',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: RepetitionAndListsPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/is-isnot-helpers',
            name: 'Is & IsNot Helpers',
            title: 'Documentation: Is & IsNot Helpers',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: IsIsNotHelpersPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/or-and-oneof-helpers',
            name: 'Or, And, & OneOf Helpers',
            title: 'Documentation: Or, And, & OneOf Helpers',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: OrAndOneOfHelpersPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/pick-helper',
            name: 'Pick Helper',
            title: 'Documentation: Pick Helper',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: PickHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/custom-helper',
            name: 'Custom Helper',
            title: 'Documentation: Custom Helper',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: CustomHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/element-util',
            name: 'Element',
            title: 'Documentation: Element',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: ElementUtilPage,
            group: 'Utilities',
            root: false,
        },
        {
            path: '/documentation/suspense-util',
            name: 'Suspense',
            title: 'Documentation: Suspense',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: SuspenseUtilPage,
            group: 'Utilities',
            root: false,
        },
        {
            path: '/documentation/function-components',
            name: 'Function Components',
            title: 'Documentation: Function Components',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: FunctionComponentsPage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/web-components',
            name: 'Web Components',
            title: 'Documentation: Web Components',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: WebComponentsPage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/state-store',
            name: 'State Store',
            title: 'Documentation: State Store',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: StateStorePage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/server-side-rendering',
            name: 'Server Side Rendering',
            title: 'Documentation: Server Side Rendering',
            description: 'Markup: HTML Templating System by Before Semicolon',
            component: ServerSideRenderingPage,
            group: 'Capabilities',
            root: false,
        },
    ],
}

export const DocMenu: DocumentsGroup[] = Object.values(
    config.pages.reduce(
        (acc, page) => {
            if (page.group && page.path.startsWith('/documentation')) {
                if (!acc[page.group]) {
                    acc[page.group] = {
                        name: page.group,
                        list: [],
                    }
                }

                acc[page.group].list.push(page)
            }

            return acc
        },
        {} as Record<string, DocumentsGroup>
    )
)

export default config
