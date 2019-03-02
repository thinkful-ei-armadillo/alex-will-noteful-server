/* eslint-disable strict */
const express = require('express');
const logger = require('../logger');
const jsonParser = express.json();
const NotesService = require('./notesService');
const xss = require('xss');

const notesRouter = express.Router();

function sanitizeNote(note) {
  return {
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    folder_id: note.folder_id,
    content: xss(note.content)
  };
}

notesRouter
  .route('/api/notes')
  .get((req, res, next) => {
    const dbInstance = req.app.get('db');
    NotesService.getAllNotes(dbInstance)
      .then(notes => {
        return res.json(notes.map(note => sanitizeNote(note)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const dbInstance = req.app.get('db');
    const { note_name, folder_id, content } = req.body;
    const newNotes = { note_name, folder_id, content };
 
    for(const [key, value] of Object.entries(newNotes)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    NotesService.insertNotes(dbInstance, newNotes)
      .then(note => {
        logger.info(`Created note with id ${note.id}.`);
        res
          .status(201)
          .location(`/note/${note.id}`)
          .json(sanitizeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/api/notes/:noteId')
  .all((req, res, next) => {
    NotesService.getNotesById(req.app.get('db'), req.params.noteId)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${req.params.id} not found`);
          return res.status(404).json({
            error: {message: `Note with id ${req.params.id} not found` }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const dbInstance = req.app.get('db');
    const { noteId } = req.params;
    NotesService.getNotesById(dbInstance, noteId)
      .then(note => {
        return res.json(sanitizeNote(note));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { noteId } = req.params;
    NotesService.deleteNotes(req.app.get('db'), noteId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    // const { note_name, folder_id, content } = req.body;
    // const noteToUpdate = { note_name, folder_id, content };
    // const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    // if (numberOfValues === 0)
    //   return res.status(400).json({
    //     error: {
    //       message: 'Req body must contain either \'note name\', folder_id, \'content\', '
    //     }
    //   });
  });
    
module.exports = notesRouter;
  