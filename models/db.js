// TODOS: update entry in DB if file info has changed
const sqlite3 = require('sqlite3').verbose();
const mime    = require('mime');
const fs      = require('fs');

const Queue   = require('./queue');
const File    = require('./file');

const dbPath = './test.db';
const db = new sqlite3.Database(dbPath);
const filePath = './';


function makeSharedFile(file, stats){
    var fullPath = filePath + file;
    var fileType = mime.lookup(file);
    
    // stack overflow: 'convert JS date time to MySQL datetime'
    var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 

    return new File(file, fileType, stats.size, fullPath, date);
}

function readDir(path){
    // consumes a path, produces a promise
    return new Promise(function(succeed, fail){
        
        fs.readdir(path, function(err, files){
            
            if(err) fail(new Error('failed inside fs.readdir'));
            
            else succeed(files);
        });
    });
}

function forEachSharedFile(files){
    // consumes array of files, produces a new FilesQueue
    var fq = new Queue();

    files.forEach(function(file){
        var stats = fs.statSync(file);
        
        if(stats.isDirectory()){
            console.log('D...' + file);
        
        } else {
            console.log('F...' + file);
            var newEntry = makeSharedFile(file, stats);
            fq.addFile(newEntry);
        }
    });

    return fq;
}

exports.readInsert = function read_make_insert(path){
    // consumes a path, runs a promise chain that
    // reads the shared directory, makes a FilesQueue, then inserts
    // into the DB
    console.log('\tReading Files in ' + filePath + '\n');
    readDir(path).then(function(files){
        var fq = forEachSharedFile(files);
        
        filesToinsert(fq);
    
    }).catch(function(err){
        console.log('error in read_make_insert: ' + err); 
    });
}

exports.makeTable = function makeTable(readAndInsert){
    // consumes a promise, creates a DB table, produces
    // the promise that reads a directory and inserts read files
    // into a the DB
    console.log('DB does not exist, creating DB...');

    db.run("CREATE TABLE shared_files " +
           "(id INTEGER PRIMARY KEY AUTOINCREMENT, " + 
           "filename TEXT, " + 
           "filetype TEXT, " +
           "filesize INTEGER, " +
           "filepath TEXT, " + 
           "dateadded TEXT)");
   
    return readAndInsert(filePath);
}

function insertIntoDB(dbEntry){
    // consumes dbEntry object and prepares a DB statement 
    var statement = db.prepare(dbEntry.query);

    statement.run(dbEntry.params);
    
    return statement.finalize();
}

function makeDBEntry(file){
    // consumes a file from FilesQueue.queue and produces an object
    // for DB insertion with accompanying parameters
    var dbInsert = {
        query: "INSERT INTO shared_files " +
               "(filename, filetype, filesize, filepath, dateadded) " +
               "VALUES (?, ?, ?, ?, ?)",
        params: [
            file.name, 
            file.type, 
            file.size, 
            file.path, 
            file.date
        ]
    }

    return dbInsert;
}

function filesToinsert(filesQueue){
    // converts files in queue to objects to insert in DB
    // and then inserts them
    console.log('\n\tInserting into DB\n');
    
    return filesQueue.queue.forEach(function(file){
        var dbEntry = makeDBEntry(file);
        
        console.log(dbEntry.params[0]);
        
        insertIntoDB(dbEntry);
    });
}

exports.getDistinctAndDelete = function getDistinctAndDelete(){
    // selects the distinct entries in the DB, then deletes the
    // duplicates of each entry, except for the most recent
    db.all('SELECT DISTINCT filename FROM shared_files', [],
            function(err, rows){
                if(err) return console.log(err);

                rows.forEach(function(current){
                    // use each individual filename and check for newest
                    // entry and delete the rest
                    console.log(current.filename);
                    deleteDuplicate(current.filename);
                });
            });
}

function deleteDuplicate(name){
    // consumes a filename, deletes all duplicate entries except
    // the most recent file
    var query = 'DELETE FROM shared_files ' +
                'WHERE filename = $name ' +
                'AND dateadded < ' +
                '(SELECT dateadded FROM shared_files ' +
                        'WHERE filename = $name ' +
                        'ORDER BY dateadded DESC LIMIT 1)';

    return db.run(query, { $name: name });
}

function entriesToJSON(){
    // opens DB and converts file entries to JSON
    // for use on frontend
    console.log('hello');
}

exports.path = dbPath;
exports.database = db;
exports.filePath = filePath;
