# Contributing

Thank you for helping improve Markup. Bug reports, documentation fixes, tests,
and focused feature proposals are welcome.

## Before You Start

-   Search existing issues and pull requests before opening a duplicate.
-   Use the issue templates and include a minimal reproduction for bugs.
-   Discuss substantial API or behavior changes in an issue before implementation.
-   Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
-   Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md).

## Development

Use a Node.js and npm version supported by `package.json` and CI.

```sh
npm ci
npm test
npm run lint
npm run build
```

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
