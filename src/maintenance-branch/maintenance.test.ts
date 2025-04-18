// see https://github.com/microsoft/TypeScript/issues/52086
import nock from 'nock'
import mockedEnv, { RestoreFn } from 'mocked-env'
import { main } from './maintenance'
import { afterEach, beforeEach } from '@jest/globals'

const mockedEnvFun =
  mockedEnv as unknown as (typeof import('mocked-env'))['default']
const defaultRepository = 'fakeOwner/fakeRepo'

describe('maintenance', () => {
  let restoreEnv: RestoreFn | null
  beforeEach(() => {
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    nock.cleanAll()
    nock.restore()
    if (restoreEnv) {
      restoreEnv()
      restoreEnv = null
    }
  })
  test('should not create stable version branch if exists', async () => {
    restoreEnv = mockGitHubEnv(defaultRepository, {
      INPUT_TOKEN: 'some-token',
      'INPUT_LATEST-RELEASE-VERSION': '4.8.0',
      'INPUT_STABLE-VERSION-BRANCH-PREFIX': 'stable-',
      'INPUT_MAJOR-VERSION-SUPPORT-POLICY': '2',
      'INPUT_MINOR-VERSION-SUPPORT-POLICY': '3'
    })
    // tag for 4.8.0 does not exist
    nock('https://api.github.com')
      .get('/repos/fakeOwner/fakeRepo/git/ref/heads%2Fstable-4.8')
      .reply(200, {
        object: {
          sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
          url: 'https://api.github.com/repos/fakeOwner/fakeRepo/maintenance-4.8'
        }
      })
    nock('https://api.github.com')
      .get('/repos/fakeOwner/fakeRepo/branches')
      .reply(200, [
        {
          name: 'main',
          commit: {
            sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/main'
          }
        }
      ])
    await expect(main()).resolves.not.toThrow()
    expect(nock.isDone()).toBe(true)
  })
  test('should create stable version branch and cleanup unsupported version branches', async () => {
    restoreEnv = mockGitHubEnv(defaultRepository, {
      INPUT_TOKEN: 'some-token',
      'INPUT_LATEST-RELEASE-VERSION': '4.8.0',
      'INPUT_STABLE-VERSION-BRANCH-PREFIX': 'stable-',
      'INPUT_MAJOR-VERSION-SUPPORT-POLICY': '2',
      'INPUT_MINOR-VERSION-SUPPORT-POLICY': '3'
    })
    // tag for 4.8.0 does not exist, so create it based on tag
    nock('https://api.github.com')
      .get('/repos/fakeOwner/fakeRepo/git/ref/heads%2Fstable-4.8')
      .reply(404)
    nock('https://api.github.com')
      .get(`/repos/fakeOwner/fakeRepo/git/ref/tags%2F4.8.0`)
      .reply(200, {
        object: {
          sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc'
        }
      })
    nock('https://api.github.com')
      .post(
        `/repos/fakeOwner/fakeRepo/git/refs`,
        (body) => body.ref == 'refs/heads/stable-4.8'
      )
      .reply(201, {
        object: {
          sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
          url: 'https://api.github.com/repos/fakeOwner/fakeRepo/stable-4.8'
        }
      })

    // clean up 1.9, 4.4
    // keep 2.0, 4.5
    nock('https://api.github.com')
      .get('/repos/fakeOwner/fakeRepo/branches')
      .reply(200, [
        {
          name: 'stable-1.9',
          commit: {
            sha: 'sha-for-stable-1.9',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/stable-1.9'
          }
        },
        {
          name: 'stable-2.0',
          commit: {
            sha: 'sha-for-stable-2.0',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/stable-2.0'
          }
        },
        {
          name: 'stable-4.4',
          commit: {
            sha: 'sha-for-stable-4.4',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/stable-4.4'
          }
        },
        {
          name: 'stable-4.5',
          commit: {
            sha: 'sha-for-stable-4.5',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/stable-4.5'
          }
        }
      ])
    // verify deletions
    nock('https://api.github.com')
      .delete('/repos/fakeOwner/fakeRepo/git/refs/sha-for-stable-1.9')
      .reply(204)
    nock('https://api.github.com')
      .delete('/repos/fakeOwner/fakeRepo/git/refs/sha-for-stable-4.4')
      .reply(200)
    await expect(main()).resolves.not.toThrow()
    // no verification via nock.isDone() due to https://github.com/nock/nock/issues/705
  })
})

function mockGitHubEnv(
  repository: string,
  inputs: { [varName: string]: string }
): RestoreFn {
  const envVars = {
    ...inputs,
    GITHUB_REPOSITORY: repository
  }
  return mockedEnvFun(envVars)
}
