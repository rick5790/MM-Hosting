import assert from 'node:assert/strict';
import { resolveReleaseBranch } from './release-context.mjs';

assert.equal(resolveReleaseBranch({
  CI_RELEASE_REF: '7.2',
  GITHUB_EVENT_NAME: 'pull_request',
  GITHUB_HEAD_REF: '7.2',
  GITHUB_REF_NAME: '7.1',
}), '7.2');

assert.equal(resolveReleaseBranch({
  GITHUB_EVENT_NAME: 'pull_request',
  GITHUB_HEAD_REF: '7.2',
  GITHUB_REF_NAME: '67/merge',
}), '7.2');

assert.equal(resolveReleaseBranch({
  GITHUB_EVENT_NAME: 'push',
  GITHUB_REF_NAME: '7.2',
}), '7.2');

assert.equal(resolveReleaseBranch({}, '7.2'), '7.2');

console.log('✓ release context selects the PR head and push branch correctly');
