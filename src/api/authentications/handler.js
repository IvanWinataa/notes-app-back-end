const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    // bind context untuk this
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  // Handler Login (POST /authentications)
  async postAuthenticationHandler(request, h) {
    // 1. Validasi payload
    this._validator.validatePostAuthenticationPayload(request.payload);

    // 2. Ambil username & password dari payload
    const { username, password } = request.payload;

    // 3. Verifikasi kredensial
    const id = await this._usersService.verifyUserCredential(username, password);

    // 4. Generate access token dan refresh token
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    // 5. Simpan refresh token di database
    await this._authenticationsService.addRefreshToken(refreshToken);

    // 6. Respons sukses (201)
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  // Handler Refresh Access Token (PUT /authentications)
  async putAuthenticationHandler(request, h) {
    // 1. Validasi payload
    this._validator.validatePutAuthenticationPayload(request.payload);

    // 2. Ambil refreshToken dari payload
    const { refreshToken } = request.payload;

    // 3. Verifikasi refreshToken di database
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // 4. Verifikasi refreshToken signature JWT → dapatkan id user
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    // 5. Buat access token baru
    const accessToken = this._tokenManager.generateAccessToken({ id });

    // 6. Kembalikan token
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  // Handler Logout / delete token (DELETE /authentications)
  async deleteAuthenticationHandler(request, h) {
    // 1. Validasi payload
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    // 2. Ambil refreshToken dari payload
    const { refreshToken } = request.payload;

    // 3. Pastikan refreshToken ada di database
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // 4. Hapus refreshToken
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    // 5. Berikan respons sukses
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
