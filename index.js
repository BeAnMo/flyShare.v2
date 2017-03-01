
const express = require('express');
const shared  = require('./routes/shared');
const DBM     = require('./models/db');
const fs      = require('fs');

var app = express();

app.use(express.static('static'));
app.use('/shared', shared);
app.use('*', function(req, res){
    res.status(404).send('404: File Not Found');
});

DBM.database.serialize(function(){
    if(!fs.existsSync(DBM.path)){
        return DBM.makeTable(DBM.readInsert);
    } else {
        return DBM.readInsert(DBM.filePath);
    }
});


app.listen(5000, function(){
    console.log('\t**** Running @ http://localhost:5000 ****\n');
});
/*
 * Next steps:
 * - add in Express to make server
 * - build routes:
 *   - GET DB data
 *   - POST file upload to downloads folder
 *   - POST file upload info to DB
 *   - PUT?
 * - work with cURL to make tests for GET/POST
 * - hook frontend to backend API
 * - build interface with Vue/some css theme
 * - look into Electron 
 */
