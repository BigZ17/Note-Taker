const util = require("util");
const fs = require("fs");

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const uuidv1 = require('uuid/v1');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Store {
  read() {
    return readFileAsync("/Develop/db/db.json", "utf8");
  }

  write(note) {
    return writeFileAsync("/Develop/db/db.json", JSON.stringify(note));
  }

  getNotes() {
    return this.read().then(notes => { // Returning the read notes
      let parsedNotes; // Stiill undifined

      // If notes isn't an array or can't be turned into one, send back a new empty array
      try {
        parsedNotes = [].concat(JSON.parse(notes)); // Put the parsed notes together in a json file
      } catch (err) { // An error deal with it 
        parsedNotes = []; // If not , make it an empty array
      }

      return parsedNotes;
    });
  }

  addNote(note) {
    const { title, text } = note;

    if (!title || !text) {
      throw new Error("Note 'title' and 'text' cannot be blank");
    }

    // Add a unique id to the note using uuid package
    const newNote = { title, text, id: uuidv1() };

    // Get all notes, add the new note, write all the updated notes, return the newNote
    return this.getNotes()
      .then(notes => [...notes, newNote])
      .then(updatedNotes => this.write(updatedNotes))
      .then(() => newNote);
  }

  removeNote(id) {
    // Get all notes, remove the note with the given id, write the filtered notes
    return this.getNotes()
      .then(notes => notes.filter(note => note.id !== id))
      .then(filteredNotes => this.write(filteredNotes));
  }
}

module.exports = new Store();