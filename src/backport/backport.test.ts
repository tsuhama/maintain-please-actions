import { RestoreFn } from 'mocked-env'
import mockedEnv from 'mocked-env'
import { main } from './backport'
import nock from 'nock'
import { beforeEach, jest, afterEach } from '@jest/globals'

// see https://github.com/microsoft/TypeScript/issues/52086
const mockedEnvFun =
  mockedEnv as unknown as (typeof import('mocked-env'))['default']
const defaultRepository = 'fakeOwner/fakeRepo'

describe('backport', () => {
  let restoreEnv: RestoreFn | null
  beforeEach(() => {
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
    nock.restore()
    if (restoreEnv) {
      restoreEnv()
      restoreEnv = null
    }
  })
  test('should not create any PR if there is no stable version branch', async () => {
    const fixBranchName = 'fix-123'
    restoreEnv = mockGitHubEnv(defaultRepository, {
      INPUT_TOKEN: 'some-token',
      'INPUT_STABLE-VERSION-PREFIX': 'stable-',
      'INPUT_SOURCE-BRANCH': fixBranchName
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
    nock('https://api.github.com')
      .get(`/repos/fakeOwner/fakeRepo/git/ref/heads%2F${fixBranchName}`)
      .reply(200, {
        object: {
          sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
          url: 'https://api.github.com/repos/fakeOwner/fakeRepo/main'
        }
      })
    await expect(main()).resolves.not.toThrow()
    expect(nock.isDone()).toBe(true)
  })
  test('should create PR for each stable version branch', async () => {
    const fixBranchName = 'fix-123'
    restoreEnv = mockGitHubEnv(defaultRepository, {
      INPUT_TOKEN: 'some-token',
      'INPUT_STABLE-VERSION-PREFIX': 'maintenance-',
      'INPUT_SOURCE-BRANCH': fixBranchName
    })
    nock('https://api.github.com')
      .get('/repos/fakeOwner/fakeRepo/branches')
      .reply(200, [
        {
          name: 'maintenance-2.3',
          commit: {
            sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/maintenance-2.3'
          }
        },
        {
          name: 'maintenance-1.1',
          commit: {
            sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
            url: 'https://api.github.com/repos/fakeOwner/fakeRepo/maintenance-1.1'
          }
        }
      ])
    nock('https://api.github.com')
      .get(`/repos/fakeOwner/fakeRepo/git/ref/heads%2F${fixBranchName}`)
      .reply(200, {
        object: {
          sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
          url: 'https://api.github.com/repos/fakeOwner/fakeRepo/main'
        }
      })
    nock('https://api.github.com')
      .post(
        `/repos/fakeOwner/fakeRepo/pulls`,
        (body) => body.head == fixBranchName && body.base == 'maintenance-2.3'
      )
      .reply(201, {
        title: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
        number: 1,
        url: 'https://api.github.com/repos/fakeOwner/fakeRepo/PR/1'
      })
    nock('https://api.github.com')
      .post(
        `/repos/fakeOwner/fakeRepo/pulls`,
        (body) => body.head == fixBranchName && body.base == 'maintenance-1.1'
      )
      .reply(201, {
        title: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
        number: 2,
        url: 'https://api.github.com/repos/fakeOwner/fakeRepo/PR/2'
      })
    await expect(main()).resolves.not.toThrow()
    expect(nock.isDone()).toBe(true)
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
