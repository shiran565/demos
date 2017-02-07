var APP_CACHE={};
/*调用客户端的总接口，funName-java执行的方法名，info-java方法的参数*/	
function invokeLocal(funName,info,e){
	if(!window.AppWebClient||!window.AppWebClient.invokeLocal){
		return;
	}
	if(e&&e.stopPropagation){
		e.stopPropagation();
	}
	if(typeof info=="object"){
		if(!info["webErrorCatch"]){
			info.webErrorCatch="callback";
		}
		if(!info["localErrorCatch"]){
			info.localErrorCatch="true";
		}
		info=JSON.stringify(info);
	}
	return window.AppWebClient.invokeLocal(funName,info);
}
function setGameInfoToCache(id,info){
	APP_CACHE["app_id_"+id]=info;
}
function getGameInfoFromCache(id){
	return APP_CACHE["app_id_"+id];
}
function handlerGameInfoList(index,obj,trace){
	var html='<li onclick="goPackageDetail('+obj.id+','+trace.goPackageDetail+',event);">'
		+'<div class="li-left-ico">'
		+'<img src="'+obj.icon+'" alt="">'
		+'</div>'
		+'<div class="li-mid-news">'
		+'<div class="li-app-name">'+obj.name+'</div>'
		+'<div class="li-app-star">'
		+'<div class="li-app-wstar" style="width: '+Math.round(obj.comment)*20+'%""></div>'
		+'</div>';
		if(obj.fitModel == false) {
			html += '<div class="nomatch"><b>!</b>软件不兼容</div>'
		}
		html += '<div class="li-app-sizenum">'
		+'<span class="app-player">'+formatDownloadCount(obj.download)+'人在玩</span> <span class="app-size">/'+obj.type+'/'+(obj.size/1024).toFixed(1)+'MB</span>'
		+'</div>'
		+'</div>'
		+'<div class="li-right-dow">'
		+'<div class="downbtn" onclick="downloadApp('+obj.id+','+trace.downloadApp+',event);" id="'+obj.pkgName+'">下载</div>'
		+'</div>'
		+'</li>';
	$(".app-ul").append(html);
	setGameInfoToCache(obj.id,obj);
}
function loadImage(url, callback) {  
    var img = new Image(); 
    img.src = url;  
    if(img.complete) {
        callback.call(img);  
        return;
    }  
    img.onload = function () { 
        callback.call(img);
    }; 
}; 

	function getPackageDetailJsonData(id,trace){
		var jsonObj={info:{appInfo:getGameInfoFromCache(id),statistic:{trace:trace}}};
		return jsonObj;
	}
	
	function getPackageDownloadJsonData(id,trace){
		var jsonObj={info:{appInfo:getGameInfoFromCache(id),statistic:{trace:trace}}};
		return jsonObj;
	}
	
	function getPackagesJsonData(){
		var packages =[];
		for(var key in APP_CACHE){
			var cache_value=APP_CACHE[key];
			var mypackage={id:cache_value["id"],pkgName:cache_value["pkgName"],versonCode:cache_value["versonCode"],versonName:cache_value["versonName"]};
			packages.push(mypackage);
		}
		var jsonObj={info:{value:packages}};
		return jsonObj;
	}
	
	function getToastJsonData(str){
		var info={info:{toast:str}};
		return info;
	}
	
	function getNoFunctionJsonData(webStr,localStr){
		var info={info:{},webErrorCatch:webStr,localErrorCatch:localStr};
		return info;

	}
	function addSign(obj){
		if(obj==null){
			obj={};
		}
		var status=$.cookie("status");
		obj.logged=(status=="1");
		obj.token=$.cookie("r");
		obj.openid=$.cookie("n");
		obj.uuid=$.cookie("q");
		obj.username=$.cookie("p");
		var sign=$.cookie("sign");
		if(!obj.sign&&sign){
			obj.sign=sign;
		}
		return obj;
	}
	function addOtherMsg(obj){
		if(obj==null){
			obj={};
		}
		obj.appVersion=$.cookie("app_version");
		obj.model=$.cookie("model");
		obj.elapsedtime=$.cookie("elapsedtime");
		obj.cs=$.cookie("cs");
		obj.imei=$.cookie("imei");
		obj.av = $.cookie("av");
		return obj;
	}
	function doAjax(url,params,fun){
		$.ajax({
			url : url,
			cache:false,
			type : "POST",
			dataType : "json",
			data:params,
			success : function(data) {
				fun(data);
			},
			error : function() {
				webToastShow("小怪兽把你的网络吃掉了,请再试一次吧!");
				$(".load_wrp").hide();
			}
		});
	}
	function formatDownloadCount(count){
		var countStr="";
		if(count>100&&count<10000){
			var tmp=count;
			for(var i=10;i<10000;i*=10){
				var n= Math.floor(tmp/i);
				if(n<10){
					countStr=n*i+"";
					break;
				}
			}
		}else if(count>=10000){
			countStr= Math.floor(count/10000)+"万";
		}else{
			countStr=count+"";
		}
		return countStr;
	}
	/*调用客户端没有的方法*/
	function noFunction(webStr,localStr){
		var info = getNoFunctionJsonData(webStr,localStr);
		invokeLocal("noFunction",info);
	}
		
	/*调用toast提示*/
	function webToastShow(str){
		var info = getToastJsonData(str);
		invokeLocal("webToastShow",info);
	}
	
	/*下载应用*/
	function downloadApp(id,trace,e){
		var appInfo = getPackageDownloadJsonData(id,trace);
		invokeLocal("downloadApp", appInfo,e);
	}
   /*查看应用详情*/
    function goPackageDetail(id,trace,e){
		var appInfo = getPackageDetailJsonData(id,trace);
		invokeLocal("goPackageDetail", appInfo,e);
     }
    /*发送当前页面所有的包名给客户端*/
	function queryPackageStatus(){
		var packageList = getPackagesJsonData();
		invokeLocal("queryPackageStatus", packageList);
	}
	
	/*跳转登录页面*/
	function login(handle){
		var handleName="";
		if(typeof handle=="string"){
			handleName=handle;
		}
		return invokeLocal("login", handleName);
	}
	 /*手机端登录后的回调方法*/
    function onAccountsUpdate(isLogin){
    	location.reload();
    }
    /*客户端调用的js接口：同步应用下载的状态*/
	function syncDownloadState(packageName, packageStatus){
		var status='下载';
		if(packageStatus==0){
			status='下载';
		}else if(packageStatus==1){
			status='暂停';
		}else if(packageStatus==2){
			status='安装';
		}else if(packageStatus==3){
			status='更新';
		}else if(packageStatus==4){
			status='打开';
		}else if(packageStatus==5){
			status='安装';
		}else if(packageStatus==6){
			status='下载';
		}else if(packageStatus==7){
			status='暂停';
		}else if(packageStatus==8){
			status='继续';
		}else if(packageStatus==9){
			status='继续';
		}else if(packageStatus==10){
			status='继续';
		}else if(packageStatus==11){
			status='安装';
		}else if(packageStatus==20){
			status='安装';
		}else if(packageStatus==21){
			status='安装';
		}else if(packageStatus==500){
			status='暂停';
		}else if(packageStatus==501){
			status='继续';
		}else if(packageStatus==502){
			status='暂停';
		}
		document.getElementById(packageName).innerHTML = status;
	}
	
	/*客户端调用的js接口：回调方法*/
	function callback(){
		var str="对不起，你的版本过低，不能使用该功能";
		webToastShow(str);
	}
	//弹窗居中
	function center(obj){
		var windowWidth = document.documentElement.clientWidth;  
		var windowHeight = document.documentElement.clientHeight;  
		var popupHeight = $(obj).height();  
		var popupWidth = $(obj).width();   
		$(obj).css({  
	    	"position": "absolute",  
	    	"top": (windowHeight-popupHeight)/2+$(document).scrollTop(),  
	    	"left": (windowWidth-popupWidth)/2  
	 	}); 
	}
	//弹窗显示
	function showDiv(obj){
	 	$(obj).show();
	 	center(obj);
	 	var scrolltop = $(document).height(); 
    	$(".black_overlay").css("height",scrolltop);
	 	$(".black_overlay").show();
	 	$(window).scroll(function(){
	  		center(obj);
	 	});
	 	$(window).resize(function(){
	  	center(obj);
	 	});
	}
