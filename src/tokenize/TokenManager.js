const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),

  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  verifyRefreshToken: (refreshToken) => {
    try {
      // Decode token menjadi artifacts
      const artifacts = Jwt.token.decode(refreshToken);

      // Verifikasi signature token menggunakan REFRESH_TOKEN_KEY
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);

      // Ambil payload dari artifacts
      const { payload } = artifacts.decoded;

      // Kembalikan payload
      return payload;
    } catch (error) {
      // Jika token rusak / key salah / expired --> error
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
