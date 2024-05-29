import HomePage from './index.page'
import NotFoundPage from './404.page'
import DocumentationPage from './documentation/index.page'
import InstallationPage from './documentation/installation.page'
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
import RouterPage from './documentation/router.page'
import ServerSideRenderingPage from './documentation/server-side-rendering.page'
import StateStorePage from './documentation/state-store.page'
import TemplateLifecyclesPage from './documentation/template-lifecycles.page'
import { DocumentsGroup, Page } from './type'

const genericDescription =
    'Markup: Reactive HTML Templating System by Before Semicolon'

const config: { name: string; pages: Page[] } = {
    name: 'Markup',
    pages: [
        {
            path: '/',
            name: 'Markup',
            title: 'Markup',
            description: 'Reactive HTML Templating System by Before Semicolon',
            component: HomePage,
            group: '',
            root: true,
        },
        {
            path: '/404',
            name: '404',
            title: '404: Page Not Found',
            description: genericDescription,
            component: NotFoundPage,
            group: '',
            root: false,
        },
        {
            path: '/documentation/',
            name: 'What is Markup?',
            title: 'What is Markup? - Markup Reactive Templating System',
            description: genericDescription,
            component: DocumentationPage,
            group: 'Introduction',
            root: true,
        },
        {
            path: '/documentation/installation',
            name: 'Installation',
            title: 'Installation - Markup Reactive Templating System',
            description: genericDescription,
            component: InstallationPage,
            group: 'Introduction',
            root: false,
        },
        {
            path: '/documentation/get-started',
            name: 'Get Started',
            title: 'Get Started - Markup Reactive Templating System',
            description: genericDescription,
            component: GetStartedPage,
            group: 'Introduction',
            root: false,
        },
        {
            path: '/documentation/creating-and-rendering',
            name: 'Creating & Rendering',
            title: 'Creating & Rendering - Markup Reactive Templating System',
            description: genericDescription,
            component: CreatingAndRenderingPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/templating-values',
            name: 'Templating Values',
            title: 'Templating Values - Markup Reactive Templating System',
            description: genericDescription,
            component: TemplatingValuesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/replacing-content',
            name: 'Replacing Content',
            title: 'Replacing Content - Markup Reactive Templating System',
            description: genericDescription,
            component: ReplacingContentPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/dom-references',
            name: 'DOM References',
            title: 'DOM References - Markup Reactive Templating System',
            description: genericDescription,
            component: DOMReferencesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/conditional-attributes',
            name: 'Conditional Attributes',
            title: 'Conditional Attributes - Markup Reactive Templating System',
            description: genericDescription,
            component: ConditionalAttributesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/event-handling',
            name: 'Event Handling',
            title: 'Event Handling - Markup Reactive Templating System',
            description: genericDescription,
            component: EventHandlingPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/dynamic-values-and-update',
            name: 'Dynamic Values & Update',
            title: 'Dynamic Values & Update - Markup Reactive Templating System',
            description: genericDescription,
            component: DynamicValuesAndUpdatePage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/state-values',
            name: 'State Values',
            title: 'State Values - Markup Reactive Templating System',
            description: genericDescription,
            component: StatValuesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/template-lifecycles',
            name: 'Template Lifecycles',
            title: 'Template Lifecycles - Markup Reactive Templating System',
            description: genericDescription,
            component: TemplateLifecyclesPage,
            group: 'Templating',
            root: false,
        },
        {
            path: '/documentation/what-is-a-helper',
            name: 'What is a Helper?',
            title: 'What is a Helper? - Markup Reactive Templating System',
            description: genericDescription,
            component: WhatIsAHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/effect-helper',
            name: 'Effect Helper',
            title: 'Effect Helper - Markup Reactive Templating System',
            description: genericDescription,
            component: EffectHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/conditional-rendering',
            name: 'Conditional Rendering',
            title: 'Conditional Rendering - Markup Reactive Templating System',
            description: genericDescription,
            component: ConditionalRenderingPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/repetition-and-lists',
            name: 'Repetition & Lists',
            title: 'Repetition & Lists - Markup Reactive Templating System',
            description: genericDescription,
            component: RepetitionAndListsPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/is-isnot-helpers',
            name: 'Is & IsNot Helpers',
            title: 'Is & IsNot Helpers - Markup Reactive Templating System',
            description: genericDescription,
            component: IsIsNotHelpersPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/or-and-oneof-helpers',
            name: 'Or, And, & OneOf Helpers',
            title: 'Or, And, & OneOf Helpers - Markup Reactive Templating System',
            description: genericDescription,
            component: OrAndOneOfHelpersPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/pick-helper',
            name: 'Pick Helper',
            title: 'Pick Helper - Markup Reactive Templating System',
            description: genericDescription,
            component: PickHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/custom-helper',
            name: 'Custom Helper',
            title: 'Custom Helper - Markup Reactive Templating System',
            description: genericDescription,
            component: CustomHelperPage,
            group: 'Helpers',
            root: false,
        },
        {
            path: '/documentation/element-util',
            name: 'Element',
            title: 'Element - Markup Reactive Templating System',
            description: genericDescription,
            component: ElementUtilPage,
            group: 'Utilities',
            root: false,
        },
        {
            path: '/documentation/suspense-util',
            name: 'Suspense',
            title: 'Suspense - Markup Reactive Templating System',
            description: genericDescription,
            component: SuspenseUtilPage,
            group: 'Utilities',
            root: false,
        },
        {
            path: '/documentation/function-components',
            name: 'Function Components',
            title: 'Function Components - Markup Reactive Templating System',
            description: genericDescription,
            component: FunctionComponentsPage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/web-components',
            name: 'Web Components',
            title: 'Web Components - Markup Reactive Templating System',
            description: genericDescription,
            component: WebComponentsPage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/state-store',
            name: 'State Store',
            title: 'State Store - Markup Reactive Templating System',
            description: genericDescription,
            component: StateStorePage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/server-side-rendering',
            name: 'Server Side Rendering',
            title: 'Server Side Rendering - Markup Reactive Templating System',
            description: genericDescription,
            component: ServerSideRenderingPage,
            group: 'Capabilities',
            root: false,
        },
        {
            path: '/documentation/router',
            name: 'Router',
            title: 'Router - Markup Reactive Templating System',
            description: genericDescription,
            component: RouterPage,
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
