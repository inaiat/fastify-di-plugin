import {AwilixContainer, InjectionModeType, NameAndRegistrationPair} from 'awilix'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Cradle {}

export type DiContainer = AwilixContainer<Cradle>

export type DiModule = NameAndRegistrationPair<Cradle>

export type FastifyDiOptions = {
	module: DiModule;
	injectionMode?: InjectionModeType;
	container?: DiContainer;
}

declare module 'fastify' {
	interface FastifyRequest {
		diScope: DiContainer;
	}

	interface FastifyInstance {
		diContainer: DiContainer;
	}
}
