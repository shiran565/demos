$.get("http://192.168.2.234:2505/client/vivo/h5/init.do",null,function(data){	
	$(document.body).prepend(template("j_template", data));
})


/****************埋点代码******************/

//图文链接
$(document).on("tap","a",function(e){
	var typeobj = {
		"推荐":0,
		"本地服务":1,
		"常用工具":2
	}
	var text = $.trim($(this).closest(".life-module").find("h2").text());
	var type = typeobj[text]||0;
	var url = $(this).attr("data-href");
	var title = $.trim($(this).text());
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=251&type="+type+"&title="+title+"&url="+encodeURIComponent(url);
});


/****************埋点代码 end******************/


//延迟跳转，防止截断埋点请求
$(document).on("tap","a[data-href]",function(){
	var that = this;
	if(!$(this).attr("data-href")){
		return;
	}

	setTimeout(function(){
		location.href = $(that).attr("data-href");
	},200);	
});