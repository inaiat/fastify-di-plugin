# fastify-di-plugin

A dependency injection plugin for fastify framework, using [awilix](https://github.com/jeffijoe/awilix)

Motivation: I really wanted use [fastify-awilix](https://github.com/fastify/fastify-awilix) but this plugin make things statics. So, basically, this plugin can be used without problem with parallel tests and so on. 

## Getting started

```bash
yarn add @inaiat/fastify-di-plugin awilix
```

Next, set up the plugin:
```ts
import { fastifyAwilixPlugin } from '@inaiat/fastify-di-plugin'
```

Next, set up the plugin:
```ts
declare module '@inaiat/fastify-di-plugin' {
  interface Cradle {
    dateService: Date
    printDate: string
  }
}

const dateService = () => new Date();
const printService = ({dateService: Date}) => dateService().toDateString()

fastify.register(fastifyDiPlugin, {
      module: {
        dateService: asFunction(dateService).singleton(),
        printDate: asFunction(printService).singleton()
}})

server.get(
      '/status',
      async (request) => {
        const cradle = request.diScope.cradle
        return cradle.printDate
      }
    )
    
