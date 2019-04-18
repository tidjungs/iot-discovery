async function route(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { 'message': 'May the force be with you.' }
  })
}

module.exports = route