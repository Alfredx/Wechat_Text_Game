var wechat = require('wechat');
var List = wechat.List;
var crypto = require('crypto');
var wechatToken = 'alfredwechattoken';
var roots = null;

var checkSignature = function(req){
	var arr = new Array();
	arr[0] = wechatToken;
	arr[1] = req.query.nonce;
	arr[2] = req.query.timestamp;
	arr.sort();
	var shasum = crypto.createHash('sha1');
	shasum.update(arr.join(''));
	if(shasum.digest('hex') == req.query.signature){
		return true;
	}
	else{
		return false;
	}
};

List.add('listtest',[
	['this text contains no reply!',function(info,req,res){}],
	['reply {a} to see A',function(info,req,res){
		res.wait('listtest');
	}],
	['reply {b} to see B',function(info,req,res){
		res.nowait('BBBBBBB');
	}],
	['reply {c} to see C',function(info,req,res){
		res.nowait('CCCCCCC');
	}]
]);

var addNodeToList = function(node, name){
	var content = [];
	content.push([node.lines,function(info,req,res){}]);
	for(var i in node.selections){
		char a = 'a';
		content.push(['回复 {'+(a+i)+'} :'+node.selections[i].lines,function(info,req,res){
			res.wait(node.selections[i].selections[0].lines+name);
		}]);
		console.log('\t'+node.selections[i].selections[0].lines+name)
	}
	console.log(content);
	List.add(node.lines+name,content);
};

var SearchNode = function(node,name){
	if (node.type == 'end'){
		List.add(node.lines+name,[
			[node.lines+'\n--> ends <--',function(info,req,res){
				res.nowait();
			}]
		]);
		return;
	}
	else if(node.type == 'branch'){
		SearchNode(node.selections[0],name);
	}
	else{
		addNodeToList(node,name);
		for(var i in node.selections){
			SearchNode(node.selections[i],name);
		}
	}
};

var parseRoots = function(){
	for (var name in roots){
		root = roots[name];
		SearchNode(root.entry[0],name);
	};
	console.log('wechat parse done');
};

exports.handler = wechat(wechatToken,wechat.text(function(info,req,res,next){
	res.wait('startwechattest');
}));

exports.render = function(req, res) {
	if (checkSignature(req)) {
		res.send(200, req.query.echostr);
	};
};

exports.setRoots = function(r){
	roots = r;
};

exports.onLoaderUpdate = function() {
	parseRoots();
};