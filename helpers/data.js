const fs      = require("fs");
const path    = require("path");
const util    = require("util");
const helpers = require("./helpers");
const config  = require("./../config");

var lib = {
    baseDir: config.DB_ROOT,
    create: function(dir, filename, data, callback) {
        fs.open(path.join(lib.baseDir, dir, filename + ".json"), "wx", function(err, fd) {
            if (!err && fd) {
                let strData = JSON.stringify(data);
                fs.write(fd, strData, function(err) {
                    if (!err) {
                        fs.close(fd, function(err) {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error closing file");
                            }
                        });
                    } else {
                        callback("Error writing to file");
                    }
                });

            } else {
                callback("could not create new file, it may already exist " + err);
            }
        });
    },

    read: function(dir, file, callback) {
        fs.readFile(path.join(lib.baseDir, dir, file + ".json"), "utf8", function(err, data) {
            if (!err && data) {
                let parsedData = helpers.parseJsonToObject(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        });
    },

    update: function(dir, file, data, callback) {
        fs.open(path.join(lib.baseDir, dir, file + ".json"), "r+", function(err, fd) {
            if (!err && fd) {
                let strData = JSON.stringify(data);

                fs.truncate(fd, function(err) {
                    if (!err) {
                        fs.write(fd, strData, function(err) {
                            if (!err) {
                                fs.close(fd, function(err) {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback("Fail during closing a file");
                                    }
                                });
                            } else {
                                callback("Err while updating the file");
                            }
                        });
                    } else {
                        callback("Err while truncating a file");
                    }
                });
            } else {
                callback("Could not update a file");
            }
        });
    },

    delete: function(dir, file, callback) {
        fs.unlink(path.join(lib.baseDir, dir, file + ".json"), function(err) {
            if (!err) {
                callback(false);
            } else {
                callback(`Failed removing a file ${err}`);
            }
        });
    }

};

lib.list = function(dir, callback) {
    fs.readdir(path.join(lib.baseDir, dir), function(err, data) {
        if (!err && data && data.length > 0) {
            let trimmed = [];
            data.forEach((filename) => {
                trimmed.push(filename.replace(".json", ""));
            });

            callback(false, trimmed);
        } else {
            callback(err, data);
        }
    });
};

// Promisified version, because I can't look on those callbacks.
let libp = {};

libp.create = util.promisify(lib.create);
libp.read   = util.promisify(lib.read);
libp.update = util.promisify(lib.update);
libp.delete = util.promisify(lib.delete);

module.exports = libp;