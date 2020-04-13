import { flags as oclifFlags } from '@oclif/command'

import testAbStatus from '../../../modules/workspace/abtest/status'
import { CustomCommand } from '../../../oclif/CustomCommand'

export default class ABTestStatus extends CustomCommand {
  static description = 'Display currently running AB tests results'

  static examples = []

  static flags = {
    help: oclifFlags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(ABTestStatus)
    await testAbStatus()
  }
}