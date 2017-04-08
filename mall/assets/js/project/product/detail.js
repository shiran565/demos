var prodImage,
	prodInfo, 
	prodSummary, 
	prodEvaluation;
var bus = new Vue();//global event bus，用于处理组件间的数据依赖

//轮播图片逻辑
prodImage = new Vue({
	data: {
		currentIndex: 1,
		imageHost: imageHost,
		imageList: data.normalCommodity.commoditySkuList[0].imageDataInfos
	},
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
prodInfo = new Vue({
	data:{
		commoditySpu:data.normalCommodity.commoditySpu
	}
});

//价格和优惠信息
prodSummary = new Vue({
	data:{
		commoditySpu:data.normalCommodity.commoditySpu,
		commodityGiftList:data.normalCommodity.commodityGiftList,
		userFreepost:data.normalCommodity.userFreepost
	}
});

//已选中
prodSelection = new Vue({
	data:{		
	},
	methods:{
		showPop:function(){
			//展示弹出层
			bus.$emit("showProdSelectionPopup");
		}
	}
});

//属性选择弹层
selectionPop = new Vue({
	data:{
		isShow:false,
		commoditySpu:data.normalCommodity.commoditySpu
	}
})

//用户评论
prodEvaluation = new Vue({
	data:{}
});

//显示属性选择弹窗
bus.$on("showProdSelectionPopup",function(){
	selectionPop.$data.isShow = !selectionPop.$data.isShow;
});

prodImage.$mount("#j_prodImageSlider");
prodInfo.$mount("#j_prodInfo");
prodSummary.$mount("#j_prodSummary");
prodSelection.$mount("#j_prodSelection");
selectionPop.$mount("#j_selectionPop");