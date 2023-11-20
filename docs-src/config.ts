import Home from './index.page'
import Documentation from './documentation/index.page'
import InstallationPage from './documentation/installation.page'
import EssentialTrainingPage from './documentation/essential-training.page'
import TutorialPage from './documentation/tutorial.page'
import ExamplesPage from './documentation/examples.page'
import CreatingAndRenderingPage from './documentation/creating-and-rendering.page'
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

const config: Page[] = [
    {
        path: '/',
        name: 'Markup',
        title: 'Markup: HTML Templating System by Before Semicolon',
        component: Home,
        group: '',
        root: true,
    },
    {
        path: 'documentation/',
        name: 'What is Markup?',
        title: 'Documentation: Markup by Before Semicolon',
        component: Documentation,
        group: 'Introduction',
        root: true,
    },
    {
        path: 'documentation/installation',
        name: 'Installation',
        title: 'Installation Documentation: Markup by Before Semicolon',
        component: InstallationPage,
        group: 'Introduction',
        root: false,
    },
    {
        path: 'documentation/essential-training',
        name: 'Installation',
        title: 'Essential Training : Markup by Before Semicolon',
        component: EssentialTrainingPage,
        group: 'Introduction',
        root: false,
    },
    {
        path: 'documentation/tutorials',
        name: 'Tutorials',
        title: 'Tutorials : Markup by Before Semicolon',
        component: TutorialPage,
        group: 'Introduction',
        root: false,
    },
    {
        path: 'documentation/examples',
        name: 'Examples',
        title: 'Examples : Markup by Before Semicolon',
        component: ExamplesPage,
        group: 'Introduction',
        root: false,
    },
    {
        path: 'documentation/creating-and-rendering',
        name: 'Creating & Rendering',
        title: 'Creating & Rendering : Markup by Before Semicolon',
        component: CreatingAndRenderingPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/templating-values',
        name: 'Templating Values',
        title: 'Templating Values : Markup by Before Semicolon',
        component: TemplatingValuesPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/replacing-content',
        name: 'Replacing Content',
        title: 'Replacing Content : Markup by Before Semicolon',
        component: ReplacingContentPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/dom-references',
        name: 'DOM References',
        title: 'DOM References : Markup by Before Semicolon',
        component: DOMReferencesPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/conditional-attributes',
        name: 'Conditional Attributes',
        title: 'Conditional Attributes : Markup by Before Semicolon',
        component: ConditionalAttributesPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/event-handling',
        name: 'Event Handling',
        title: 'Event Handling : Markup by Before Semicolon',
        component: EventHandlingPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/dynamic-values-and-update',
        name: 'Dynamic Values & Update',
        title: 'Dynamic Values & Update : Markup by Before Semicolon',
        component: DynamicValuesAndUpdatePage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/state-values',
        name: 'State Values',
        title: 'State Values : Markup by Before Semicolon',
        component: StatValuesPage,
        group: 'Templating',
        root: false,
    },
    {
        path: 'documentation/what-is-a-helper',
        name: 'What is a Helper?',
        title: 'What is a Helper? : Markup by Before Semicolon',
        component: WhatIsAHelperPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/effect-helper',
        name: 'Effect Helper',
        title: 'Effect Helper : Markup by Before Semicolon',
        component: EffectHelperPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/conditional-rendering',
        name: 'Conditional Rendering',
        title: 'Conditional Rendering : Markup by Before Semicolon',
        component: ConditionalRenderingPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/repetition-and-lists',
        name: 'Repetition & Lists',
        title: 'Repetition & Lists : Markup by Before Semicolon',
        component: RepetitionAndListsPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/is-isnot-helpers',
        name: 'Is & IsNot Helpers',
        title: 'Is & IsNot Helpers : Markup by Before Semicolon',
        component: IsIsNotHelpersPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/or-and-oneof-helpers',
        name: 'Or, And, & OneOf Helpers',
        title: 'Or, And, & OneOf Helpers : Markup by Before Semicolon',
        component: OrAndOneOfHelpersPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/pick-helper',
        name: 'Pick Helper',
        title: 'Pick Helper : Markup by Before Semicolon',
        component: PickHelperPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/custom-helper',
        name: 'Custom Helper',
        title: 'Custom Helper : Markup by Before Semicolon',
        component: CustomHelperPage,
        group: 'Helpers',
        root: false,
    },
    {
        path: 'documentation/element-util',
        name: 'Element',
        title: 'Element : Markup by Before Semicolon',
        component: ElementUtilPage,
        group: 'Utilities',
        root: false,
    },
    {
        path: 'documentation/suspense-util',
        name: 'Suspense',
        title: 'Suspense : Markup by Before Semicolon',
        component: SuspenseUtilPage,
        group: 'Utilities',
        root: false,
    },
    {
        path: 'documentation/function-components',
        name: 'Function Components',
        title: 'Function Components : Markup by Before Semicolon',
        component: FunctionComponentsPage,
        group: 'Capabilities',
        root: false,
    },
    {
        path: 'documentation/web-components',
        name: 'Web Components',
        title: 'Web Components : Markup by Before Semicolon',
        component: WebComponentsPage,
        group: 'Capabilities',
        root: false,
    },
    {
        path: 'documentation/state-store',
        name: 'State Store',
        title: 'State Store : Markup by Before Semicolon',
        component: StateStorePage,
        group: 'Capabilities',
        root: false,
    },
    {
        path: 'documentation/server-side-rendering',
        name: 'Server Side Rendering',
        title: 'Server Side Rendering : Markup by Before Semicolon',
        component: ServerSideRenderingPage,
        group: 'Capabilities',
        root: false,
    },
]

export const DocMenu: DocumentsGroup[] = Object.values(
    config.reduce(
        (acc, page) => {
            if (page.group && page.path.startsWith('documentation')) {
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
