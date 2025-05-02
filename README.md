# Maintain Please GitHub Actions

![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Actions repository for
[Maintain Please](https://github.com/tsuhama/maintain-please). Acts as a mono
repository to provide all available actions in this single place.

## Available Actions

### `maintenance-branch`

For creation a new stable version branch on a new release and cleaning up
branches for stable versions which drop out of the configurable maintenance
support range with the new release.

#### Getting Started

```yaml
steps:
  - name: Maintain Stable Version Branches
    uses: tsuhama/maintain-please-actions/maintenance-branch
    with:
      latest-release-version: 4.8.0
      stable-version-branch-prefix: stable-
      minor-version-support-policy: 2
      major-version-support-policy: 1
```

#### Configuration

| Option                         | Description                                                                                                                                                                                                           | Required | Default Value                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `token`                        | GitHub token used to interact with the GitGHub REST API, requiring following permissions:                                                                                                                             | `false`  | Retrieved from `github.token` in the running workflow |
| `latest-release-version`       | Latest released semantic version. This version is used to create a new stable branch from. In practice this value is retrieved dynamically upon release process, triggering this action in the same release workflow. | `true`   |                                                       |
| `stable-version-branch-prefix` | Prefix for stable version branches. The configured value is used to create and identify stable version branches in this repository.                                                                                   | `false`  | `stable-`                                             |
| `minor-version-support-policy` | `n-${minor-version-support-policy}` considered for the cleanup of stable version branches on the minor version field applied to stable version branches with major version equal to `latest-release-version`.         | `false`  | `2`                                                   |
| `major-version-support-policy` | `n-${major-version-support-policy}` considered for the cleanup of stable version branches on the major version field applied to stable version branches.                                                              | `false`  | `1`                                                   |

### `backport`

For automated PR creation for backporting a bug-/security patch branch into all
stable version branches of the project.

#### Getting Started

```yaml
steps:
  - name: Create Backport PRs
    uses: tsuhama/maintain-please-actions/backport
    with:
      stable-version-branch-prefix: stable-
      source-branch: JIRA-123/BUGFIX-456
```

#### Configuration

| Option                         | Description                                                                                                                    | Required | Default Value                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------- |
| `token`                        | GitHub token used to interact with the GitGHub REST API, requiring following permissions:                                      | `false`  | Retrieved from `github.token` in the running workflow |
| `stable-version-branch-prefix` | Prefix for stable version branches. The configured value is used to identify stable version branches to create the PR against. | `false`  | `stable-`                                             |
| `source-branch`                | Name of the source branch containing the backport fix to create the PRs from (as head branch)                                  | `true`   |                                                       |

## Integration

Below, there are some possible workflows setup combined with the
[release-please-action](https://github.com/googleapis/release-please-action) to
fully utilize the features of this action.
