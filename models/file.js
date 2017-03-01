function SharedFile(name, type, size, path, date){
    this.name = name;
    this.type = type;
    this.size = size;
    this.path = path;
    this.date = date;
}

module.exports = SharedFile;
