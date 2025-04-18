# Maintain Please GitHub Actions

![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Actions repository for [Maintain Please](https://github.com/tsuhama/maintain-please). Acts as a mono repository to provide all available actions in this single place. 

## Available Actions
### `maintenance-branch`
For creation a new stable version branch on a new release and cleaning up branches for stable versions which drop out of the configurable maintenance support range with the new release.
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

### `backport`
For automated PR creation for backporting a bug-/security patch branch into all stable version branches of the project. 
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

## Integration
Below, there are some possible workflows setup combined with the [release-please-action](https://github.com/googleapis/release-please-action) to fully utilize the features of this action. 
