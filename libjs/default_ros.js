var ros;
var rosServiceGetIO;
var rosServiceSetIO;
var requestCNCio;

function connectRos(){
  ros = new ROSLIB.Ros({
		url : 'ws://'+IP
		});

  ros.on('connection', function() {
    console.log('Connected to websocket server.');
	showMsg('success','Connecting Success!');
  });

  ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
	showMsg('danger','Connecting Error!');
  });

  ros.on('close', function() {
    console.log('Connection to websocket server closed.');
	showMsg('warning','Close Conncetion!');
  });

  rosServiceGetIO = new ROSLIB.Service({
    ros : ros,
    name : '/cnc_showpick',
    serviceType : 'ethercat_io/ShowPickIO'
  });

  rosServiceSetIO = new ROSLIB.Service({
    ros : ros,
    name : '/cnc_setpick',
    serviceType : 'ethercat_io/SetPickIO'
  });

  buildCncIoPanels(CNC_IDS);
  Timer=window.setInterval(function(){
		getCncIO(CNC_IDS);	
	}, 500);
  //window.clearInterval(Timer);
}


function closeRos(){
	
}



function buildCncIoPanels(cnc_ids){
  requestCNCio = new ROSLIB.ServiceRequest({
    slaves_num : cnc_ids,
  });

  rosServiceGetIO.callService(requestCNCio, function(result) {
  	console.log(result);
	var r = formatCncData(result);
  	buildCncHTMLPanels(r);
  });
}


function getCncIO(cnc_ids){

	rosServiceGetIO.callService(requestCNCio, function(result) {
  		console.log(result);
		var r = formatCncData(result);
  		reFreshCncIo(r);
	});
}

function formatCncData(oldData){
	var rData = new Array();
	oldData['cnc_output'].forEach(function(value,index,array){
		rData[index]={
			'in':new Array(),
			'out':new Array()
		};
		value['enable'].forEach(function(v1,i1,a1){
			rData[index]['in'][i1]=v1;
		});
	});

	oldData['cnc_input'].forEach(function(value,index,array){
		value['enable'].forEach(function(v2,i2,a2){
			rData[index]['out'][i2]=v2;
		});
	});
	return rData;
}

function setCncIO(cnc_id,pin_index,value){

  request = new ROSLIB.ServiceRequest({
    slaves_num : [cnc_id],
	io : [{
		max_size:16,
		pin_num:[pin_index],
		enable:[value]
	}]
  });

  rosServiceSetIO.callService(request, function(result) {
	console.log(result);
	showMsg('success','callService SetCncIO Success!');
  });

}

