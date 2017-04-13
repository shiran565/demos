$(function(){

	var prodInfo,//商品详情数据大对象
	latestEvaluations,//最近评论
	prodEvaluations,//全部评论
	pageSwipe,//页面级tab页
	v_prodImage, data_pageImage,
	v_prodInfo, data_prodInfo, //基本商品信息
	v_prodSummary, data_prodSummary, //价格和优惠信息
	v_latestEvaluation, data_latestEvaluation, //最新评价
	v_prodSelection, data_prodSelection, //已选中
	v_selectionPop, data_selectionPop, //属性选择弹窗
	v_giftListPop, data_giftListPop, //赠品弹窗
	v_detailTab, data_spuSpecinfoList, //商品详情
	v_prodEvaluation, data_prodEvaluation, //全部评价
	bus = new Vue(); //global event bus，用于处理组件间的事件代理
	var ProdDetail = {
		start:function(){
			this.initPageSwipe();
			this.getProdData($("#j_spuId").val());
			this.getLatestEvaluation($("#j_spuId").val());
			this.getEvaluation($("#j_spuId").val());
			this.handleGlobalBus();
		},
		getProdData:function(spuId){
			var that = this;

			$.ajax({
				type:'get',
				dataType:'json',
				data:{
					spuId:spuId
				},
				url:webCtx+"/product/detail.json",
				success:function(data){
					if(data.retCode == 200){
						prodInfo = data.data
						that.initSpu();
					}
				}
			});
		},

		getLatestEvaluation:function(spuId){
			var that = this

			$.ajax({
				type:'get',
				dataType:'json',
				data:{
					spuId:spuId
				},
				url:webCtx+"/product/latest/remark.json",
				success:function(data){
					if(data.retCode == 200){
						latestEvaluations = data.data
						that.initLatestEvaluation();
					}
				}
			});

		},

		getEvaluation:function(spuId){
			var that = this

			$.ajax({
				type:'get',
				dataType:'json',
				data:{
					spuId:spuId
				},
				url:webCtx+"/product/remark.json",
				success:function(data){
					if(data.retCode == 200){
						prodEvaluations = data.data
						that.initEvaluation();
					}
				}
			});
		},
		initPageSwipe:function(){
			// 整体tab切换效果
			pageSwipe = new Swipe(document.querySelector("#j_pageSwipe"), {
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

			//详情页二级tab切换
			$("#header").on("click",".detail__nav__item",function(){
				$(this).addClass("on").siblings().removeClass("on");
				$("#j_detailTabList .detail__tab").eq($(this).index()).show().siblings().hide();
			});

		},
		initSpu:function(){
			//轮播图片逻辑
			data_prodImage = {
				skuId:'',
				currentIndex: 1,
				imageHost: imageHost,
				commoditySkuList:prodInfo.normalCommodity.commoditySkuList
			}

			v_prodImage = new Vue({
				el:"#j_prodImageSlider",
				data: data_prodImage,
				computed:{
					//当前sku对应的商品图片
					imageList:function(){
						if(this.commoditySkuList){
							for (var i=0;i<this.commoditySkuList.length;i++){
								if(this.skuId){
									if(this.skuId == this.commoditySkuList[i].id){
										return this.commoditySkuList[i].imageDataInfos;
									}
								}else{
									if(this.commoditySkuList[i].defaultChecked == 1 ){
										return this.commoditySkuList[i].imageDataInfos;
									}
								}
							}
						}
					}
				},
				watch:{
					skuId:'init'
				},
				methods:{
					init:function(){
						var that = this;
						this.currentIndex = 1;

						//注意把上一次的轮播撤销，防止错乱
						if (this.imageSwipe) {
							this.imageSwipe.kill();
						}

						//在下次dom更新后重新初始化轮播	
						this.$nextTick(function(){
							// 列表轮播
							that.imageSwipe = new Swipe($(that.$el).find('.swipe')[0], {
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
						});											
					}
				},
				mounted: function() {
					this.init();
				}
			});

			//基本商品信息
			data_prodInfo = {
				commoditySpu: prodInfo.normalCommodity.commoditySpu
			}

			v_prodInfo = new Vue({
				el:"#j_prodInfo",
				data: data_prodInfo
			});

			//价格和优惠信息
			data_prodSummary = {
				giftTotalPrice: prodInfo.normalCommodity.giftTotalPrice,
				commoditySpu: prodInfo.normalCommodity.commoditySpu,
				commodityGiftList: prodInfo.normalCommodity.commodityGiftList,
				userFreepost: prodInfo.normalCommodity.userFreepost
			}

			v_prodSummary = new Vue({
				el:'#j_prodSummary',
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
				commodityGiftList: prodInfo.normalCommodity.commodityGiftList
			}

			v_giftListPop = new Vue({
				el: "#j_giftListPop",
				data: data_giftListPop,
				methods: {
					hide: function() {
						this.isShow = false;
					}
				}
			});

			//已选中属性
			data_prodSelection = {
				netType:'',//制式
				storage:'',//容量
				skuId:'',//颜色
				payType:'',//花呗分期
				service:[],//服务
				number:1,//数量
				canUseHuabei:false,//支持花呗分期
				textList:[]//选中项文本，仅用于界面展示
			}

			v_prodSelection = new Vue({
				el:"#j_prodSelection",
				data: data_prodSelection,
				beforeCreated:function(){

				},
				computed:{
					textList:function(){
						var testList = [];
						if(this.netType){
							testList.push();
						}
					}
				},
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
				imageHost:imageHost,
				spuId:'',
				skuId:'', //颜色
				brokenId:'', //碎屏保
				extendId:'', //延保
				huabeiId:'',
				number:1,
				normalCommodity: prodInfo.normalCommodity,
				phoneCapacities:prodInfo.phoneCapacities, //容量制式
				productSuiteInfos:prodInfo.productSuiteInfos, //套餐
			}

			v_selectionPop = new Vue({
				el:"#j_selectionPop",
				data: data_selectionPop,
				computed:{
					//当前选中的sku
					currentSku:function(){	
						var commoditySkuList = this.normalCommodity.commoditySkuList;						
						if(commoditySkuList){
							for (var i=0;i<commoditySkuList.length;i++){
								if(this.skuId){
									if(this.skuId == commoditySkuList[i].id){
										return commoditySkuList[i];
									}
								}else{
									if(commoditySkuList[i].defaultChecked == 1 ){
										return commoditySkuList[i];
									}
								}
							}
						}
					},
					netTypeName:function(){
						var that = this;
						var netTypeName = "";
						this.phoneCapacities.forEach(function(capacity){
							if(capacity.netType.netTypeCode == that.normalCommodity.commoditySpu.netType){
								netTypeName = capacity.netType.netTypeName;
							}
						});

						return netTypeName;
					},
					storageName:function(){
						var that = this;
						var storageNamed = "";
						this.phoneCapacities.forEach(function(capacity){
							if(capacity.netType.netTypeCode == that.normalCommodity.commoditySpu.netType){
								capacity.storages.forEach(function(storage){
									if(storage.storageCode == that.normalCommodity.commoditySpu.storage){
										storageNamed = storage.storageName;
									}
								})
							}
						});
						return storageNamed;
					},
					//总价格
					totalPrice:function(){
						var totalPrice = this.currentSku.salePrice*this.number; 
						return ;
					},
					//商品图片
					image:function(){
						return this.currentSku.imageDataInfos[0];
					},
					textList:function(){
						var textList = [];



					}
				},
				watch:{
					skuId:function(val,oldVal){

					},
					spuId:function(val,oldVal){

					}
				},
				methods:{
					addNum:function(){
						if(this.number == 3){
                        	(new Toast({text: "商品最多只能选择3个", time: 3000})).show();
                        	return;
						}
						this.number ++;
					},
					reduceNum:function(){
						if (this.number>1) {
							this.number --;
						}
					}
				}
			});

			//详情tab页
			v_detailTab = new Vue({
				el: "#j_detailTabList",
				data: {
					commoditySpuExt:prodInfo.normalCommodity.commoditySpuExt,
					spuSpecinfoList: prodInfo.normalCommodity.commoditySpuSpecinfoList
				}
			});
		},
		initEvaluation:function(){

			//全部评论
			data_prodEvaluation = {
				imageHost:imageHost,
				remarkInfo:prodEvaluations
			}

			v_prodEvaluation = new Vue({
				el:"#j_prodEvaluation",
				data:data_prodEvaluation
			});

		},
		initLatestEvaluation:function(){

			//最新评论评论
			data_latestEvaluation = {
				imageHost:imageHost,
				remarkCount: 599,
				remarkList: latestEvaluations
			}

			v_latestEvaluation = new Vue({
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

		},
		//获取已选择参数
		getSelectionOption:function(){

		},
		refreshSpu:function(){

		},
		//跨组件事件代理
		handleGlobalBus:function(){

			//显示属性选择弹窗
			bus.$on("showProdSelectionPopup", function() {
				v_selectionPop.$data.isShow = !v_selectionPop.$data.isShow;
			});

			//显示赠品列表
			bus.$on("showGiftListPopup", function() {
				v_giftListPop.$data.isShow = !v_selectionPop.$data.isShow;
			});

			//查看更多评价
			bus.$on("viewAllEvaluations",function(){
				pageSwipe.slide(2);
			});
		}
	}
	ProdDetail.start();
});