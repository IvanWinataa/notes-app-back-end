const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    // Membuat pool koneksi ke database PostgreSQL
    this._pool = new Pool();
  }

  // Fungsi menambahkan user baru
  async addUser({ username, password, fullname }) {
    // 1. Pastikan username belum dipakai
    await this.verifyNewUsername(username);

    // 2. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Buat ID user
    const id = `user-${nanoid(16)}`;

    // 4. Query insert
    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    // Jika gagal insert
    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  // Mengecek apakah username sudah digunakan
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }
  }

  // Fungsi mendapatkan user berdasarkan ID
  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    // Jika user tidak ditemukan
    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Mengembalikan user
    return result.rows[0];
  }
}

module.exports = UsersService;



