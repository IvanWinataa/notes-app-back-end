require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError'); // ← Tambahkan ini

const init = async () => {
  const notesService = new NotesService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  // Middleware untuk menangani error response
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Jika error berasal dari ClientError (error buatan sendiri)
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // Jika bukan error dari Hapi atau Boom
    if (!response.isBoom) {
      return h.continue;
    }

    // Tangani error server (500, dsb)
    const newResponse = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    newResponse.code(500);
    return newResponse;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
