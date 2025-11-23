const ClientError = require('../../exceptions/ClientError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Binding supaya this tetap merujuk ke instance UsersHandler
    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  // Handler untuk POST /users
  async postUserHandler(request, h) {
    // Validasi payload
    this._validator.validateUserPayload(request.payload);

    // Ambil data user dari payload
    const { username, password, fullname } = request.payload;

    // Masukkan user baru ke database
    const userId = await this._service.addUser({ username, password, fullname });

    // Kembalikan response sukses
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  // Handler untuk GET /users/{id}
  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    // Ambil user dari database berdasarkan ID
    const user = await this._service.getUserById(id);

    // Kembalikan response sukses
    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

module.exports = UsersHandler;
