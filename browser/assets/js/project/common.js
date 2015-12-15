//展开更多
$(".category-module i.icon-extend").on("touchstart", function(e) {
	$(this).toggleClass("fold");
	$(this).closest(".item").find(".extend").toggle();
	e.preventDefault();
	return false;
});

//关闭广告图
$(".ad-img .icon-close").on("touchstart", function(e) {
	$(this).closest(".ad-img").remove();
	e.preventDefault();
	return false;
});


var data = {"bgData":{"url":"http://192.168.2.234:1399/appstore/browser/newoperate/backgroundimg/2015/12/2015121417291011172466.png"},"starSiteData":[{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015071511435528622293.jpg","name":"pppp","url":"www.hao123.com"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015071611333146129600.png","name":"??","url":"http://i.meituan.com/?nodown&utm_source=waputm_bbkllq&utm_medium=wap"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615364604360265.png","name":"???","url":"http://m.iqiyi.com/"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615365629577510.png","name":"???","url":"http://ai.m.taobao.com/vip/?pid=mm_31535501_3003108_10148105"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015071611234924528721.png","name":"1??","url":"http://union.m.jd.com/click/go.action?to=http%3A%2F%2Fm.jd.com%2F&type=1&unionId=vivobrowser&subunio"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615371565146784.png","name":"??","url":"http://m.soufun.com/"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615372540278032.png","name":"???","url":"http://m.yhd.com?tracker_u=105909216100"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615380100998129.png","name":"???","url":"http://touch.youyuan.com"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615382483746156.png","name":"??","url":"http://m.yiche.com/?WT.mc_id=mvivollq"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615383616093346.png","name":"??","url":"http://m.xiecheng.com/"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015070615384445259879.png","name":"??","url":"http://3g.163.com/touch/"},{"icon":"http://192.168.2.234:1399/appstore/browser/operate/famous/2015/07/2015071509543855989506.jpg","name":"??","url":"http://www.sina.com.cn/?from=sogou"}],"adverImageData":[{"adpicLink":"","id":"274","image":"http://192.168.2.234:1399/appstore/browser/operate/adPictures/2015/12/2015121015175125849282.jpg","name":"test"}],"siteNavigationData":[{"name":"????","subArray":[{"name":"????","url":"http://www.baidu.com","subArray":[{"name":"??test1","url":"http://www.hao123.com"},{"name":"??test2","url":"http://www.hao123.com"},{"name":"??test3","url":"http://www.runoob.com"},{"name":"??test4","url":"http://www.baidu.com"},{"name":"??","url":"http://www.baidu.com"}]}]},{"name":"????test1","subArray":[]},{"name":"????","icon":"/newoperate/navigation/2015/12/2015121417514718305456.png","subArray":[],"imageTextArray":[{"name":"???(??)","icon":"","url":"http://www.baidu.com","type":"5"}]},{"name":"????","icon":"/newoperate/navigation/2015/12/2015121417520868385133.png","subArray":[],"imageTextArray":[{"name":"???(??)","icon":"","url":"http://www.baidu.com","type":"4"}]},{"name":"????","icon":"/newoperate/navigation/2015/12/2015121418234461091396.png","subArray":[],"imageTextArray":[{"name":"???(??)","icon":"/newoperate/navigation/2015/12/2015121409333673918970.jpg","url":"http://www.baidu.com","type":"3"}]}],"initLifeData":[{"name":"Special","imageTextArray":[{"name":"testhao123","url":"http://www.hao123.com","type":"3"}]},{"name":"Local Service","imageTextArray":[{"name":"testhao123","url":"http://www.hao123.com","type":"3"}]},{"name":"Useful Tools","imageTextArray":[{"name":"testhao123","url":"http://www.hao123.com","type":"3"}]}]};


$(document.body).prepend(template("j_template", data));

$.get("http://172.20.199.51:8081/browserWeb/vivo/h5/init.do?model=BBK%20S6T",null,function(data){
	console.log(data);
})