
function FilesQueue(){
    this.queue = []; // array of files
}

FilesQueue.prototype.addFile = function(file){
    
    return this.queue.push(file);
}

module.exports = FilesQueue;
