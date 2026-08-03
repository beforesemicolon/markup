---
name: '{{t.pages.documentation.installation.meta.installation}}'
order: 3
title: '{{t.pages.documentation.installation.meta.installation_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.installation.meta.install_markup_from_a_cdn_or_package_manager_pin_versions_import_the_javascript_apis_and_use_the}}'
layout: document
---

## {{t.pages.documentation.installation.content.installation}}

{{t.pages.documentation.installation.content.markup_is_a_plug_and_play_package_that_does_not_need_to_be_built_there_is_no_need_to_any_additio}}

### {{t.pages.documentation.installation.content.via_cdn}}

{{t.pages.documentation.installation.content.this_method_is_the_quickest_loading_option_and_can_be_placed_in_the_head_tag_of_the_document}}

```html
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js" />
```

{{t.pages.documentation.installation.content.you_may_also_specify_a_specific_version_you_want}}

```html
<script src="https://unpkg.com/@beforesemicolon/markup@1.0.0/dist/client.js" />
```

{{t.pages.documentation.installation.content.you_can_use_various_cdn_providers_like_unpkg_jsdelivr}}

```html
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js" />
<script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/markup/dist/client.js" />
```

{{t.pages.documentation.installation.content.the_client_cdn_link_will_create_a_global_bfs_markup_variable_you_can_access_for_all_the_internal}}

```javascript
const { html, state, effect } = BFS.MARKUP
```

### {{t.pages.documentation.installation.content.via_npm}}

{{t.pages.documentation.installation.content.this_package_is_also_available_via_npm_which_will_allow_you_to_use_it_in_server_side_javascript}}

```
npm install @beforesemicolon/markup
```

```javascript
import { html, state, effect } from '@beforesemicolon/markup'
```

### {{t.pages.documentation.installation.content.via_yarn}}

```
yarn add @beforesemicolon/markup
```

### {{t.pages.documentation.installation.content.typescript}}

{{t.pages.documentation.installation.content.this_package_was_built_using_typescript_you_don_t_need_to_install_a_separate_types_package_for_i}}
