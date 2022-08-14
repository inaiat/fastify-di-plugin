
import {asFunction, InjectionMode} from 'awilix'
import test from 'ava'
import {DiModule, fastifyDiPlugin} from '../src/index.js'
import {getConfiguredTestServer} from './helpers/helpers.js'

enum Colors {
	RED, BLUE, GREEN,
}

declare module '../src' {
	interface Cradle {
		dateService: Date;
		printDate: string;
	}
}

declare module '../src' {
	interface Cradle {
		colorService: Colors;
		printColor: string;
	}
}

test('shoud d.i. and two plugin works with printService and PrintColor', async t => {
	const dateService = () => new Date()
	const printService = (dateService: Date) => dateService.toISOString()
	const colorService = () => Colors.GREEN
	const printColor = (colorService: Colors) => colorService.toString()

	const {server} = getConfiguredTestServer()

	await server.register(fastifyDiPlugin, {
		module: {
			dateService: asFunction(dateService).singleton(),
			printDate: asFunction(printService).singleton(),
		},
		injectionMode: 'CLASSIC',
	})

	await server.register(fastifyDiPlugin, {
		module: {
			colorService: asFunction(colorService).singleton(),
			printColor: asFunction(printColor).singleton(),
		},
		injectionMode: 'CLASSIC',
	})

	server.get(
		'/date',
		async request => {
			const {cradle} = request.diScope
			return cradle.printDate
		},
	)

	server.get(
		'/color',
		async request => {
			const {cradle} = request.diScope
			return cradle.printColor
		},
	)

	const date = await server.inject({
		method: 'GET',
		url: '/date',
	})
	t.is(date.statusCode, 200)

	const color = await server.inject({
		method: 'GET',
		url: '/color',
	})
	t.is(color.statusCode, 200)
	t.is(color.body, '2')

	await server.close()
})

test('di container must be ephemeral', async t => {
	const dateService = () => new Date()
	const printService = ({dateService: Date}) => dateService().toDateString()
	const colorService = () => Colors.GREEN
	const printColor = (colorService: Colors) => colorService.toString()

	const {server} = getConfiguredTestServer()

	const diModule: DiModule = {
		dateService: asFunction(dateService).singleton(),
		printDate: asFunction(printService).singleton(),
	}
	await server.register(fastifyDiPlugin, {
		module: diModule,
		injectionMode: 'PROXY',
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

	const server2 = getConfiguredTestServer().server

	const diModule2: DiModule = {
		colorService: asFunction(colorService).singleton(),
		printColor: asFunction(printColor).singleton(),
	}
	await server2.register(fastifyDiPlugin, {
		module: diModule2,
		injectionMode: 'CLASSIC',
	})

	server2.get(
		'/color',
		async request => {
			const {cradle} = request.diScope
			return cradle.printColor
		},
	)

	const color = await server2.inject({
		method: 'GET',
		url: '/color',
	})

	t.is(server.diContainer.options.injectionMode, InjectionMode.PROXY)
	t.is(login.statusCode, 200)
	t.is(login.body, new Date().toDateString())
	t.deepEqual(server.diContainer.registrations, diModule)

	t.is(color.statusCode, 200)
	t.is(color.body, '2')
	t.is(server2.diContainer.options.injectionMode, InjectionMode.CLASSIC)
	t.deepEqual(server2.diContainer.registrations, diModule2)
})
