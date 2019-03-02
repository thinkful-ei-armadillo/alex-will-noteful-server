'use strict';

const NotesService = {
  getAllNotes(db) {
    return db.select('*').from('notes');
  },
  getNotesById(db, id) {
    return db.from('notes').select('*').where('id', id).first();
  },
  insertNotes(db, newNotes) {
    return db.insert(newNotes).into('notes').returning('*').then(rows => rows[0]);
  },
  deleteNotes(db, id) {
    return db('notes').where('id', id).delete();
  },
  updateNotes(db, id, newNotesFields) {
    return db.from('notes').select('*').where('id', id).first().update(newNotesFields).return('*').then(rows => rows[0]);
  }
};

module.exports = NotesService;