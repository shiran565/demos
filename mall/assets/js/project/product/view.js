var fetchRemarkHtml;
$(function () {
    var imageSwipe,
        $bannerStorage = $('#j_bannerStorage');
    //评论是否已经加载，防止切换选项卡时重复加载
    var isEvaluationLoaded = false;

    var evalHtml;
    // 回到顶部
    var $goTop = $("#j_goTopDetail");

    // 没有设置默认颜色，将第一个颜色选中
    if ($(".option-colors>label.on").size() < 1) {
        $(".option-colors>label:first").addClass("on");
    }
    window.productStore = parseInt($('.option-colors>label.on').attr('sku-store'));

    //花呗分期信息
    var installmentInfos = [];


    //初始化页面tab页效果
    (function () {

        //可视区域高度
        var containerHeight = document.documentElement.clientHeight - $("#j_bottomBar").offset().height - $("#header").offset().height;

        $(".prod-tab").css("height", containerHeight);

        // 列表轮播
        var pageSwipe = new Swipe(document.querySelector("#j_pageSwiper"), {
            startSlide: 0,
            speed: 400,
            auto: false,
            continuous: false,
            disableScroll: false,
            stopPropagation: false,
            callback: function (index, elem) {
                $("#j_prodTabs").find(".pt-item").removeClass("on").eq(index).addClass("on");
                if (index == 2) {
                    if (!isEvaluationLoaded) {
                        fetchRemarkHtml();
                        pageNum = 1;
                    }
                } else if (index == 1) {
                    if (spuInfoTabNum > 1) {
                        $("#j_prodDetailNav").addClass("show");
                    }
                    $goTop.removeClass("show");
                    return;
                }
                clearTimeout(prodTimeEvent);
                clearTimeout(throttleTime);
                $("#j_prodDetailNav").removeClass("show");
                $goTop.removeClass("show");
            }
        });

        //导航跟随和点击
        $("#j_prodTabs .pt-item").on("click", function () {
            var index = $(this).index();
            $("#j_prodTabs").find(".pt-item").removeClass("on").eq(index).addClass("on");
            pageSwipe.slide(index);
        });

        //查看全部评价
        $("#j_viewAllEvaluations").on("click", function () {
            $("#j_prodTabs .pt-item").eq(2).trigger("click");
        });

        //lazyload要在容器内初始化
        $("img[data-src]").lazyload({
            data_attribute: "src",
            container: $(".detail")
        });
    })();

    /**
     * 获取花呗分期金额展示
     * @param spuId
     * @param money
     * @returns {null}
     */
    function getInstallInfoData(spuId, money) {
        $.get(webCtx + "/product/getInstallmentDataDetail", {"spuId": spuId, "money": money}, function (data) {
            if (data.retCode == 200) {
                var installmentData = data.installmentInfoData;
                fillInstallmentInfo(installmentData);
            }
        });
        return null;
    }


    //根据花呗分期数据结构填充分期信息
    function fillInstallmentInfo(intallData) {
        //1、填充最低分期金额
        $("#min-perpay").empty().html("<dfn>&yen;</dfn>" + intallData.minPerPayInfo + "期");
        var tbody = $("#installment-tbd");
        //先清空一下内容
        tbody.empty();
        var perInstallmentInfoList = intallData.perInstallmentInfoList;
        $.each(perInstallmentInfoList, function (i, obj) {
            var tr = $("<tr><td><dfn>&yen;</dfn>" + obj.perPay + "</td> <td>" + obj.num + "期</td> <td><p>共计约<dfn>&yen;</dfn>" + obj.totalPay + "</p><p class=\"prompt\"> 含" + (obj.userRate) * 100 + "%手续费</p></td></tr>");
            tbody.append(tr);
        });
    }

    // 套餐初始化选中颜色
    (function () {
        $(".J_bundle_sku_box").each(function () {
            if ($(this).find("li.J_enable").size() == 0) {
                var suiteCode = $(this).parents(".J_package_item").attr("suiteCode");
                $(".J_package_tags").find("label[suiteCode='" + suiteCode + "']").addClass("disabled");
            }else {
                $(this).find("li.J_enable:first").addClass("on");
            }
        })
    })();
    // 套餐切换
    $(".J_package_tags label").click( function () {
        // 禁用
        if ($(this).hasClass("disabled")) {
            return false;
        }
        $(this).addClass("on").siblings().removeClass("on");
        //花呗分期修改
        $("#salePrice").val(parseFloat($(this).attr("salePrice")));
        showInstallInfo();

        var suiteCode = $(this).attr("suiteCode");
        var $pkgContainer = $(".J_package_container");
        if (suiteCode == undefined) {
            $pkgContainer.hide();
            // TODO 可能需要将一些套餐sku选中状态去除
            return;
        }

        $pkgContainer.show();
        var $suiteCodeTable = $pkgContainer.find("div[suiteCode='" + suiteCode + "']");
        $suiteCodeTable.show();
        $suiteCodeTable.siblings().hide();

        $suiteCodeTable.find(".J_ancillary-prod").each(function () {
            var $colorBox = $(this).find(".J_color_box");
            changeSuiteSkuPic($colorBox);
        });
    });

    // 套餐商品中颜色选择事件
    $(".J_color_box li").click(function () {
        if ($(this).hasClass("on")) {
            return;
        }

        $(this).addClass("on").siblings().removeClass("on");
        changeSuiteSkuPic($(this).parents(".J_color_box"));
    });

    var changeSuiteSkuPic = function ($colorBox) {
        var src = imgHost + $colorBox.find("li.on").attr("imgsrc");
        $colorBox.parents(".J_ancillary-prod").find(".J_bundle_img").attr("src", src);
    };

    // 获取商品购买所需参数
    function getProductParams() {
        var param = {};
        var skuId = $(".option-colors>label.on").attr("sku-id"),
            num = $("#option-number").val();

        var serviceSkuIds = [];
        $(".pro-service>li.on").each(function () {
            var sku = $(this).attr("sku-id");
            serviceSkuIds.push(parseInt($(this).attr("sku-id")));
        });

        var suiteCode = $(".J_package_tags > label.on").attr("suiteCode");
        if (typeof(suiteCode) == "undefined" || suiteCode == null){
            suiteCode='';
        }
        var bundleSkuIds = [];
        if (suiteCode != '' && suiteCode != undefined) {
            $(".J_package_container").find(".J_package_item[suiteCode='" + suiteCode + "'] .J_bundle_sku_box").each(function () {
                bundleSkuIds.push(parseInt($(this).find(".J_bundle_sku_color.on").attr("bundleSkuId")));
            })
        }
        param.skuId = skuId;
        param.num = num;
        param.serviceSkuIds = serviceSkuIds;
        param.suiteCode = suiteCode;
        param.bundleSkuIds = bundleSkuIds;

        return param;
    }

    //异步加载花呗分期列表展示
    var spuId = $("#spuId").val();
    showInstallInfo();
    //用户评测信息异步加载
    $.get(webCtx + "/product/getCommodityEvaluation", {
        "spuId": spuId,
        "preview": $("#preview").val()
    }, function (data) {
        if (data.retCode == 200) {
            var eval = data.commodityEvaluation;
            if (eval["display"] == 1 && eval["wapEval"].length > 0) {
                $("#J_evaluation").show();
                evalHtml = eval;
                spuInfoTabNum = spuInfoTabNum + 1;
            }
        }
        if (spuInfoTabNum <= 1) {
            $(".J_prod-detail").addClass("no-tab");
        }
    });
    $("#J_evaluation").on("click", function () {
        var $container = $(".J_pd-detail-user>div.pre-box");
        if (evalHtml["display"] == 1 && evalHtml["wapEval"].length > 0 && $.trim($container.html()) == '') {
            $container.html(evalHtml["wapEval"]);
        }
    });

    // 异步加载详情简介评论
    $.get(webCtx + "/product/latest/remark", {
        "prodId": spuId,
        "fullpaySkuIdSet": fullpaySkuIdSet
    }, function (data) {
        if (data == '') {
            $(".J_evaluate-list-brief").hide();
            $(".J_evaluate-brief-null").show();
        }else {
            $(".J_evaluate-list-brief").html(data);
        }
    });

    // 异步加载商品评论总数
    $.ajax({
        type: "POST",
        dataType: "json",
        url: webCtx + "/product/countRemark",
        data: {
            "spuId": $("#spuId").val(),
            "fullpaySkuIdSet": fullpaySkuIdSet
        },
        success: function (data) {
            $("#remarkCountSpan").text(" ( " + data.remarkCount + " ) ");
        }
    });

    // 异步查看用户是否收藏此商品
    var $star = $(".icon-collection");
    $.ajax({
        type: "GET",
        dataType: "json",
        url: webCtx + "/favorite/isMemberFavorite",
        data: {"goodsId": $(".option-colors>label.on:first").attr("sku-id"), "goodsType": 0},
        success: function (data) {
            if (data.retCode == 200) {
                if ($star.hasClass("collect")) {
                    $star.removeClass("collect").addClass("collected");
                    $star.next().html("已收藏");
                }
            } else {
                if ($star.hasClass("collected")) {
                    $star.removeClass("collected").addClass("collect");
                    $star.next().html("商品收藏");
                }
            }
        },
        error: function () {
            if ($star.hasClass("collected")) {
                $star.removeClass("collected").addClass("collect");
                $star.next().html("商品收藏");
            }
        }
    });

    // 颜色选中效果
    $(".option-colors > label").on("click", function () {
        $(this).addClass("on").siblings().removeClass("on");
        var smallImgUl = $(".J_product_image_box").empty(),
            skuId = $(this).attr("sku-id");

        $bannerStorage.empty();
        $.each(skuImageJson, function (i, obj) {
            if (skuId == obj.skuId) {
                var bigPic_li = $('<div><img src="' + imgHost + obj.bigPic + '" hdImage="' + imgHost + obj.hdPic + '" alt="商品图片" /></div>');
                smallImgUl.append(bigPic_li);
                $bannerStorage.append('<span data-img="' + imgHost + obj.hdPic + '">');
            }
        });
        swipeImg();

        // 套餐主商品图切换
        (function () {
            var suitePicIndex = smallImgUl.find("div").size() > 1 ? 1 : 0;
            var currentSuiteMainSpuPic = smallImgUl.find("div").eq(suitePicIndex).find("img").attr("src");
            $(".J_main_prod").find("img").attr("src", currentSuiteMainSpuPic);
        })();

        // 购买按钮切换
        var marketable = $("#j_colors").attr("marketable");
        var fullpayFlag = $(this).attr("sku-fullpay");
        var spuInstallment = $(this).parent().attr("spuInstallment");
        window.productStore = parseInt($(this).attr("sku-store"));

        var btnClassName = "btn-confirm add-cart", btnLabel = "加入购物车";
        if (isSecondBuy) {
            setCountDownStatus();
        } else {
            if (marketable == "0") {
                btnClassName = "disabled";
                btnLabel = "商品已下架"
            } else if (parseInt(window.productStore) == 0) {
                btnClassName = "disabled";
                btnLabel = "商品暂时缺货"
            } else if (fullpayFlag == "1") {
                btnClassName = "payall-order btn-append full-booking";
                btnLabel = "全款预定"
            } else if (spuInstallment == "1") {
                btnClassName = "btn-confirm now-buy";
                btnLabel = "立即购买"
            }
            $(".btn-next").removeClass().addClass("btn-next " + btnClassName).attr("title", btnLabel).text(btnLabel);
        }

        var $star = $(".icon-collection");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: webCtx + "/favorite/isMemberFavorite",
            data: {"goodsId": skuId, "goodsType": 0},
            success: function (data) {
                if (data.retCode == 200) {
                    if ($star.hasClass("collect")) {
                        $star.removeClass("collect").addClass("collected");
                        $star.next().html("已收藏");
                    }
                } else {
                    if ($star.hasClass("collected")) {
                        $star.removeClass("collected").addClass("collect");
                        $star.next().html("商品收藏");
                    }
                }
            },
            error: function () {
                if ($star.hasClass("collected")) {
                    $star.removeClass("collected").addClass("collect");
                    $star.next().html("商品收藏");
                }
            }
        });
    });

    // 属性选中效果
    $(".option-storage > label").on("click", function () {
        $(this).addClass("on").siblings().removeClass("on");
    });

    // 碎屏宝选中效果
    $(".svc-brokenscreen > li").on("click", function () {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
        } else {
            $(this).addClass("on").siblings().removeClass("on");
        }
        //展示花呗分期信息
        showInstallInfo();
    });

    // 延保选中效果
    $(".svc-extendedwarranty > li").on("click", function () {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
        } else {
            $(this).addClass("on").siblings().removeClass("on");
        }
        //展示花呗分期信息
        showInstallInfo();
    });

    function showInstallInfo() {
        if (spuInstallment == 1) {
            var num = $("#option-number").val();
            var salePrice = parseFloat($("#salePrice").val()) * num;

            //获取服务的金额
            $(".pro-service>li.on").each(function () {
                var svcPrice = parseFloat($(this).attr("svc-price")) * num;
                salePrice = salePrice + svcPrice;
            });
            getInstallInfoData(spuId, parseFloat(salePrice));
            $(".option-huabei").show();
        }
    }

    var disableElement = function ($element) {
        if (!$element.hasClass("disabled")) {
            $element.addClass("disabled");
        }
    };
    var enableElement = function ($element) {
        if ($element.hasClass("disabled")) {
            $element.removeClass("disabled");
        }
    };
    // 数量增加
    $(".num-box label.add").click(function () {
        var num = $("#option-number").val();
        num = num == null || num == "" ? "0" : num;
        if ((parseInt(num) + 1) > maxNumberPerUser) {
            (new Toast({text: (isSecondBuy ? "秒杀" : "") + "商品最多只能选择" + maxNumberPerUser + "个!", time: 3000})).show();
            return;
        }
        $("#option-number").val(parseInt(num) + 1);
        if (parseInt(num) + 1 > 1) {
            enableElement($(".num-box label.del"));
        }
        //展示花呗分期信息
        showInstallInfo();
    });

    // 数量减少
    $(".num-box label.del").click(function () {
        var num = $("#option-number").val();
        num = num == null || num == "" ? "1" : num;
        if (num == "1") {
            return;
        }
        $("#option-number").val(parseInt(num) - 1);
        if (parseInt(num) - 1 <= 1) {
            disableElement($(this));
        }
        //展示花呗分期信息
        showInstallInfo();
    });

    // 限制数量
    $("#option-number").on("blur", function () {
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
        if (isSecondBuy) {
            num = 1;
        }
        $(this).val(num);
        if (num <= 1) {
            disableElement($(".num-box label.del"));
        }
        if (num > 1) {
            enableElement($(".num-box label.del"));
        }
    });

    // 制式选中效果
    $("label[netType]").unbind().bind(
        "click",
        function () {
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
        "click",
        function () {
            var storageLabel = $(this);
            var currentNetType = $("#netType").val();
            var currentStorage = $("#storage").val();
            var storage = storageLabel.attr("storage");
            if ($(this).hasClass("on")) {
                return;
            }
            $("#storage").val(storage);
            $("#queryFlag").val(2);
            $("#prod-detail-form").attr("action",
                webCtx + "/product/querySpuIdByParams");
            $("#prod-detail-form").submit();
        });

    //收藏点击
    $("div .collection").on("click", function () {

        // 判断登录区分乐园登录
        if (!LoginConfirm.isLogin()) {
            LoginConfirm.redirect();
            return;
        }

        var $star = $(this).find(".icon-collection");
        if ($star.hasClass("collected")) {
            $.ajax({
                data: {goodsId: $(".option-colors>label.on:first").attr("sku-id"), goodsType: 0},
                type: "POST",
                dataType: "json",
                url: webCtx + "/my/favorite/remove",
                success: function (data) {
                    if (data.retCode == 200) {
                        $star.removeClass("collected").addClass("collect");
                        $star.next().html("商品收藏");
                    } else if (data.retCode = 500) {
                        (new Toast({text: "您已经取消收藏过此商品，请刷新重试！", time: 3000})).show();
                    }
                }
            });
            return false;
        }


        $.ajax({
            data: {goodsId: $(".option-colors>label.on:first").attr("sku-id"), goodsType: 0},
            type: "POST",
            dataType: "json",
            url: webCtx + "/my/favorite/add",
            success: function (data) {
                if (data.retCode == 200) {
                    $star.removeClass("collect").addClass("collected");
                    $star.next().html("已收藏");
                } else if (data.retCode = 500) {
                    (new Toast({text: "您已经收藏过此商品，请刷新重试！", time: 3000})).show();
                }

            }, error: function () {
                LoginConfirm.redirect();
            }
        });

    });

    //判断商品是否有效
    function isAllowedSell() {
        var result = true;
        var requestUri = isSecondBuy ? "/product/second-buy/isAllowedSell" : "/product/isAllowedSell";
        var param = getProductParams();
        $.ajax({
            async: false,
            type: "GET",
            url: webCtx + requestUri,
            data: $.param({
                "skuId": param.skuId,
                "num": param.num,
                "bSkuIds": param.bundleSkuIds,
                "suiteCode": param.suiteCode,
                "sSkuIds": param.serviceSkuIds
            }, true),
            success: function (data) {
                if (isSecondBuy && data.data == -1) {
                    window.productStore = 0;
                    setCountDownStatus();
                    result = false;
                    return;
                }

                if (data.data != 1) {
                    (new Toast({text: data.msg, time: 3000})).show();
                    result = false;
                }
            },
            error: function () {
                alert("系统繁忙，请稍后重试。");
                result = false;
            }
        });
        return result;
    }

    $("body").on("click", ".payall-order", function () {
        //校验商品是否有效，以防后台发生修改
        if (!isAllowedSell()) {
            return;
        }
        var param = getProductParams();

        window.location = webCtx + "/order/quick/confirm?skuId=" + param.skuId + "&num=" + param.num + "&sSkuIds=" + param.serviceSkuIds + "&suiteCode=" + param.suiteCode + "&bSkuIds=" + param.bundleSkuIds;
    });

    $("body").on("click", ".now-buy, .second-buy", function () {
        //校验商品是否有效，以防后台发生修改
        if (!isAllowedSell()) {
            return;
        }
        var param = getProductParams();
        var requestUri = isSecondBuy ? "/second-buy/confirm" : "/order/quick/confirm";
        window.location = webCtx + requestUri + "?skuId=" + param.skuId + "&num=" + param.num + "&sSkuIds=" + param.serviceSkuIds + "&suiteCode=" + param.suiteCode + "&bSkuIds=" + param.bundleSkuIds;
    });

    // 加入购物车
    $("body").on("click", ".add-cart", function () {

        var param = getProductParams();
        var optionNum = param.num;
        if (isNaN(optionNum)) {
            optionNum = 1;
        }
        optionNum = optionNum > 3 ? 3 : optionNum;
        optionNum = optionNum < 1 ? 1 : optionNum;
        $.ajax({
            type: "POST",
            url: webCtx + "/shoppingcart/cartAdd",
            data: $.param({
                "skuId": param.skuId,
                "num": optionNum,
                "sSkuIds": param.serviceSkuIds,
                "bSkuIds": param.bundleSkuIds,
                "suiteCode": param.suiteCode
            }, true),
            success: function (data) {
                if (data.retCode == 200) {
                    window.location = webCtx + "/shoppingcart";
                }
                if (data.retCode != 200) {
                    if (!data.retMsg.match("^\{(.+:.+,*){1,}\}$")) {
                        (new Toast({text: data.retMsg, time: 3000})).show()
                    } else {
                        var retMsg = $.parseJSON(data.retMsg);
                        (new Toast({text: retMsg.msg, time: 3000})).show()
                    }
                }
            },
            error: function () {
                (new Toast({text: "网络异常，请刷新页面后重试", time: 3000})).show()
            }
        });
    });

    function swipeImg() {

        var originLength = $("#j_prodImageSlider .J_product_image_box > div").length;
        var $indicator;
        $("#j_prodImageSlider .indicator").empty();
        for (var i = 0; i < originLength; i++) {
            var $indicator = $('<span></span>');
            if (i == 0) {
                $indicator.addClass("on");
            }
            $("#j_prodImageSlider .indicator").append($indicator);
        }

        //注意把上一次的轮播撤销，防止错乱
        if (imageSwipe) {
            imageSwipe.kill();
        }
        // 列表轮播
        imageSwipe = new Swipe($('#j_prodImageSlider .swipe')[0], {
            startSlide: 0,
            speed: 400,
            auto: 3000,
            continuous: true,
            disableScroll: false,
            stopPropagation: true,
            callback: function (index, elem) {
                var $span = $("#j_prodImageSlider .indicator").find("span").removeClass("on");

                $span.eq(index % $span.length).addClass("on");
            }
        });
    }

    swipeImg();

    fetchRemarkHtml = function (pageNum, pageSize) {

        var prodId = $("#prodId").val();

        var $container = $(".J_prod-evaluations");

        var param = (typeof(pageNum) == "undefined") ? {
            prodId: prodId,
            fullpaySkuIdSet: fullpaySkuIdSet,
            onlyHasPicture: false
        } : {
            prodId: prodId,
            onlyHasPicture: false,
            fullpaySkuIdSet: fullpaySkuIdSet,
            pageNum: pageNum,
            pageSize: pageSize
        };

        $.get("remark", param, function (html) {
            $container.html(html);
            isEvaluationLoaded = true;
        });
    };

    // 切换二级选项卡
    $("#j_tabBox li").on("click", function () {
        var index = $(this).index();
        $(this).siblings().removeClass("on");
        $(this).addClass("on");
        $(".pd-detail-tab").hide().eq(index).show();
    }).eq(0).trigger("click");

    // 页面滚动
    var windowHeight = $(".J_prod-evaluations").height(),
        headerHeight = $("#header").offset().height;
    var pageNum = 1;
    var requsting = false;
    var prodTimeEvent;
    var beforeScrollY = 0;
    $(".J_prod-main, .J_prod-detail, .J_prod-evaluations").on("scroll", throttle(function () {
        var winHeight = $(this).height();
        var afterScrollY = $(this).scrollTop();
        var delta = afterScrollY - beforeScrollY;
        beforeScrollY = afterScrollY;
        if (afterScrollY > 1.5 * winHeight) {
            $goTop.addClass("show");
        }else {
            $goTop.removeClass("show");
        }
        // 详情中 顶部标签下滑需要隐藏
        if ($(this).hasClass("J_prod-detail")) {
            if (delta > 0) {
                $("#j_prodDetailNav").removeClass("show");
            }
            if (delta < 0 && spuInfoTabNum > 1) {
                $("#j_prodDetailNav").addClass("show");
            }
        }

        // 评论滚动处理
        if ($(this).hasClass("J_prod-evaluations")) {
            var pageHeight = $(".J_remark-container").height();
            var pageSize = $(".page-size").val();
            if (typeof(pageSize) == "undefined" || requsting) {
                return;
            }
            var pageMax = $(".page-total").val() / pageSize;
            //如果没有下一页了终止该方法
            if (pageNum >= pageMax) {
                return;
            }
            if (afterScrollY + windowHeight + headerHeight + 200 > pageHeight) {
                requsting = true;
                pageNum++;
                //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                $.ajax({
                    url: webCtx + "/product/remark",
                    data: {
                        prodId: spuId,
                        onlyHasPicture: false,
                        fullpaySkuIdSet: fullpaySkuIdSet,
                        pageNum: pageNum,
                        pageSize: pageSize
                    },
                    success: function (data) {
                        var $lists = $(data).find(".evaluate-list li");
                        $(".J_all_remark_list").append($lists);
                        requsting = false;

                    }
                });
            }
        }
    }, 200, 500));

    /**
     *  简单的节流函数，避免频繁执行回调导致卡顿
     * @param func 真正执行的方法
     * @param wait 间隔时间
     * @returns {Function}
     */
    var throttleTime;
    function throttle(func, wait, mustRun) {
        var startTime = new Date();

        return function () {
            var context = this,
                args = arguments,
                curTime = new Date();

            clearTimeout(throttleTime);
            // 如果达到了规定的触发时间间隔，触发 handler
            if (curTime - startTime >= mustRun) {
                func.apply(context, args);
                startTime = curTime;
                // 没达到触发间隔，重新设定定时器
            } else {
                throttleTime = setTimeout(function () {
                    func.apply(context, args);
                }, wait);
            }
        };
    };

    // 回到顶部
    $("#j_goTopDetail").on("click", function () {
        var viewClass = "J_prod-main"
        $("#j_prodTabs").find(".pt-item").each(function () {
            if ($(this).hasClass("on")) {
                if ($(this).index() == 0) {
                    viewClass = "J_prod-main";
                }else if ($(this).index() == 1) {
                    viewClass = "J_prod-detail";
                }else if ($(this).index() == 2) {
                    viewClass = "J_prod-evaluations";
                }
            }
        });
        var $scrollTarget = $("." + viewClass + "");
        var scrollTop = $scrollTarget.scrollTop();
        var duration = 300;
        var step = Math.ceil(scrollTop / Math.floor(duration / 15));
        function animate() {
            setTimeout(function () {
                if (scrollTop == 0) {
                    return
                }
                (scrollTop > step) ? (scrollTop -= step) : scrollTop = 0;

                $scrollTarget.scrollTop(scrollTop);
                animate();
            }, 15);
        }
        animate();
    });

    //查看更多花呗分期
    var $more = $('.pd-options .option-huabei a'),
        $mask = $('#j_mask'),
        $close = $mask.find('.close');

    $more.on('click', function () {
        $mask.show();
    });
    $close.on('click', function () {
        $mask.hide();
    });

    //查看banner及评价大图
    (function () {
        var $bigpicMask = $('#j_bigpic-mask'),
            $bigpicNumber = $('#j_bigpicNumber'),
            $bigpicWrapper = $bigpicMask.find('.swipe-wrapper'),
            $total = $bigpicMask.find('.j_total'),
            swipe = $bigpicMask.find('.bigpic-swipe')[0],
            placeClass = 'place',
            bigpicSwipe,
            isBigpicPage;

        function onPopstate(event) {
            if (event.state && event.state.bigpicMask) {    //点击前进按钮查看大图预览
                //重置大图
                $bigpicWrapper.empty();
                $.each(event.state.picSrcs, function (i, url) {
                    $bigpicWrapper.append(getImage(url, document.documentElement.clientWidth, document.documentElement.clientHeight));
                });
                $bigpicWrapper.find('.j_pinch-zoom').each(initPinchZoom);
                //显示大图
                $bigpicNumber.text(event.state.currentIndex + 1);
                $total.text(event.state.picSrcs.length);
                bigpicSwipe.kill();
                $bigpicMask.fadeIn('fast', function () {
                    bigpicSwipe = new Swipe(swipe, {
                        startSlide: event.state.currentIndex,
                        speed: 400,
                        continuous: true,
                        disableScroll: false,
                        stopPropagation: false,
                        callback: function (index) {
                            history.replaceState({
                                bigpicMask: true,
                                picSrcs: event.state.picSrcs,
                                currentIndex: index % event.state.picSrcs.length
                            }, '');
                            $bigpicNumber.text(history.state.currentIndex + 1);
                        }
                    });
                });
            } else {    //从大图预览后退到详情页
                /*
                 处理PD1309L、PD1401L的乐园的bug，其会在页面加载、刷新时触发popstate事件，而且event.state始终为null
                 这里不用history.state来判断是因为history.state不一定准确，在pc chrome中测试时有问题
                 */
                if (isBigpicPage) {
                    isBigpicPage = false;
                    return;
                }
                $bigpicMask.fadeOut('fast');
            }
        }

        //模拟浏览器原生click事件
        function customClick($elem) {
            var lastTouch,      //上一次touchstart触发的时间
                touching,       //是否正在触屏
                moved,          //是否touchmove过
                multiClick,     //是否单指多击
                multiFinger;    //是否多指操作

            function onTouchStart(event) {
                var t = 300,
                    time = new Date().getTime();

                if (event.touches.length !== 1) {   //多指操作
                    multiFinger = true;
                } else {
                    if (lastTouch && time - lastTouch < t) {
                        multiClick = true;
                    } else {
                        multiClick = false;
                        moved = false;
                        multiFinger = false;
                        setTimeout(function () {
                            //没有多指操作过，没有多次点击过，触屏期间没有touchmove过，且现在没有触屏
                            !multiFinger && !touching && !multiClick && !moved && $elem.clicked();
                        }, t);
                    }
                }

                lastTouch = time;
                touching = true;
            }

            function onTouchEnd(event) {
                !event.touches.length && (touching = false);
            }

            function onTouchMove() {
                moved = true;
            }

            $elem.on('touchstart', onTouchStart).on('touchend', onTouchEnd).on('touchmove', onTouchMove);
        }

        function initPinchZoom() {
            var $this = $(this);

            new RTP.PinchZoom($this, {
                maxZoom: 3.5
            });
            $this.clicked = function () {
                history.back();
            };
            customClick($this);
        }

        /**
         * width - 浏览器可视区域宽度
         * height - 浏览器可视区域高度
         */
        function getImage(src, width, height) {
            var img = new Image(),
                $li = $('<li class="swipe-item">\
                            <div class="bigpicWrapper j_pinch-zoom">\
                                <img src="' + src + '">\
                            </div>\
                        </li>'),
                $img = $li.find('img');

            img.onload = function () {
                $img.css(img.width / width > img.height / height ? {
                    width: '100%'
                } : {
                    height: '100%'
                });
            };
            img.src = src;

            return $li;
        }

        function showMask(isRemark) {
            var $parent = $(this).parent(),
                index = $parent.index(),
                $pics = (isRemark ? $parent.parent() : $bannerStorage).children(),
                picSrcs = [];

            //重置大图
            $bigpicWrapper.empty();
            $pics.each(function () {
                picSrcs.push($(this).attr('data-img'));
                $bigpicWrapper.append(getImage($(this).attr('data-img'), document.documentElement.clientWidth, document.documentElement.clientHeight));
            });
            $bigpicWrapper.find('.j_pinch-zoom').each(initPinchZoom);

            //显示大图
            $bigpicNumber.text(index % $pics.length + 1);
            $total.text($pics.length);
            bigpicSwipe.kill();
            $bigpicMask.fadeIn('fast', function () {
                bigpicSwipe = new Swipe(swipe, {
                    startSlide: index,
                    speed: 400,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function (index) {
                        //state属性不能通过history.state或window.onpopstate的event.state来修改，只能通过history.pushState或history.replaceState修改
                        history.replaceState({
                            bigpicMask: true,
                            picSrcs: history.state.picSrcs,
                            currentIndex: index % $pics.length
                        }, '');
                        $bigpicNumber.text(history.state.currentIndex + 1);
                    }
                });
            });

            //人为添加一条历史记录，需要记住有哪些大图，以及当前滑动到第几张图了，刷新时直接定位到原来的状态
            history.pushState({
                bigpicMask: true,
                picSrcs: picSrcs,
                currentIndex: index
            }, '');
        }

        //让swipe初始化时能够设置正确的尺寸
        $bigpicMask.addClass(placeClass).on('touchmove', function (event) {
            event.preventDefault();
        });
        bigpicSwipe = new Swipe(swipe);
        $bigpicMask.removeClass(placeClass);

        //判断刚进入页面时是否需要显示大图
        if (history.state && history.state.bigpicMask) {
            isBigpicPage = true;
            setTimeout(function () {
                isBigpicPage = false;
            }, 1000);
            bigpicSwipe.kill();
            $bigpicWrapper.empty();
            for (var i = 0; i < history.state.picSrcs.length; i++) {
                $bigpicWrapper.append(getImage(history.state.picSrcs[i], document.documentElement.clientWidth, document.documentElement.clientHeight));
            }
            $bigpicNumber.text(history.state.currentIndex + 1);
            $total.text(history.state.picSrcs.length);
            $bigpicMask.find('.j_pinch-zoom').each(initPinchZoom);
            $bigpicMask.fadeIn('fast', function () {
                bigpicSwipe = new Swipe(swipe, {
                    startSlide: history.state.currentIndex,
                    speed: 400,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function (index) {
                        history.replaceState({
                            bigpicMask: true,
                            picSrcs: history.state.picSrcs,
                            currentIndex: index % Number($total.text())
                        }, '');
                        $bigpicNumber.text(history.state.currentIndex + 1);
                    }
                });
            });
        }

        //点击banner图片
        $('#j_prodImageSlider').on('click', 'img', function () {
            showMask.bind(this)();
        });
        //点击评价图片
        $(document).on('click', '.J_remarkpic', function () {
            showMask.bind(this)(true);
        });

        //监听前进后退事件
        window.onpopstate = onPopstate;

        //刚载入页面时是横屏还是竖屏
        var direction = document.documentElement.clientWidth < document.documentElement.clientHeight ? 1 : 0;

        !direction && $bigpicMask.addClass('crosswise');
        //改变尺寸，重新设置大图尺寸
        window.addEventListener('resize', function () {
            var d = document.documentElement.clientWidth < document.documentElement.clientHeight ? 1 : 0;

            if (d !== direction) {  //切换方向
                direction = d;
                $bigpicMask.toggleClass('crosswise');
            }

            $bigpicMask.find('.swipe-item').each(function () {
                var $this = $(this), $li ,src=$this.find('img').attr('src');

                //vivo浏览器一进入页面就会触发resize事件
                if (src) {
                    $li = getImage(src, document.documentElement.clientWidth, document.documentElement.clientHeight).attr('style', $this.attr('style'));
                    $this.replaceWith($li);
                    initPinchZoom.bind($li.children()[0])();
                }
            });
        });
    }());

    var $btnNext = $('.btn-next'),
        $countDownText = $('.count-down-text'),
        $indicator = $("#j_prodImageSlider .indicator"),
        intervalId;

    function setCountDownStatus() {
        var btnClassName,
            btnLabel,
            countDownHTML = formatTime(timeLong, uptimeLong, downtimeLong);
        var isNeedRefresh = true;

        if (timeLong < uptimeLong) {
            btnClassName = "disabled";
            btnLabel = "立即秒杀";
        } else if (timeLong >= downtimeLong) {
            btnClassName = "disabled";
            btnLabel = "商品已下架";
            countDownHTML = '';
            $indicator.removeClass('seckill');
            clearInterval(intervalId);
        } else if (window.productStore) {
            btnClassName = "btn-confirm second-buy";
            btnLabel = "立即秒杀";
            $indicator.addClass('seckill');
            isNeedRefresh = !$btnNext.hasClass("second-buy");
        } else {
            btnClassName = "disabled";
            btnLabel = "已秒完";
            countDownHTML = '';
            $indicator.removeClass('seckill');
        }

        isNeedRefresh && $btnNext.removeClass().addClass("btn-next " + btnClassName).attr("title", btnLabel).text(btnLabel);
        $countDownText.html(countDownHTML);
    }

    function formatTime(current, start, end) {
        var time, d, h, m, s, status;

        if (current < start) {
            time = start - current;
            status = '开始';
        } else if (current < end) {
            time = end - current;
            status = '结束';
        } else {
            return '已结束';
        }

        d = parseInt(time / (3600000 * 24)) > 9 ? parseInt(time / (3600000 * 24)) : '0' + parseInt(time / (3600000 * 24));
        h = parseInt(time / 3600000) % 24 > 9 ? parseInt(time / 3600000) % 24 : '0' + parseInt(time / 3600000) % 24;
        m = parseInt(time / 60000) % 60 > 9 ? parseInt(time / 60000) % 60 : '0' + parseInt(time / 60000) % 60;
        s = parseInt(time % 60000 / 1000) > 9 ? parseInt(time % 60000 / 1000) : '0' + parseInt(time % 60000 / 1000);

        return '<span>' + d + '</span>天<span>' + h + '</span>时<span>' + m + '</span>分<span>' + s + '</span>秒后' + status;
    }

    //秒杀倒计时
    if (isSecondBuy) {
        setCountDownStatus();
        intervalId = setInterval(function () {
            timeLong += 1000;
            setCountDownStatus();
        }, 1000);
    }
});