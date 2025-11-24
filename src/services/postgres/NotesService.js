const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel } = require('../../utils'); // jika tidak punya, hapus baris ini


class NotesService {
  constructor() {
    this._notes = [];
  }

  addNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      id,
      title,
      body,
      tags,
      createdAt,
      updatedAt,
      owner,
    };

    this._notes.push(newNote);

    const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError("Catatan gagal ditambahkan");
    }

    return id;
  }

  getNotes(owner) {
    const notes = this._notes.filter((note) => note.owner === owner);
    return notes;
  }

  getNoteById(id) {
    const note = this._notes.find((n) => n.id === id);

    if (!note) {
      throw new NotFoundError("Catatan tidak ditemukan");
    }

    return note;
  }

  editNoteById(id, { title, body, tags }) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new NotFoundError("Gagal memperbarui catatan. Id tidak ditemukan");
    }

    const updatedAt = new Date().toISOString();

    this._notes[index] = {
      ...this._notes[index],
      title,
      body,
      tags,
      updatedAt,
    };
  }

  deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new NotFoundError("Catatan gagal dihapus. Id tidak ditemukan");
    }

    this._notes.splice(index, 1);
  }
  async verifyNoteOwner(id, owner) {
    const note = this._notes.find((n) => n.id === id);

    if (!note) {
      throw new NotFoundError("Resource yang Anda minta tidak ditemukan");
    }

    if (note.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = NotesService;
