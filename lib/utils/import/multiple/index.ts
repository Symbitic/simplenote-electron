import { EventEmitter } from 'events';

import EvernoteImporter from '../../../utils/import/evernote';
import SimplenoteImporter from '../../../utils/import/simplenote';
import TextImporter from '../../../utils/import/text-files';

import * as T from '../../../types';

class MultipleImporter extends EventEmitter {
  private addNote;
  private options;
  private textFiles: Array<File>;
  private simplenoteFiles: Array<File>;
  private evernoteFiles: Array<File>;

  constructor(addNote: (note: T.Note) => any, options) {
    super();
    this.addNote = addNote;
    this.options = options;
    this.textFiles = [];
    this.simplenoteFiles = [];
    this.evernoteFiles = [];
  }

  importNotes = (filesArray) => {
    let importedNoteCount = 0;
    let lastFileName = '';

    if (!filesArray) {
      this.emit('status', 'error', 'No files to import.');
      return;
    }

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (i + 1 === filesArray.length) {
        lastFileName = file.name;
      }
      const fileExtension =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;

      if (fileExtension === 'md' || fileExtension === 'txt') {
        this.textFiles.push(file);
      } else if (fileExtension === 'json') {
        this.simplenoteFiles.push(file);
      } else if (fileExtension === 'enex') {
        this.evernoteFiles.push(file);
      }
    }
    let totalImporters = 0;
    let totalComplete = 0;
    if (this.textFiles.length > 0) {
      totalImporters++;
    }
    if (this.simplenoteFiles.length > 0) {
      totalImporters++;
    }
    if (this.evernoteFiles.length > 0) {
      totalImporters++;
    }

    if (this.textFiles.length > 0) {
      const textImporter = new TextImporter(this.addNote, this.options);
      textImporter.on('status', (type, arg) => {
        if (type === 'complete') {
          totalComplete++;
          importedNoteCount += arg;
          if (totalImporters === totalComplete) {
            this.emit('status', 'complete', importedNoteCount);
          }
        } else {
          this.emit('status', type, arg);
        }
      });
      textImporter.importNotes(this.textFiles);
    }
    if (this.simplenoteFiles.length > 0) {
      const simplenoteImporter = new SimplenoteImporter(
        this.addNote,
        this.options
      );
      simplenoteImporter.on('status', (type, arg) => {
        if (type === 'complete') {
          totalComplete++;
          importedNoteCount += arg;
          if (totalImporters === totalComplete) {
            this.emit('status', 'complete', importedNoteCount);
          }
        } else {
          this.emit('status', type, arg);
        }
      });
      simplenoteImporter.importNotes(this.simplenoteFiles);
    }
    if (this.evernoteFiles.length > 0) {
      const evernoteImporter = new EvernoteImporter(this.addNote, this.options);
      evernoteImporter.on('status', (type, arg) => {
        if (type === 'complete') {
          totalComplete++;
          importedNoteCount += arg;
          if (totalImporters === totalComplete) {
            this.emit('status', 'complete', importedNoteCount);
          }
        } else {
          this.emit('status', type, arg);
        }
      });
      evernoteImporter.importNotes(this.evernoteFiles);
    }
  };
}

export default MultipleImporter;
