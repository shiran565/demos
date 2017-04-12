var pageSwipe, data_pageSwipe,
	prodImage, data_pageImage,
	prodInfo, data_prodInfo, //基本商品信息
	prodSummary, data_prodSummary, //价格和优惠信息
	latestEvaluation, data_latestEvaluation, //最新评价
	prodSelection, data_prodSelection, //已选中
	selectionPop, data_selectionPop, //属性选择弹窗
	giftListPop, data_giftListPop, //赠品弹窗
	spuSpecinfoList, data_spuSpecinfoList, //参数
	prodEvaluation, data_prodEvaluation, //全部评价
	bus = new Vue(); //global event bus，用于处理组件间的事件代理


// 列表轮播
var pageSwipe = new Swipe(document.querySelector("#j_pageSwipe"), {
	startSlide: 0,
	speed: 400,
	auto: false,
	continuous: false,
	disableScroll: false,
	stopPropagation: false,
	callback: function(index, elem) {
		window.scrollTo(0,0);
		$("#j_prodTabs").find(".header__title__tab__item").removeClass("on").eq(index).addClass("on");
		if(index == 1){
			$("#j_headerProdDetailNav").show();
			$("#header .detail__nav__item").eq(0).click();
		}else{			
			$("#j_headerProdDetailNav").hide();
		}
	}
});

//导航跟随和点击
$("#j_prodTabs .header__title__tab__item").on("click", function() {
	pageSwipe.slide($(this).index());
});

//轮播图片逻辑
data_prodImage = {
	currentIndex: 1,
	imageHost: imageHost,
	imageList: data.normalCommodity.commoditySkuList[0].imageDataInfos
}

prodImage = new Vue({
	data: data_prodImage,
	mounted: function() {
		var that = this;
		//注意把上一次的轮播撤销，防止错乱
		if (this.imageSwipe) {
			this.imageSwipe.kill();
		}
		// 列表轮播
		this.imageSwipe = new Swipe($(this.$el).find('.swipe')[0], {
			startSlide: 0,
			speed: 400,
			auto: 3000,
			continuous: true,
			disableScroll: false,
			stopPropagation: true,
			callback: function(index, elem) {
				that.currentIndex = index % that.imageList.length + 1;
			}
		});
	}
});

//基本商品信息
data_prodInfo = {
	commoditySpu: data.normalCommodity.commoditySpu
}

prodInfo = new Vue({
	data: data_prodInfo
});

//价格和优惠信息
data_prodSummary = {
	giftTotalPrice: data.normalCommodity.giftTotalPrice,
	commoditySpu: data.normalCommodity.commoditySpu,
	commodityGiftList: data.normalCommodity.commodityGiftList,
	userFreepost: data.normalCommodity.userFreepost
}

prodSummary = new Vue({
	data: data_prodSummary,
	methods: {
		/**
		 * 点击显示赠品列表
		 * @return {[type]} [description]
		 */
		showGiftList: function() {
			bus.$emit("showGiftListPopup");
		}
	}
});

//赠品弹窗
data_giftListPop = {
	isShow: false,
	imageHost: imageHost,
	commodityGiftList: data.normalCommodity.commodityGiftList
}

giftListPop = new Vue({
	el: "#j_giftListPop",
	data: data_giftListPop,
	methods: {
		hide: function() {
			this.isShow = false;
		}
	}
});

//已选中
data_prodSelection = {}
prodSelection = new Vue({
	data: data_prodSelection,
	methods: {
		showPop: function() {
			//展示弹出层
			bus.$emit("showProdSelectionPopup");
		}
	}
});

//属性选择弹层
data_selectionPop = {
	isShow: false,
	normalCommodity: data.normalCommodity,
	phoneCapacities:data.phoneCapacities, //容量制式
	productSuiteInfos:data.productSuiteInfos, //套餐
}

selectionPop = new Vue({
	data: data_selectionPop
});

//最新评论评论
data_latestEvaluation = {
	imageHost:imageHost,
	remarkCount: 599,
	remarkList: remarkJson.data
}

latestEvaluation = new Vue({
	el:"#j_latestProdEvaluation",
	data: data_latestEvaluation,
	methods:{
		/**
		 * 查看所有评论
		 * @return {[type]} [description]
		 */
		viewAll:function(){
			bus.$emit("viewAllEvaluations");
		}
	}
});

//参数列表
spuSpecinfoList = new Vue({
	el: "#j_commoditySpuSpecinfoList",
	data: {
		spuSpecinfoList: data.normalCommodity.commoditySpuSpecinfoList
	}
});

//花呗分期
huabeiInstallment = new Vue({
	el:"#j_huabeiInstallment",
	data:{
		
	}
})

//全部评论
data_prodEvaluation = {
	imageHost:imageHost,
	remarkInfo:prodEvaluations.data
}

prodEvaluation = new Vue({
	el:"#j_prodEvaluation",
	data:data_prodEvaluation
})

//跨组件事件代理
//显示属性选择弹窗
bus.$on("showProdSelectionPopup", function() {
	selectionPop.$data.isShow = !selectionPop.$data.isShow;
});

//显示赠品列表
bus.$on("showGiftListPopup", function() {
	giftListPop.$data.isShow = !selectionPop.$data.isShow;
});

//查看更多评价
bus.$on("viewAllEvaluations",function(){
	pageSwipe.slide(2);
});

prodImage.$mount("#j_prodImageSlider");
prodInfo.$mount("#j_prodInfo");
prodSummary.$mount("#j_prodSummary");
prodSelection.$mount("#j_prodSelection");
selectionPop.$mount("#j_selectionPop");

$(function(){
	$("#header").on("click",".detail__nav__item",function(){
		$(this).addClass("on").siblings().removeClass("on");
		$("#j_detailTabList .detail__tab").eq($(this).index()).show().siblings().hide();
	});
});
