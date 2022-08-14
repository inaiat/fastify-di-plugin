import {fastify} from 'fastify'

export const getTestServer = () => {
	const server = fastify()

	server.setErrorHandler((error, request, reply) => {
		console.error(error)
		void reply.status(500)
		void reply.send(error)
	})
	return server
}

export const getRegisteredTestServer = () => {
	const server = getTestServer()
	return {server}
}

export const getConfiguredTestServer = (
	name = 'test',
) => {
	const {server} = getRegisteredTestServer()
	return {server}
}

