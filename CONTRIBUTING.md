# Contributing

Thank you for helping improve Markup. Bug reports, documentation fixes, tests,
and focused feature proposals are welcome.

## Before You Start

- Search existing issues and pull requests before opening a duplicate.
- Use the issue templates and include a minimal reproduction for bugs.
- Discuss substantial API or behavior changes in an issue before implementation.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md).

## Development

Use a Node.js and npm version supported by `package.json` and CI.

```sh
npm ci
npm test
npm run lint
npm run build
```

Run the native-browser interaction regressions when changing DOM movement,
keyed rendering, focus, selection, or boolean attributes:

```sh
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux machines missing browser system dependencies, use
`npx playwright install --with-deps chromium firefox webkit`. To run one engine,
use `npm run test:browser -- --project=firefox` (or `chromium` / `webkit`). The
suite bundles the current source in memory. GitHub Actions runs each engine in
an independent job, separately from the unit, benchmark, lint, and package
checks.

All engines run the same assertions for keyboard access with `inert`, retained
input identity/value/focus/selection, ordinary contenteditable selection, and
open-shadow input focus/selection. Each movement scenario runs once with the
browser's default APIs and again with `moveBefore` explicitly disabled, so
fallback coverage does not depend on native API support.

Native `moveBefore` callback and closed-shadow state preservation tests are
feature-gated and report a skip when that API is unavailable. The open-shadow
contenteditable case additionally probes whether the engine exposes the text
selection's internal endpoints through `Selection` or `ShadowRoot.getSelection()`.
Engines that re-scope those endpoints to the host and expose no shadow selection
API cannot support that restoration path; this single case reports that
limitation as a skip. The common focus, input-selection, and ordinary
contenteditable assertions are not relaxed. Fallback movement remains best
effort for closed shadow roots and other browser-managed state.

In the October 2026 validation, Chromium 153 and Firefox 157 passed all 17
cases. WebKit 27.2 passed the 13 portable cases and reported four capability
skips: it does not expose `moveBefore`, and its document selection re-scopes
open-shadow text endpoints without `ShadowRoot.getSelection()`. Its ordinary
contenteditable selection and open-shadow input focus/selection cases passed
in both API modes. These are recorded engine limitations, not relaxed common
assertions; the feature probes automatically exercise these cases if support
becomes available.

Keep changes focused and add or update tests for behavior changes. Update the
documentation when public APIs or documented behavior change.

## Pull Requests

1. Create a branch from `main`.
2. Make a focused change with clear commit messages.
3. Run the test, lint, and build commands above.
4. Complete the pull request template and link any related issue.
5. Address review feedback and keep the branch current with `main`.

Pull requests require review before merge. By contributing, you agree that your
contribution is licensed under this project's [BSD 3-Clause License](LICENSE).
