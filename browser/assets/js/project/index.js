
;(function(){

	var advIds = docCookies.hasItem("advIds")?docCookies.getItem("advIds").split("|"):[];

	//加载数据，渲染模板
	$.get("http://192.168.2.234:2505/client/vivo/h5/init.do",null,function(data){	
		$(document.body).prepend(template("j_template", data));


		//隐藏已屏蔽的广告图
		if(advIds.length){
			$.each(advIds,function(i,n){
				if($(".ad-img").attr("adv-id") == n){
					$(".ad-img").parent().detach();
					return false;
				}
			});
		}
		
	});

	//关闭广告图
	$(document).on("tap",".ad-img .icon-close", function(e) {
		var advId = $(this).closest(".ad-img").attr("adv-id");
		var expires = new Date(new Date().getTime()+1000*60*60*24*30);

		advIds.push(advId);
		docCookies.setItem("advIds",advIds.join("|"),expires);
		$(this).closest(".ad-img").parent().detach();
		e.preventDefault();
		return false;
	});
	
}());

//展开更多
$(document).on("touchstart",".category-module i.icon-extend", function(e) {
	$(this).toggleClass("fold");
	$(this).closest(".item").find(".extend").toggle();
	e.preventDefault();
	return false;
});


/****************埋点代码******************/

//背景图
$(document).on("touchend",".banner", function(e) {
	var url = $(this).find("a").length?$(this).find("a").attr("data-href"):"";
	new Image().src = "http://st.browser.vivo.com.cn/smartSpace?cfrom=252&url="+encodeURIComponent(url)+"&title=";
})

//名站
$(document).on("tap",".famous-site a",function(e){
	var url = $(this).attr("data-href");
	var title = $(this).html();
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=253&url="+encodeURIComponent(url)+"&title="+title;
});

//广告图
$(document).on("tap",".ad-img",function(e){
	var nodeName = e.target.nodeName;
	var type = (nodeName === "I")?1:0;
	var url = $(this).find("a").attr("data-href");
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=254&url="+encodeURIComponent(url)+"&type="+type;
});

//文字链接
$(document).on("tap",".text-module a",function(e){
	var type = $.trim($(this).closest(".category-module").find("h2").text());
	var sub = $.trim($(this).closest("li").find("dl").eq(0).find("dt").text());
	var title = $.trim($(this).text());
	var url = $(this).attr("data-href");
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=255&type="+type+"&sub="+sub+"&title="+title+"&url="+encodeURIComponent(url);
});

//图片链接
$(document).on("tap",".img-module a",function(e){
	var type = $.trim($(this).closest(".category-module").find("h2").text());
	var sub = "picture";
	var url = $(this).attr("data-href");
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=255&type="+type+"&sub="+sub+"&url="+encodeURIComponent(url);
});

//图文链接
$(document).on("tap",".img-text-module a",function(e){
	var type = $.trim($(this).closest(".category-module").find("h2").text());
	var sub = "icon";
	var url = $(this).attr("data-href");
	var title = $.trim($(this).text());
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=255&type="+type+"&sub="+sub+"&title="+title+"&url="+encodeURIComponent(url);
});

//爆款链接
$(document).on("tap",".hot-module a",function(e){
	var type = $.trim($(this).closest(".category-module").find("h2").text());
	var sub = "headline";
	var url = $(this).attr("data-href");
	var title = $.trim($(this).text());
	new Image().src ="http://st.browser.vivo.com.cn/smartSpace?cfrom=255&type="+type+"&sub="+sub+"&title="+title+"&url="+encodeURIComponent(url);
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