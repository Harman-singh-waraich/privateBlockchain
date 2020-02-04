/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		this.hash = '';
		this.time = '';
		this.body = data;
		this.height = 0;
		this.previousHash = '';
	}
}
module.exports.Block = Block;
