import {createContainer, InjectionModeType} from 'awilix'
import {FastifyInstance} from 'fastify'
import {Cradle, DiContainer} from './index.js'

export const defaultContainer = (injectionMode: InjectionModeType) =>
	createContainer<Cradle>({
		injectionMode,
	})

export function setupDiDecorator(fastify: FastifyInstance, diContainer: DiContainer) {
	if (fastify.diContainer) {
		fastify.log.warn('Fastify awilix plugin already decorated')
	} else {
		decorateFastify(fastify, diContainer)
	}
}

const decorateFastify = (fastify: FastifyInstance, diContainer: DiContainer) => {
	fastify.decorate('diContainer', diContainer)
	fastify.decorateRequest('diScope', null)

	fastify.addHook('onRequest', (request, reply, done) => {
		request.diScope = fastify.diContainer.createScope()
		done()
	})

	fastify.addHook('onResponse', (request, reply, done) => {
		void request.diScope.dispose().then(() => {
			done()
		})
	})

	fastify.addHook('onClose', (instance, done) => {
		void instance.diContainer.dispose().then(() => {
			done()
		})
	})
}
