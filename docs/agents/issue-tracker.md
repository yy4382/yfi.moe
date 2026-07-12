# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --comments`, including labels.
- **List issues**: `gh issue list` with appropriate state, label, and JSON filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply or remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- **Close an issue**: `gh issue close <number> --comment "..."`.

Infer the repository from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** External pull requests do not enter the issue-triage queue.

## Skill operations

- When a skill says “publish to the issue tracker,” create a GitHub issue.
- When a skill says “fetch the relevant ticket,” run `gh issue view <number> --comments`.
- GitHub shares one number space across issues and PRs; resolve an ambiguous number with `gh pr view` and fall back to `gh issue view`.

## Wayfinding operations

For `/wayfinder`, use one issue labelled `wayfinder:map` as the map and GitHub sub-issues as child tickets. Use native issue dependencies for blocking edges when available; otherwise record `Blocked by: #<n>` in the child issue. Claim work by assigning it, and resolve it by recording the answer before closing the child issue.
