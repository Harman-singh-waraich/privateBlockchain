/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key,function(err,value){
              if(err){reject(err)}
              else{
                resolve(value)
              }
            })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
          self.db.put(key,value,function(err){
            if(err){reject(err)  }
            else{
              resolve("added")
            }
          })
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject){
            let i = 0;
            self.db.createReadStream().on('data',(data) =>{
                   i++;
            }).on('error',(err) =>{
              reject(err)
            }).on('close',()=>{
              resolve(i-1)
            })
        });
    }


}

module.exports.LevelSandbox = LevelSandbox;
