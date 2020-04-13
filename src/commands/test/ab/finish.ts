import { flags as oclifFlags } from '@oclif/command'

import testAbFinish from '../../../modules/workspace/abtest/finish'
import { CustomCommand } from '../../../oclif/CustomCommand'

export default class ABTestFinish extends CustomCommand {
  static description = 'Stop all AB testing in current account'

  static examples = []

  static flags = {
    help: oclifFlags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(ABTestFinish)

    await testAbFinish()
  }
}