const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, data)=>{
    if (err) {
      console.log(err);
    } else {
      name = exports.dataDir + '/' + data + '.txt';
      //console.log("data", data,"text", text, "name", name,"typeof name", typeof name);
      fs.writeFile(name, text, (err)=>{
        if (err) {
          throw err;
        } else {
          let todo = {id: data, text};
          callback(null, todo);
        }
      });
    }
  });
};

const readDirAsync = Promise.promisify(fs.readDir);
const readFileAsync = Promise.promisify(fs.readFile);
exports.readAll = (callback) => {
  return readDirAsync(exports.dataDir)
    .then((files)=> {
      return files.map( (id) => ({'id': id, 'text': readFileAsync(exports.dataDir + '/' + id + '.txt') }));
    });
  // fs.readdir(exports.dataDir, (err, files)=>{
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     let data = files.map((file)=>{
  //       return {'id': file.split('.')[0], 'text': file.split('.')[0]};
  //     });
  //     callback(null, data);
  //   }
  // });
};

exports.readOne = (id, callback) => {
  exports.readAll((err, files) => {
    if (err) {
      console.log(err);
    } else {
      if (_.some(files, (file)=>{ return file.id === id; }) === false) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        fs.readFile(exports.dataDir + '/' + id + '.txt', (err, data) =>{
          if (err) {
            console.log(err);
          } else {
            callback(null, {'id': id, 'text': data.toString()});
          }
        });
      }
    }
  });
};

exports.readOneAsync = Promise.promisify(exports.readOne);

exports.update = (id, text, callback) => {
  exports.readAll((err, files) => {
    if (err) {
      console.log(err);
    } else {
      if (_.some(files, (file)=>{ return file.id === id; }) === false) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        name = exports.dataDir + '/' + id + '.txt';
        fs.writeFile(name, text, (err)=>{
          if (err) {
            throw err;
          } else {
            let todo = { 'id': id, text };
            callback(null, todo);
          }
        });
      }  
    }      
  });
};


exports.delete = (id, callback) => {
  exports.readAll((err, files) => {
    if (err) {
      console.log(err);
    } else {
      if (_.some(files, (file)=>{ return file.id === id; }) === false) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        fs.unlink(exports.dataDir + '/' + id + '.txt', (err) => {
          if (err) { 
            throw err;
          } else {
            callback();
          }
        });

      }
    }
  });
};
// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
