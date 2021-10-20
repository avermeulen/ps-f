const tf = window.tf;
var model = model|| (function(){
    var _args = {}; // private
	var toRet;
    return {
        
		
		tokenize : function(sen, voc) {		
			let seq = [];
			let vocab = voc;
			let sentence = sen;
			console.log(sen);
			console.log(voc);
			//let sentence = "need help asap";
			let samArr = sentence.split(" ");;
			//console.log(samArr);
			
			for (let i = 0; i < samArr.length; i++) {
				if(vocab[samArr[i]] != undefined){
				seq.push(vocab[samArr[i]]);
				}else{
				seq.push(vocab["<OOV>"]);
				}
				//console.log(seq);
			}
			let padding = 280 - seq.length;
			for (let i = 0; i < padding; i++) {
			seq.push(0);
			}	
			toRet = seq;
			console.log(toRet);
			return (toRet);
		},
        
		
		
        predict : async function(Args) {
        const sequence = Args;
		try {
		const model1 = await  tf.loadLayersModel('server/saved_model_uly/model.json');
		toRet =  await model1.predict(tf.tensor2d(sequence,[1,280]));
		} catch(e) {
			console.log(e);
		}
		console.log(toRet);
		return (toRet);
        }
    };
}());