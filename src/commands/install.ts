import { flags as oclifFlags } from '@oclif/command'

import { CustomCommand } from '../oclif/CustomCommand'
import appsInstall from '../modules/apps/install'

export default class Install extends CustomCommand {
  static description = 'Install an app (defaults to the app in the current directory)'

  static examples = ['vtex install', 'vtex install vtex.service-example@0.x', 'vtex install vtex.service-example@0.0.1']

  static flags = {
    help: oclifFlags.help({ char: 'h' }),
    force: oclifFlags.boolean({
      char: 'f',
      description: 'Install app without checking for route conflicts',
      default: false,
    }),
  }

  static args = [{ name: 'appId' }]

  async run() {
    const {
      args: { appId },
      flags: { force },
    } = this.parse(Install)

    await appsInstall(appId, { force })
  }
}
