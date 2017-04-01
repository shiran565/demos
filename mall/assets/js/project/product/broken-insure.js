var fetchRemarkHtml;
$(function () {

    var spuId = $("#spuId").val();
    var imageSwipe;
    //评论是否已经加载，防止切换选项卡时重复加载
    var isEvaluationLoaded = false;
    // 回到顶部
    var $goTop = $("#j_goTopDetail");

    // 没有设置默认颜色，将第一个颜色选中
    if ($(".option-colors>label.on").size() < 1) {
        $(".option-colors>label:first").addClass("on");
    }

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
                    //$("#j_prodDetailNav").addClass("show");
                    $goTop.removeClass("show");
                    return;
                }
                clearTimeout(prodTimeEvent);
                clearTimeout(throttleTime);
                //$("#j_prodDetailNav").removeClass("show");
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

    // 异步加载详情简介评论
    $.get(webCtx + "/product/latest/remark", {
        "prodId": spuId
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
        data: {"spuId": spuId},
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
        data: {"goodsId": $("#skuId").val(), "goodsType": 4},
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
    $(".num-box label.add").tap(function () {
        var num = $("#option-number").val();
        num = num == null || num == "" ? "0" : num;
        if ((parseInt(num) + 1) > 1) {
            (new Toast({text: "商品最多只能选择1个!", time: 3000})).show();
            return;
        }
        $("#option-number").val(parseInt(num) + 1);
        if (parseInt(num) + 1 > 1) {
            enableElement($(".num-box label.del"));
        }
    });

    // 数量减少
    $(".num-box label.del").tap(function () {
        var num = $("#option-number").val();
        num = num == null || num == "" ? "1" : num;
        if (num == "1") {
            return;
        }
        $("#option-number").val(parseInt(num) - 1);
        if (parseInt(num) - 1 <= 1) {
            disableElement($(this));
        }
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
        if (isNaN(num) || num < 1 || num > 1) {
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
                data: {goodsId: $("#skuId").val(), goodsType: 4},
                type: "POST",
                dataType: "json",
                url: webCtx + "/my/favorite/remove",
                success: function (data) {
                    if (data.retCode == 200) {
                        $star.removeClass("collected");
                        $star.next().html("商品收藏");
                    } else if (data.retCode = 500) {
                        (new Toast({text: "您已经取消收藏过此商品，请刷新重试！", time: 3000})).show();
                    }
                }
            });
            return false;
        }


        $.ajax({
            data: {goodsId: $("#skuId").val(), goodsType: 4},
            type: "POST",
            dataType: "json",
            url: webCtx + "/my/favorite/add",
            success: function (data) {
                if (data.retCode == 200) {
                    $star.addClass("collected");
                    $star.next().html("已收藏");
                } else if (data.retCode = 500) {
                    (new Toast({text: "您已经收藏过此商品，请刷新重试！", time: 3000})).show();
                }

            }, error: function () {
                LoginConfirm.redirect();
            }
        });

    });

    $("#btn-buy").on("click", function () {
        $("#paybroken").submit();
    })

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
            }
        });

    }

    swipeImg();

    fetchRemarkHtml = function (pageNum, pageSize) {

        var $container = $(".J_prod-evaluations");

        var param = (typeof(pageNum) == "undefined") ? {
            prodId: spuId,
            onlyHasPicture: false
        } : {
            prodId: spuId,
            onlyHasPicture: false,
            pageNum: pageNum,
            pageSize: pageSize
        };

        $.get("remark", param, function (html) {
            $container.html(html);
            isEvaluationLoaded = true;
        });
    };

    // 切换选项卡
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
        // 详情中 顶部标签下滑需要隐藏 (碎屏宝只有一个详情 无需二级tab)

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
                    data: {prodId: spuId, pageNum: pageNum, pageSize: pageSize},
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
    var throttleTime; //切换tab时清除此定时任务
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

    //查看banner及评价大图
    (function () {
        var $bannerStorage = $('#j_bannerStorage'),
            $bigpicMask = $('#j_bigpic-mask'),
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
                var $this = $(this), $li, src = $this.find('img').attr('src');

                if (src) {
                    $li = getImage(src, document.documentElement.clientWidth, document.documentElement.clientHeight).attr('style', $this.attr('style'));
                    $this.replaceWith($li);
                    initPinchZoom.bind($li.children()[0])();
                }
            });
        });
    }());
});