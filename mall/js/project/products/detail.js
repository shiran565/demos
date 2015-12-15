var fetchRemarkHtml;
$(function() {

	var imageSwipe;

	// 没有设置默认颜色，将第一个颜色选中
	if ($(".option-colors>label.on").size() < 1) {
		$(".option-colors>label:first").addClass("on");
	}

	// 颜色选中效果
	$(".option-colors > label").on("tap", function() {
		$(this).addClass("on").siblings().removeClass("on");
		var smallImgUl = $(".swipe-wrap");
		var skuId = $(this).attr("sku-id");
		smallImgUl.empty();
        $.each(skuImageJson,function(i,obj){
            if(skuId == obj.skuId){
                var bigPic_li = $('<div><img src="'+ imgHost + obj.bigPic+'" alt="商品图片" /></div>');
                smallImgUl.append(bigPic_li);
            }
        });
        swipeImg();
		
        var store = $(this).attr("sku-store");
        var marketable = $(this).attr("marketable");
        // 是否上架,有库存
        if(marketable == "0"){
        	$("#add-cart").addClass("disabled").attr("disabled",true).text("商品已下架");
        }else if(parseInt(store) > 0)
        	$("#add-cart").removeClass("disabled").removeAttr("disabled").text("加入购物车");
        else
        	$("#add-cart").addClass("disabled").attr("disabled",true).text("商品库存不足");
        
        
        var $star = $(".icon-collection");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: webCtx + "/favorite/isMemberFavorite",
            data: {"goodsId": skuId, "goodsType": 0},
            success: function (data) {
                if (data.retCode == 200) {
                    if($star.hasClass("collect")){
                        $star.removeClass("collect").addClass("collected");
                    }
                }else{
                    if($star.hasClass("collected")){
                        $star.removeClass("collected").addClass("collect");
                    }
                }
            },
            error: function(){
                if($star.hasClass("collected")){
                    $star.removeClass("collected").addClass("collect");
                }
            }
        });
	});
	
	// 属性选中效果
	$(".option-storage > label").on("tap", function() {
		$(this).addClass("on").siblings().removeClass("on");
	});

	// 碎屏保选中效果
	$(".svc-brokenscreen > li").on("tap", function() {
		if ($(this).hasClass("on")) {
			$(this).removeClass("on");
		} else {
			$(this).addClass("on").siblings().removeClass("on");
		}
	});

	// 延保选中效果
	$(".svc-extendedwarranty > li").on("tap", function() {
		if ($(this).hasClass("on")) {
			$(this).removeClass("on");
		} else {
			$(this).addClass("on").siblings().removeClass("on");
		}
	});

	// 数量增加
	$(".num-box label.add").tap(function() {
		var num = $("#option-number").val();
		num = num == null || num == "" ? "0" : num;
		if ((parseInt(num) + 1) > 3) {
			(new Toast({text: "商品最多只能选择3个!", time: 3000})).show();
			return;
		}
		$("#option-number").val(parseInt(num) + 1);
	});

	// 数量减少
	$(".num-box label.del").tap(function() {
		var num = $("#option-number").val();
		num = num == null || num == "" ? "1" : num;
		if (num == "1") {
			return;
		}
		$("#option-number").val(parseInt(num) - 1);
	});

	// 限制数量
	$("#option-number").on("blur", function() {
		var val = $(this).val();
		var num;
		try {
			num = parseInt(val);
		} catch (e) {
			num = 1;
		}
		if (isNaN(num) || num < 1 || num > 3) {
			num = 1;
		}
		$(this).val(num);
	});

	// 制式选中效果
	$("label[netType]").unbind().bind(
			"tap",
			function() {
				var netTypeLabel = $(this);
				var currentNetType = $("#netType").val();
				var currentStorage = $("#storage").val();
				var netType = netTypeLabel.attr("netType");
				if (currentNetType == netType) {
					return;
				}
				$("#netType").val(netType);
				$("#queryFlag").val(1);
				$("#prod-detail-form").attr("action",
						webCtx + "/product/querySpuIdByParams");
				$("#prod-detail-form").submit();
	});
	
	// 容量选中效果
	$("label[storage]").unbind().bind(
			"tap",
			function() {
				var storageLabel = $(this);
				var currentNetType = $("#netType").val();
				var currentStorage = $("#storage").val();
				var storage = storageLabel.attr("storage");
				if (currentStorage == storage) {
					return;
				}
				$("#storage").val(storage);
				$("#queryFlag").val(2);
				$("#prod-detail-form").attr("action",
						webCtx + "/product/querySpuIdByParams");
				$("#prod-detail-form").submit();
	});
	
	// 点击收藏
	/*$("div .collection .icon-collection").on("tap", function() {
		if ($(this).hasClass("collect")) {
			$(this).addClass("collected").removeClass("collect");
		} else {
			$(this).addClass("collect").removeClass("collected");
		}
	});*/
	
	 //收藏点击
	$("div .collection").on("tap", function() {
		var $star = $(this).find(".icon-collection");
        if ($star.hasClass("collected")) {
            $.ajax({
                data: { goodsId: $(".option-colors>label.on:first").attr("sku-id"), goodsType: 0},
                type: "POST",
                dataType: "json",
                url: webCtx + "/my/favorite/remove",
                success: function (data) {
                    if (data.retCode == 200) {
						$star.removeClass("collected");
                    }else if(data.retCode=500){
                    	(new Toast({text: "您已经取消收藏过此商品，请刷新重试！", time: 3000})).show();
                    }
                }
            });
            return false;
        }


        $.ajax({
            data: { goodsId: $(".option-colors>label.on:first").attr("sku-id"), goodsType: 0},
            type: "POST",
            dataType: "json",
            url: webCtx + "/my/favorite/add",
            success: function (data) {
                if (data.retCode == 200) {
					$star.addClass("collected");
                }else if(data.retCode=500) {
                	(new Toast({text: "您已经收藏过此商品，请刷新重试！", time: 3000})).show();
                }

            },error: function () {
                /*var myFavorite = webCtx + "/my/";
                window.location = myFavorite;*/
				var url = window.location.href;
				window.location.href = passportHost + "&redirect_uri=" + url;
            }
        });

    });
	
	// 加入购物车
    $("#add-cart").click(function() {
        var serviceSkuIds = [];
        $(".pro-service>li.on").each(function() {
			var sku=$(this).attr("sku-id")
            serviceSkuIds.push(parseInt($(this).attr("sku-id")));
        });

        $.ajax({
            type: "POST",
            url: webCtx + "/shoppingcart/skuAdd",
            data: $.param({
                "skuId" : $(".option-colors>label.on").attr("sku-id"),
                "num" : $("#option-number").val(),
                "sSkuIds": serviceSkuIds
            }, true),
            success: function(data){
                if (data.rsCode != 200) {
                    // $errorMsg.show().find("span").html(data.rsMsg); 错误提示交互 TODO
                	(new Toast({text: data.rsMsg, time: 3000})).show();
                	if(data.rsCode == 400){
                		window.location = webCtx + "/product/phone";
                	}
                } else {
                    // $errorMsg.hide(); 隐藏错误 TODO
                    window.location = webCtx + "/shoppingcart";
                }
            },
            error: function () {
            	alert("加入购物车错误");
                // $errorMsg.show().find("span").html("系统繁忙，请稍后重试。"); 错误提交交互 TODO
            }
        });
    });
	
	function swipeImg() {

		var originLength = $("#j_prodImageSlider .swipe-wrap > div").length;

		//注意把上一次的轮播撤销，防止错乱
		if(imageSwipe){
			imageSwipe.kill();
		}
		// 列表轮播
		imageSwipe = new Swipe($('#j_prodImageSlider .swipe')[0], {
			startSlide : 0,
			speed : 400,
			auto : 3000,
			continuous : true,
			disableScroll : false,
			stopPropagation : false,
			callback : function(index, elem) {
			},
			transitionEnd : function(index, elem) {
				$("#j_prodImageSlider .indicator").html(
						(index % originLength + 1) + "/" + originLength);
			}
		});

		$("#j_prodImageSlider .indicator").html(1 + "/" + originLength);

	};
	
	swipeImg();

	fetchRemarkHtml = function(pageNum, pageSize){

		var prodId = $("#remarkHandler").attr("prodId");

		var $container = $(".pd-tab-evaluations").empty();

		if ( typeof(pageNum) == "undefined" ){
			$.get("remark", {
				prodId: prodId,
				onlyHasPicture: false
			}, function(html){
				$container.empty();
				$container.append(html);
			});
		}else{
			$.get("remark", {
				prodId: prodId,
				onlyHasPicture: false,
				pageNum: pageNum,
				pageSize: pageSize
			}, function(html){
				$container.empty();
				$container.append(html);
			});
		}
	};

	// 切换选项卡
	$("#j_tabBox li").on("tap", function() {
		var index = $(this).index();
		$(this).siblings().removeClass("on");
		$(this).addClass("on");
		if($(this).hasClass("remarkHandler")){
			fetchRemarkHtml();
			pageNum = 1;
		}
		$("#j_pageTags .tab-page").eq(index).show().siblings().hide();
	}).eq(0).trigger("tap");


	//滑动加载更多
	var windowHeight = document.documentElement.clientHeight,
		footerHeight = $(".pd-bottom-bar").height();
	var pageNum = 1;
	var requsting = false;

	$(window).on("scroll", function () {
		var pageHeight = document.body.clientHeight;
		var pageSize = $(".page-size").val();

		if(typeof(pageSize) == "undefined" || requsting){
			return;
		}

		var pageMax = $(".page-total").val()/pageSize;

		//如果没有下一页了终止该方法
		if(pageNum >= pageMax){
			return;
		}

		if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
			requsting = true;
			pageNum++;
			//j_template为模板的ID,data应当为ajax从服务端所获取到的数据
			$.ajax({
				url: webCtx + "/product/remark",
				data: {prodId: $("#remarkHandler").attr("prodId"), pageNum: pageNum, pageSize: pageSize},
				success: function(data){
					var start = data.indexOf("<li class=\"item bd-top\">");
					var end = data.lastIndexOf("</li>");
					var html = data.substring(start, end);
					$(".evaluate-list").append(html);
					requsting = false;
				}
			});
		}
	});

});