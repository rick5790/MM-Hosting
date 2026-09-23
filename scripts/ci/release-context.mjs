export function resolveReleaseBranch(env = process.env, localBranch = '') {
  const explicitReleaseRef = String(env.CI_RELEASE_REF || '').trim();
  if (explicitReleaseRef) return explicitReleaseRef;

  const eventName = String(env.GITHUB_EVENT_NAME || '').trim();
  const headRef = String(env.GITHUB_HEAD_REF || '').trim();
  const refName = String(env.GITHUB_REF_NAME || '').trim();

  // Pull-request checkouts can expose the base branch through GITHUB_REF_NAME.
  // The release belongs to the PR head, so never fall back to the base here.
  if (eventName === 'pull_request' || eventName === 'pull_request_target') {
    return headRef;
  }

  return refName || headRef || localBranch;
}
