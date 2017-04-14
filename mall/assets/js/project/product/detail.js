$(function(){

	var prodInfo,//商品详情数据大对象
	latestEvaluations,//最近评论
	prodEvaluations,//全部评论
	pageSwipe,//页面级tab页
	v_prodImage,
	v_prodInfo,//基本商品信息
	v_prodSummary,//价格和优惠信息
	v_latestEvaluation, //最新评价
	v_prodSelection, data_prodSelection, //已选中
	v_selectionPop, data_selectionPop, //属性选择弹窗
	v_giftListPop, //赠品弹窗
	v_detailTab, data_spuSpecinfoList, //商品详情
	v_prodEvaluation, //全部评价
	v_bottomBar, //底部悬浮工具条
	bus = new Vue(); //global event bus，用于处理组件间的事件代理
	var ProdDetail = {
		start:function(){
			var that = this;
			this.initPageSwipe();
			//商品数据
			this.getProdData($("#j_spuId").val(),function(data){
				if(data.retCode == 200){
					prodInfo = data.data
					that.initSpu();
				}
			});
			//最近评论
			this.getLatestEvaluation($("#j_spuId").val());
			//全部评论
			this.getEvaluation($("#j_spuId").val());
			//跨组件事件处理
			this.handleGlobalBus();
		},
		getProdData:function(spuId,callback){
			var that = this;

			$.ajax({
				type:'get',
				dataType:'json',
				data:{
					spuId:spuId
				},
				url:webCtx+"/product/detail.json",
				success:function(data){
					callback(data)
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
			var root = this;

			//轮播图片逻辑
			v_prodImage = new Vue({
				el:"#j_prodImageSlider",
				data: {
					skuId:'',
					currentIndex: 1,
					imageHost: imageHost,
					commoditySkuList:prodInfo.normalCommodity.commoditySkuList
				},
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
			v_prodInfo = new Vue({
				el:"#j_prodInfo",
				data: {
					commoditySpu: prodInfo.normalCommodity.commoditySpu
				}
			});

			//价格和优惠信息
			v_prodSummary = new Vue({
				el:'#j_prodSummary',
				data: {
					giftTotalPrice: prodInfo.normalCommodity.giftTotalPrice,
					commoditySpu: prodInfo.normalCommodity.commoditySpu,
					commodityGiftList: prodInfo.normalCommodity.commodityGiftList,
					userFreepost: prodInfo.normalCommodity.userFreepost
				},
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
			v_giftListPop = new Vue({
				el: "#j_giftListPop",
				data: {					
					isShow: false,
					imageHost: imageHost,
					commodityGiftList: prodInfo.normalCommodity.commodityGiftList
				},
				methods: {
					hide: function() {
						this.isShow = false;
					}
				}
			});

			//已选中属性区域（仅展示）
			v_prodSelection = new Vue({
				el:"#j_prodSelection",
				data: {
					isShow:false,
					number:1,
					netTypeName:'',
					storageName:'',
					skuName:'',
					canUseHuabei:false
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
				triggerType:'default',//弹窗是由什么操作触发的：选择，或立即购买/加入购物车
				imageHost:imageHost,
				spuId:'',
				skuId:'',
				brokenId:'', //碎屏保
				extendId:'', //延保
				huabeiId:'',
				number:1,
				panicBuy:prodInfo.panicBuy,
				fullpaySkuIdSet:prodInfo.fullpaySkuIdSet,
				normalCommodity: prodInfo.normalCommodity,
				phoneCapacities:prodInfo.phoneCapacities, //容量制式
				productSuiteInfos:prodInfo.productSuiteInfos, //套餐
			}

			v_selectionPop = new Vue({
				el:"#j_selectionPop",
				data: data_selectionPop,
				created:function(){
					var that = this;
					bus.$emit("showSelection",{
						netTypeName:that.netTypeName,
						storageName:that.storageName,
						skuName:that.currentSku.commodityAttrItem.name,
						number:that.number
					})
				},
				computed:{
					//当前选中的sku
					currentSku:function(){	
						var commoditySkuList = this.normalCommodity.commoditySkuList;						
						if(commoditySkuList&&commoditySkuList.length){
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
					netType:function(){
						return this.normalCommodity.commoditySpu.netType;
					},
					//已选中的制式
					netTypeName:function(){
						var that = this;
						var netTypeName = "";
						this.phoneCapacities.forEach(function(capacity){
							if(capacity.netType.netTypeCode == that.netType){
								netTypeName = capacity.netType.netTypeName;
							}
						});

						return netTypeName;
					},
					storage:function(){
						return this.normalCommodity.commoditySpu.storage;
					},
					//已选中的容量
					storageName:function(){
						var that = this;
						var storageNamed = "";
						this.phoneCapacities.forEach(function(capacity){
							if(capacity.netType.netTypeCode == that.netType){
								capacity.storages.forEach(function(obj){
									if(obj.storageCode == that.storage){
										storageNamed = obj.storageName;
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
						return this.currentSku.imageDataInfos && this.currentSku.imageDataInfos[0];
					},					
					cmdyCategoryId: function(){
						return this.normalCommodity.commoditySpu.cmdyCategoryId;
					},
					fullPay:function(){						
						//全款预定
						if(this.fullpaySkuIdSet&& this.fullpaySkuIdSet.length){
							for(var i=0;i<this.fullpaySkuIdSet.length;i++){
								if(this.fullpaySkuIdSet[i] == this.normalCommodity.commoditySpu.id){
									return true;
								}
							}
						}
						return false;
					},
					//是否显示购物车
					showShoppingCart:function(){
						//秒杀商品、碎屏宝
						if (this.panicBuy==1 || this.cmdyCategoryId == 12 || this.fullPay) {
							return false;
						}
						return true;
					}
				},
				watch:{
					//监控选择其他颜色
					skuId:function(val,oldVal){

					},
					//监控选择其他制式容量
					spuId:function(val,oldVal){
						var that = this;																			
						root.getProdData(val,function(data){
							if(data.retCode == 200){
								that.phoneCapacities = data.data.phoneCapacities;
								that.productSuiteInfos = data.data.productSuiteInfos;
								that.normalCommodity = data.data.normalCommodity;
							}
						});
					}
				},
				methods:{
					changeSpu:function(netTypeCode,storageCode){
						var that = this;
						$.ajax({
							type:"get",
							url:webCtx + "/product/querySpuIdByParams.json",
							data:{
								netType:netTypeCode,
								storage:storageCode,
								cmdyCategoryId:that.normalCommodity.commoditySpu.cmdyCategoryId
							},
							success:function(data){
								if(data.retCode == 200){
									that.spuId = data.data;
								}
							}
						});
					},
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
					},
					//加入购物车
					submit:function(type){
						bus.$emit("submit",type);
					},
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

			//底部工具条
			v_bottomBar = new Vue({
				el:"#j_bottomBar",
				data:{
					panicBuy:prodInfo.panicBuy,
					fullpaySkuIdSet:prodInfo.fullpaySkuIdSet,
					normalCommodity:prodInfo.normalCommodity
				},
				mounted:function(){
					this.$el.style.display = "";
				},
				computed:{
					cmdyCategoryId: function(){
						return this.normalCommodity.commoditySpu.cmdyCategoryId;
					},
					fullPay:function(){						
						//全款预定
						if(this.fullpaySkuIdSet&& this.fullpaySkuIdSet.length){
							for(var i=0;i<this.fullpaySkuIdSet.length;i++){
								if(this.fullpaySkuIdSet[i] == this.normalCommodity.commoditySpu.id){
									return true;
								}
							}
						}
						return false;
					},
					//是否显示购物车
					showShoppingCart:function(){
						//秒杀商品、碎屏宝
						if (this.panicBuy==1 || this.cmdyCategoryId == 12 || this.fullPay) {
							return false;
						}
						return true;
					}
				},
				methods:{
					//提交
					submit:function(type){
						bus.$emit("submit",type);
					}
				}
			});
		},
		initEvaluation:function(){
			//全部评论
			v_prodEvaluation = new Vue({
				el:"#j_prodEvaluation",
				data:{					
					imageHost:imageHost,
					remarkInfo:prodEvaluations
				}
			});
		},
		initLatestEvaluation:function(){
			//最新评论评论
			v_latestEvaluation = new Vue({
				el:"#j_latestProdEvaluation",
				data: {					
					imageHost:imageHost,
					remarkCount: 599,
					remarkList: latestEvaluations
				},
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
		getSelectedOption:function(){
			var data = {				
				"skuId":v_selectionPop.currentSku.id,//主商品sku id
			    "num":v_selectionPop.number//主商品数量
			}
			//服务
			if(v_selectionPop.brokenId || v_selectionPop.extendId){
				data.sSkuIds = [];
				v_selectionPop.brokenId && data.sSkuIds.push(v_selectionPop.brokenId)
				v_selectionPop.extendId && data.sSkuIds.push(v_selectionPop.extendId)
			}
			//套餐
			if(v_selectionPop.suiteCode){
				data.suiteCode = v_selectionPop.suiteCode;
				data.bSkuIds = v_selectionPop.bSkuIds;
			}
			return data;
		},
		refreshSpu:function(){

		},
		//跨组件事件代理
		handleGlobalBus:function(){
			var root = this;

			//显示属性选择弹窗
			bus.$on("showProdSelectionPopup", function() {
				v_selectionPop.$data.isShow = !v_selectionPop.$data.isShow;
			});

			//显示已选中属性
			bus.$on("showSelection",function(data){
				v_prodSelection.$data.netTypeName = data.netTypeName;
				v_prodSelection.$data.storageName = data.storageName;
				v_prodSelection.$data.skuName = data.skuName;
				v_prodSelection.$data.number = data.number;
			});

			//显示赠品列表
			bus.$on("showGiftListPopup", function() {
				v_giftListPop.$data.isShow = !v_selectionPop.$data.isShow;
			});

			//查看更多评价
			bus.$on("viewAllEvaluations",function(){
				pageSwipe.slide(2);
			});

			//加入购物车
			bus.$on("submit",function(type){
				var url = webCtx;
				var param = root.getSelectedOption();

				if(type == 'add'){
					url += "/shoppingcart/cartAdd";
				}else{
					url += "/product/isAllowedSell"
				}

				$.ajax({
					type:'get',
					url:url,
					data:param,
					success:function(data){
						if(type == "add"){		
							//加入购物车					
							if(data.retCode == 200){
								location.href = webCtx + "/shoppingcart/";
							}else{
                        		(new Toast({text: data.retMsg, time: 3000})).show();
							}
						}else{
							//购买或者全款预定							
							if(data.result){
								location.href = webCtx + "/order/quick/confirm?"+$.param(param);
							}
						}
					}
				})
			});
		}
	}

	ProdDetail.start();
});