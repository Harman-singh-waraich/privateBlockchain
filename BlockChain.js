/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
        this.errorLog = []
    }

    // creating genesis block
    generateGenesisBlock(){
         this.bd.getBlocksCount().then((count)=>{
           if(count >0){
             console.log("genesis block already exists")
           }else{
             console.log("creating genesis block")
               const block = new Block.Block("Genesis Block")
               block.height = 0;
               block.time = new Date().getTime().toString().slice(0,-3);
               block.hash = SHA256(JSON.stringify(block)).toString();
               this.bd.addLevelDBData(0,JSON.stringify(block))
           }
         })
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        let self = this;
        return new Promise(function(resolve, reject) {
          self.bd.getBlocksCount().then( (count)=> {
          // console.log(count)
          resolve(count)
          })
        });
    }

    // Add new block
    addBlock(block) {
        let self = this;
        return new Promise(function(resolve, reject) {
          self.bd.getBlocksCount().then((count)=>{

             self.bd.getLevelDBData(count).then((previousblock)=>{
                block.height = count +1;
                block.time = new Date().getTime().toString().slice(0,-3);
                block.previousHash = JSON.parse(previousblock).hash
                block.hash = SHA256(JSON.stringify(block)).toString();
                self.bd.addLevelDBData(block.height,JSON.stringify(block))
                resolve(`added block: ${block.height}`)
             });
          });
        });;

    }

    // Get Block By Height
    getBlock(height) {
        let self = this;
        let promise =  new Promise(function(resolve, reject) {
            self.bd.getLevelDBData(height).then((block)=>{
            resolve(JSON.parse(block))
        });
      });
        return promise
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
       let self = this;
        return new Promise(function(resolve, reject) {
          self.getBlock(height).then((block)=>{
            let blockHash = block.hash;
            block.hash = "";
            //calculating valid hash
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            if(blockHash === validBlockHash){
              resolve(true)
            }else{
              resolve(false)
            }
          });
        });

    }

    // Validate Blockchain
    validateChain() {
      let self = this;
    return new Promise(function(resolve, reject) {
        self.getBlockHeight().then((height)=>{
              let errorLog = [];
              for(var i=0;i <height;i++){
                   self.validateBlock(i).then((valid)=>{
                        if(!valid){errorLog.push(i)}
                   })
             let promise1 = new Promise(function(resolve, reject) {
               self.getBlock(i).then((block)=>{
                 resolve(block)
               })
             });
             let promise2 = new Promise(function(resolve, reject) {
               self.getBlock(i+1).then((p_block)=>{
                 resolve(p_block)
               })
             });
             Promise.all([promise1,promise2]).then((values)=>{
               let blockHash = values[0].hash;
               let previousHash = values[1].previousHash
               if(blockHash != previousHash){
                 errorLog.push(i)
               }
             })
              }
              //waiting for promises to resolve
              setTimeout(function() {
                if(errorLog.length >0){
                  resolve(errorLog)
                }else{
                  resolve(errorLog)
                }
              },500)
        });

      });

}

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            block.body = 'tampered';
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

}

module.exports.Blockchain = Blockchain;

//**********************some tests*************************
//should return block:1
// blockchain.getBlock(1).then((block)=>{
//   console.log(block)
// })

//should return a boolean value
// blockchain.validateBlock(1).then((result)=>{
//   console.log(result);
// })

//should return a false as data is tampered with
// blockchain.getBlock(1).then((block)=>{
//   blockchain._modifyBlock(1,block).then((message)=>{
//     console.log(message)
//     })
//   })

//should return a boolean value
// blockchain.validateChain().then((result)=>{
//   console.log(result)
// })

//should add a block to the chain
// blockchain.addBlock(new Block.Block("test 2"))
