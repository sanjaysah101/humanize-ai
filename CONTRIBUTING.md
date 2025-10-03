# Contributing to Humanize-AI

Thank you for your interest in contributing to Humanize-AI! We appreciate your time and effort to make this project better. Please read the guidelines below to help you get started.

- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
  - [Becoming a collaborator](#becoming-a-collaborator)
- [Getting started](#getting-started)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

By participating in this project, you agree to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please take a moment to review it to ensure a welcoming and inclusive environment for everyone.

## Contributing

- A **Contributor** is any individual who creates an issue/PR, comments on an issue/PR, or contributes in some other way.
- A **Collaborator** is a contributor with write access to the repository. See [here](#becoming-a-collaborator) on how to become a collaborator.

### Becoming a Collaborator

A collaborator of the Humanize-AI project is a member of the Humanize-AI Team.

The team is responsible for the technical development of Humanize-AI; thus, it is expected
that team members have significant knowledge about modern Web Technologies, AI/ML, and related standards.

Note that regular contributors do not need to become "Collaborators" as any contribution is appreciated (even without a status), and a Collaborator status
is a formality that comes with obligations.

If you're an active contributor seeking to become a member, we recommend you contact one of the existing Team Members for guidance.

<details>
  <summary><b>What's the process for becoming a Collaborator?</b></summary>

- You must be actively contributing to this repository.
- Contributions must include significant code reviews or code contributions.
- A nomination must be done by an existing Team Member with an Issue
  - The Issue must explain and describe why the nominated person is a good addition to the team
  - The Issue must contain links to relevant contributions through:
    - Code Reviews
    - Comments on Issues and PRs
    - Authoring of PRs or Issues
    - Comments or Authoring of Discussions
- The nomination must have at least three existing members agree with the nomination.
  - This can be done through commenting with "agreement" (showing support) or reacting to the Issue with a :+1: (Thumbs-up Emoji)
- The Issue must be open for at least 72 hours without an objection from an existing member
  - The nomination cannot pass until all open objections are resolved.
  - Objections from core contributors are also counted as valid objections.

</details>

## How to Contribute

The steps below will give you a general idea of how to prepare your local environment for Humanize-AI and general steps for getting things done and landing your contribution.

### Prerequisites

Before you start, ensure you have the following prerequisites installed:

- Node.js (v20.12.0 or later)
- pnpm (v9.0.0 or later)

#### 1. **Fork the Repository**

Click the fork button in the top right to clone the [Humanize-AI](https://github.com/sanjaysah101/humanize-ai/fork)

#### 2. **Clone the Repository**

Once you've forked the repository, clone it to your local machine:
Clone your fork using SSH, GitHub CLI, or HTTPS.

```bash
git clone git@github.com:sanjaysah101/humanize-ai.git # SSH
git clone https://github.com/sanjaysah101/humanize-ai.git # HTTPS
gh repo clone sanjaysah101/humanize-ai # GitHub CLI
```

#### 3. Change into the humanize-ai directory

```bash
cd humanize-ai
```

#### 4. **Create a Branch**

Create a new branch for your feature, bug fix, or documentation update:

```bash
  git checkout -b <name-of-your-branch>
```

#### 5. **Install Dependencies**

Run the following to install the dependencies and start a local preview of your work.

```bash
pnpm i # installs this project's dependencies
pnpm dev # starts a development environment
```

The project should now be running on <http://localhost:3000>.

#### 6. **Make Changes**

Make sure to follow the code style and formatting guidelines below when making changes.

#### 7. Run `pnpm prettier:fix` to confirm that linting and formatting are passing

```bash
pnpm prettier:fix
```

#### 8. **Commit Your Changes**

After making your changes, commit them with a descriptive commit message:

```bash
git add .
git commit -m "Add new feature for user registration"
```

#### 9. **Push to Your Fork**

Push your changes to your forked Repository on GitHub:

```bash
  git push -u origin name-of-your-branch
```

#### 10. **Create a Pull Request (PR)**

Go to the original repository and click on the "New Pull Request" button. Provide a clear description of your changes in the PR description. Link the issue you are addressing, if applicable.

#### 11. **Wait for Review**

The maintainers will review your PR and may suggest changes. Once approved, your PR will be merged.

### Naming Conventions for Branches

- `feature/[issue-number]-[short-description]`: A new feature
- `fix/[issue-number]-[short-description]`: A bug fix
- `docs/[issue-number]-[short-description]`: Documentation only changes
- `refactor/[issue-number]-[short-description]`: A code change that neither fixes a bug nor adds a feature
- `test/[issue-number]-[short-description]`: Adding missing tests
- `chore/[issue-number]-[short-description]`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Commit Message Guidelines

- Commit messages must include a "type" as described on Conventional Commits
- Commit messages **must** start with a capital letter
- Commit messages **must not** end with a period `.`
- Commit messages **must** be in English
- Commit messages **must** be written in the present tense

## Code Formatting and Style Guide

We use Prettier for code formatting. Run the following to check or fix formatting issues:
Check: pnpm prettier:check
Fix: pnpm prettier:fix

We use ESLint for linting. To check and fix lint issues:
Check: pnpm lint
Fix: pnpm lint:fix

Ensure that your code adheres to the existing coding standards and passes all tests before submitting a pull request.

### Pre-commit Hooks

This project uses [Husky][] for Git pre-commit hooks.

### When merging

- Please make sure that all discussions are resolved.

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](./LICENSE).
