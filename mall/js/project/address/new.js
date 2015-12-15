/**
 * Created by Administrator on 2015/11/4.
 */

var submit_disabled=true;

var region = new Region({
    elements: $(".region-item select"),
    targets:$(".region-item span")
});

$(".icon-checkbox").on("tap", function () {
    $(this).hasClass("checked") ? $(this).removeClass("checked") : $(this).addClass("checked");
});

$(".btn-submit").on("tap", function () {
	  if(submit_disabled){
		  return;
	  }
	  $('.btn-submit').removeClass('active');
		submit_disabled=true;
	  var defaultAddr;
	  if($(".icon-checkbox").hasClass("checked")){
		  defaultAddr="true";
	  }else{
		  defaultAddr="false";
	  }

	  $.ajax({
          url: webCtx + "/userAddress/newOrEdit",
          type: "POST",
          data: {
                 "receiverName": $("#receiverName").val(),
        	     "mobilePhone":$("#mobilePhone").val(),
        	     "province":$("#province").val(),
        	     "city":$("#city").val(),
        	     "area":$("#area").val(),
        	     "address":$("#address").val(),
        	     "defaultAddr":defaultAddr	  
          },
          success: function(data){
              if(data.rsCode == 200){
            	  var toast=new Toast({
       			   text:"添加成功",
       			   time:2000
       			   });
       		    toast.show();
       		 setTimeout(function(){ window.location.href=webCtx + "/my/address"; },5000);
                  /*otherManager.dialog("成功", "操作成功！", "success",null, otherManager.refreshPage);*/
              }else if(data.rsCode == 430){
            		$('.btn-submit').addClass('active');
                	submit_disabled=false;
            	  var toast=new Toast({
          			   text:"地址已经超过10个，不能继续添加",
          			   time:2000
          			   });
          		  toast.show();
              }else{
            		$('.btn-submit').addClass('active');
                	submit_disabled=false;
            	  var toast=new Toast({
          			   text:"添加失败",
          			   time:2000
          			   });
          		  toast.show();
              }
          }
      });
});

function validator(){
	var receiverName=$("#receiverName").val();
	var mobilePhone=$("#mobilePhone").val();
	var province=$("#province").val();
    var city=$("#city").val();
	var area=$("#area").val();
	var address=$("#address").val();
	 var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
	 
	 if(receiverName==""||receiverName==null){
		 return "请填写收件人姓名！"
	 }else if(receiverName.length>20){
		 return "收件人姓名小于20个字符!";
	 }
	 
	if(mobilePhone==null||mobilePhone==""){
		return "请输入手机号码！"
	}else if(mobilePhone.length!=11||!mobile.test(mobilePhone)){
		return "请正确填写手机号码！";
	}
	
	if(province=="_NULL_"||province==""){
		return "请选择省份！";
	}
	
	if(city=="_NULL_"||city==""){
		return "请选择市区！";
	}
	
	if(area=="_NULL_"||area==""){
		 return "请选择区域！";
	}
	
	if(address==""||address==null){
		return "请填写详细地址！";
	}else if(address.length>50){
		return "详细地址小于50个字符！"
	}
	return "";
	
}

function monitor(){
	if(validator()!==''){
		$('.btn-submit').removeClass('active');
		submit_disabled=true;
		return;
	}
	$('.btn-submit').addClass('active');
	submit_disabled=false;
}

$('#receiverName,#mobilePhone,#address').on('input',monitor);

$('#area').on('change',monitor);
