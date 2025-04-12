"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backportFixBranch = backportFixBranch;
const maintenance_1 = require("./maintenance");
async function backportFixBranch(git, matcher, fixBranchName) {
    const stableVersionBranches = await (0, maintenance_1.getStableVersionBranches)(git, matcher);
    const fixBranch = await git.getBranch(fixBranchName);
    for (const it of stableVersionBranches) {
        console.info(`creating backport pull request from ${fixBranchName} against ${it.branch.name}.`);
        const pr = await git.createPullRequest(fixBranch, it.branch);
        console.info(`successfully created backport pull request ${pr.number} for stable version ${it.version}.`);
    }
}
