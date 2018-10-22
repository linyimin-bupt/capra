
import { log }    from 'brolog'

const logLevel = process.env.CAPRA_LOG

if (logLevel) {
  log.level(logLevel.toLowerCase() as any)
  log.silly('Config', `WECHATY_LOG set level to ${logLevel}`)
}

/**
 * to handle unhandled exceptions
 */
if (log.level() === 'verbose' || log.level() === 'silly') {
  log.info('Config', 'registering process.on("unhandledRejection") for development/debug')
  process.on('unhandledRejection', (reason, promise) => {
    log.error('Config', '###########################')
    log.error('Config', `unhandledRejection: ${reason} ${promise}`)
    log.error('Config', '###########################')
    promise.catch(err => {
      log.error('Config', `process.on(unhandledRejection) promise.catch(${err.message})`)
      console.error('Config', err) // I don't know if log.error has similar full trace print support like console.error
    })
  })
}

export default log
