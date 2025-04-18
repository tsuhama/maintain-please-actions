import * as core from '@actions/core'
import {
  GitControl,
  createGitHubControl,
  createPrefixStableVersionMatcher,
  backportFixBranch
} from '@tsuhama/maintain-please'

export async function main() {
  const inputs = parseActionInputs()
  const git = createGitOperations(inputs)
  const matcher = createPrefixStableVersionMatcher(
    inputs.stableVersionBranchPrefix
  )
  await backportFixBranch(git, matcher, inputs.sourceBranch)
}

interface ActionInputs {
  readonly token: string
  readonly stableVersionBranchPrefix: string
  readonly sourceBranch: string
}

function parseActionInputs(): ActionInputs {
  return {
    token: core.getInput('token', { required: true }),
    stableVersionBranchPrefix: core.getInput('stable-version-prefix', {
      required: true
    }),
    sourceBranch: core.getInput('source-branch', { required: true })
  }
}

function createGitOperations(inputs: ActionInputs): GitControl {
  const repoUrl = process.env.GITHUB_REPOSITORY || ''
  const [owner, repo] = repoUrl.split('/')
  return createGitHubControl(repo, owner, 'main', inputs.token)
}
