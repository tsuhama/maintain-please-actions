import * as core from '@actions/core'
import { main } from './maintenance.js'

main().catch((err) => {
  core.setFailed(
    `release-please-please-me maintenance branch action failed: ${err.message}`
  )
})
