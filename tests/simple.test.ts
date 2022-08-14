import {asFunction, InjectionMode} from 'awilix'
import test from 'ava'
import {FastifyDiAwilix} from '../src/fastify-di-plugin.js'
import {getConfiguredTestServer} from './helpers/helpers.js'

declare module '../src/index' {
	interface Cradle {
		dateService: Date;
		printDate: string;
	}
}

test('shoud d.i. and use printService on request', async t => {
	const dateService = () => new Date()
	const printService = ({dateService: Date}) => dateService().toDateString()

	const {server} = getConfiguredTestServer()

	const container = new FastifyDiAwilix(server)

	container.register({
		dateService: asFunction(dateService).singleton(),
		printDate: asFunction(printService).singleton(),
	})

	server.get(
		'/status',
		async request => {
			const {cradle} = request.diScope
			return cradle.printDate
		},
	)

	const login = await server.inject({
		method: 'GET',
		url: '/status',
	})

	t.is(server.diContainer.options.injectionMode, InjectionMode.PROXY)
	t.is(login.statusCode, 200)
})

test('shoud d.i. di', async t => {
	const dateService = () => new Date()
	const printService = ({dateService: Date}) => dateService().toDateString()

	const {server} = getConfiguredTestServer()

	const container = new FastifyDiAwilix(server)

	container.register({
		dateService: asFunction(dateService).singleton(),
		printDate: asFunction(printService).singleton(),
	})

	server.get(
		'/status',
		async request => {
			const {cradle} = request.diScope
			return cradle.printDate
		},
	)

	const login = await server.inject({
		method: 'GET',
		url: '/status',
	})

	t.is(server.diContainer.options.injectionMode, InjectionMode.PROXY)
	t.is(login.statusCode, 200)
})

