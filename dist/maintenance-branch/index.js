import * as core from '@actions/core';
import { createGitHubControl, createPrefixStableVersionMatcher, createNMinusRangeSupportPolicy, maintainStableVersionBranches } from '@tsuhama/release-please-please-me';
export async function main() {
    const inputs = parseActionInputs();
    const git = createGitOperations(inputs);
    const matcher = createPrefixStableVersionMatcher(inputs.stableVersionBranchPrefix);
    const policy = createNMinusRangeSupportPolicy(inputs.latestReleaseVersion, inputs.majorVersionSupportPolicy, inputs.minorVersionSupportPolicy);
    await maintainStableVersionBranches(git, policy, matcher);
}
;
function parseActionInputs() {
    return {
        token: core.getInput('token', { required: true }),
        latestReleaseVersion: core.getInput('latest-release-version', { required: true }),
        stableVersionBranchPrefix: core.getInput('stable-version-branch-prefix', { required: true }),
        minorVersionSupportPolicy: parseInt(core.getInput('minor-version-support-policy', { required: true })),
        majorVersionSupportPolicy: parseInt(core.getInput('major-version-support-policy', { required: true })),
    };
}
function createGitOperations(inputs) {
    const repoUrl = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoUrl.split('/');
    return createGitHubControl(repo, owner, 'main', inputs.token);
}
