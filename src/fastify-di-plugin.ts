import {FastifyInstance, FastifyPluginCallback} from 'fastify'
import fp from 'fastify-plugin'
import {InjectionModeType} from 'awilix'
import {defaultContainer, setupDiDecorator} from './plugin-helper.js'
import {FastifyDiOptions} from './types.js'
import {DiContainer, DiModule} from './index.js'

const defaultInjectionMode: InjectionModeType = 'PROXY'

export class FastifyDiAwilix {
  constructor(
    readonly fastify: FastifyInstance,
    readonly injectionMode: InjectionModeType = defaultInjectionMode,
    readonly container: DiContainer = defaultContainer(injectionMode),
  ) {
    setupDiDecorator(fastify, container)
  }

  public register(module: DiModule): void {
    this.fastify.diContainer.register(module)
  }
}

export const fastifyDiPlugin: FastifyPluginCallback<FastifyDiOptions> = (fastify, options, done) => {
  const fastifyAwilix = new FastifyDiAwilix(fastify, options.injectionMode ?? defaultInjectionMode, options.container)
  fastifyAwilix.register(options.module)
  done()
}

export default fp(fastifyDiPlugin, {fastify: '4.x', name: 'fast-di-plugin'})
