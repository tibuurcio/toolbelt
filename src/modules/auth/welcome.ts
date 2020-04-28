/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import chalk from 'chalk'
import { compose, equals, filter, head, prop, split } from 'ramda'

import { Sponsor } from '../../clients/sponsor'
import { parseLocator } from '../../locator'
import log from '../../logger'
import { createTable } from '../../table'
import { getIOContext, IOClientOptions } from '../utils'
import { SessionManager } from '../../lib/session/SessionManager'

type Edition = {
  id: string
  vendor: string
  name: string
  version: string
  title: string
  description: string
  _publicationDate: string
  _activationDate: string
}

const cleanVersion = compose<string, string[], string>(head, split('+build'))

const filterBySource = (source: string) => filter(compose<any, string, boolean>(equals(source), prop('_source')))

const renderTable = (title: string, rows: string[][]): void => {
  console.log(title)

  const table = createTable()

  rows.forEach(([name, value]) => {
    table.push([chalk.blue(name), value])
  })

  console.log(`${table.toString()}\n`)
}

const renderAppsTable = ({
  title,
  emptyMessage,
  appArray,
}: {
  title: string
  emptyMessage: string
  appArray: any
}): void => {
  console.log(title)

  if (appArray.length === 0) {
    return console.log(`${emptyMessage}\n`)
  }

  const table = createTable()

  appArray.forEach(({ app }) => {
    const { vendor, name, version } = parseLocator(app)

    const cleanedVersion = cleanVersion(version)

    const formattedName = `${chalk.blue(vendor)}${chalk.gray.bold('.')}${name}`

    table.push([formattedName, cleanedVersion])
  })

  console.log(`${table.toString()}\n`)
}

export default async () => {
  const sessionManager = SessionManager.getSessionManager()
  const { apps } = require('../../clients')
  const { account, workspace } = sessionManager
  const sponsorClient = new Sponsor(getIOContext(sessionManager), IOClientOptions)
  const edition = (await sponsorClient.getEdition()) as Edition
  const appArray = await apps.listApps().then(prop('data'))

  log.info(`Welcome to VTEX IO!`)

  /** RUNNING TESTS */
  // log.info(`// RUNNING TESTS`)

  /** LATEST WORKSPACES */
  // log.info(`// LATEST WORKSPACES can we add links to commands? vtex://use/{workspace}`)

  /** General information */
  renderTable(`${chalk.yellow('General')}`, [
    ['Account', account],
    ['Workspace', workspace],
    ['Edition', edition.title],
    ['Edition id', edition.id],
    ['Edition activated', edition._activationDate],
  ])

  /** APPS LIST */
  renderAppsTable({
    title: `${chalk.yellow('Installed Apps')}`,
    emptyMessage: 'You have no installed apps',
    appArray: filterBySource('installation')(appArray),
  })
}