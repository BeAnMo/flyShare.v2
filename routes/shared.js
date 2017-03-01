const express = require('express');
const multer  = require('multer');
const fs      = require('fs');

const File    = require('../models/file');

var upload = multer({ dest: '../../downloads' });
var router = express.Router();

router.use(function(req, res, next){
    console.log('\n==  Routing To  ==> shared');

    next();
});

router.get('/', function(req, res, next){
    console.log('++ Getting From ++> shared');

    res.json({ test: 'Welcome to the index page!' });
});

router.post('/', upload.single('file'), function(req, res, next){
    console.log('++  Posting In  ++> shared');

    var tempPath = req.file.path;
    var targetPath = 'downloads/' + req.file.originalname;

    res.set('Content-Type', req.file.mimetype);
    res.status(200); 
    
    fs.rename(tempPath, targetPath, function(err){
        if(err) return console.log(err);

        return console.log('File created: ' + targetPath);
    });

    var newFile = new File(req.file.originalname,
                           req.file.mimetype,
                           req.file.size,
                           'downloads/' + req.file.originalname,
                           new Date());

    res.end();
});

module.exports = router;
