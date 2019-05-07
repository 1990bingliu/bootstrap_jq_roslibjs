var io_define = new Array();
var CNC_IDS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
var IP = '192.168.1.205:9090';
var Timer;


io_define['in'] = new Array();
io_define['in']=[
{'name':'bit0','show_name':'急停'},
{'name':'bit1','show_name':'在线/离线'},
{'name':'bit2','show_name':'启动'},
{'name':'bit3','show_name':'停止'},
{'name':'bit4','show_name':'气源气压检测'},
{'name':'bit5','show_name':'电气插座对接完成'},
{'name':'bit6','show_name':'安全门左退限'},
{'name':'bit7','show_name':'安全门右退限'},
{'name':'bit8','show_name':'安全门进限'},
{'name':'bit9','show_name':'无'},
{'name':'bit10','show_name':'CNC故障'},
{'name':'bit11','show_name':'CNC运行'},
{'name':'bit12','show_name':'CNC待机'},
{'name':'bit13','show_name':'CNC--预留'},
{'name':'bit14','show_name':'CNC完成'},
{'name':'bit15','show_name':'无'},
];

io_define['out'] = new Array();
io_define['out']=[
{'name':'bit0','show_name':'已启动'},
{'name':'bit1','show_name':'安全门开'},
{'name':'bit2','show_name':'吹气清洁'},
{'name':'bit3','show_name':'无'},
{'name':'bit4','show_name':'破真空'},
{'name':'bit5','show_name':'插座锁紧/松开'},
{'name':'bit6','show_name':'插座气源开/关'},
{'name':'bit7','show_name':'插座电源开关'},
{'name':'bit8','show_name':'破真空'},
{'name':'bit9','show_name':'破真空'},
{'name':'bit10','show_name':'CNC安全门已开'},
{'name':'bit11','show_name':'CNC开关灯'},
{'name':'bit12','show_name':'CNC禁止启动'},
{'name':'bit13','show_name':'CNC--预留'},
{'name':'bit14','show_name':'CNC--预留'},
{'name':'bit15','show_name':'MM放料完成'},
];


var test_Data = [
	{
		'in' :[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		'out':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	},
	{
		'in' :[1,0,1,1],
		'out':[1,1,0,1]
	},
	{
		'in' :[1,0,1,1],
		'out':[1,1,1,1]
	},
];



$(document).ready(function(){

  $(".cnc_io_panels").on("click",".btn-out",function(){
　　　　var cnc_id = parseInt($(this).closest('.cnc-panel').attr('cnc_id'));
	var pin_index = parseInt($(this).attr('pin_index'));
	var set_value = $(this).hasClass('btn-default')?true:false;
    setCncIO(cnc_id,pin_index,set_value);
    //alert('set cnc:'+cnc_id+',pin:'+pin_index+',value:'+set_value);
  });

  $(".cnc_io_panels").on("click",".btn-in",function(){
　　　　alert('不可操作！');
  });

  $(document).on("click",".btn-ws-connect",function(){
     IP= $('input.ip-text').val();
     connectRos();
     $(this).addClass('disabled');
  });

  $(document).on("click",".btn-ws-close",function(){
     $('.btn-ws-connect').removeClass('disabled');
  });

  $(document).on("click",".btn-show-hide-name",function(){
	var str = $(this).text();
	var obj = $('.io-name');
	if(str=='Hide I/O Name'){
		obj.hide();
		$(this).html('Show I/O Name');
	}else{
		obj.show();
		$(this).html('Hide I/O Name');
	}
    
  });

  $(document).on("click",".btn-ws-refresh",function(){
    //reFreshCncIo(test_data);
	getCncIO(CNC_IDS);
  });

});



function buildCncHTMLPanels(cncData){

	var cnc_html='';
	//console.log(cncData);
	cncData.forEach(function(value , index , array){
	cnc_html+='<div class="panel panel-default cnc-panel" cnc_id="'+index+'">';
	cnc_html+='<div class="panel-heading"><h3 class="panel-title"><b>CNC-'+index+'</b></h3></div>';
	cnc_html+='<div class="panel-body">';
	cnc_html+='<div class="btn-group btn-group-in">';

	value['in'].forEach(function(value1,index1,array1){
		var disabledCss = value1==1?'btn-info':'btn-default';
        
		cnc_html+='<button class="btn btn-in disabled '+disabledCss+'" pin_index="'+index1+'" title="'+io_define['in'][index1]['show_name']+'" type="button">'+index1+'.<span class="io-name">'+io_define['in'][index1]['show_name']+'</span></button>';
	});

	cnc_html+='</div>';

	cnc_html+='<hr>';

	cnc_html+='<div class="btn-group btn-group-out">';
	value['out'].forEach(function(value2,index2,array2){
		var disabledCss = value2==1?'btn-success':'btn-default';
        
	    cnc_html+='<button class="btn btn-out '+disabledCss+'" pin_index="'+index2+'" title="'+io_define['out'][index2]['name']+'" type="button">'+index2+'.<span class="io-name">'+io_define['out'][index2]['show_name']+'</span></button>';
	});
	cnc_html+='</div>';


	cnc_html+='</div>';
	cnc_html+='</div>';


	});

	$('.cnc_io_panels').html(cnc_html);

}

function reFreshCncIo(cncData){

	 $(".cnc-panel").each(function(index,e){
		$(this).find('.btn-group-in .btn-in').each(function(i1,e1){
				
				var css = cncData[index]['in'][i1]==1?'btn-info':'btn-default';
				$(e1).removeClass();
				$(e1).addClass('btn btn-in disabled');
				$(e1).addClass(css);
		});
		$(this).find('.btn-group-out .btn-out').each(function(i2,e2){
				var css = cncData[index]['out'][i2]==1?'btn-success':'btn-default';
				$(e2).removeClass();
				$(e2).addClass('btn btn-out');
				$(e2).addClass(css);
		});
	});
}


function showMsg(cssType,msg){
	var msgObj = $('.cnc_msg_alert');
	msgObj.hide();

	msgObj.removeClass();
	msgObj.addClass('alert cnc_msg_alert alert-'+cssType);

	msgObj.html(msg);
	msgObj.fadeIn();
}


buildCncHTMLPanels(test_Data);
