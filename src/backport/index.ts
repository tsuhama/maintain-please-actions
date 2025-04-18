import * as core from '@actions/core'
import { main } from './backport.js'

main().catch((err) => {
  core.setFailed(
    `release-please-please-me backport action failed: ${err.message}`
  )
})
