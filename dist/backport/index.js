import * as core from '@actions/core';
import { createGitHubControl, createPrefixStableVersionMatcher, backportFixBranch } from '@tsuhama/release-please-please-me';
export async function main() {
    const inputs = parseActionInputs();
    const git = createGitOperations(inputs);
    const matcher = createPrefixStableVersionMatcher(inputs.stableVersionBranchPrefix);
    await backportFixBranch(git, matcher, inputs.sourceBranch);
}
function parseActionInputs() {
    return {
        token: core.getInput('token', { required: true }),
        stableVersionBranchPrefix: core.getInput('stable-version-prefix', {
            required: true
        }),
        sourceBranch: core.getInput('source-branch', { required: true })
    };
}
function createGitOperations(inputs) {
    const repoUrl = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoUrl.split('/');
    return createGitHubControl(repo, owner, 'main', inputs.token);
}
if (require.main === module) {
    main().catch((err) => {
        core.setFailed(`release-please-please-me backport action failed: ${err.message}`);
    });
}
