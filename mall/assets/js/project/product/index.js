$(function () {

    var pageNum = 2;
    var noMore = false;

    var $body = $(document.body),
        $mask = $('#J_mask'),
        $category = $('#J_category'),
        $sort = $('#J_sort'),
        $category_selection = $('#J_category-selection'),
        $sort_selection = $('#J_sort-selection'),
        categoryScroll,
        sortScroll,
        class_name = 'down',
        animation_time = 200;

    $category.on('click', function () {
        if ($category.hasClass(class_name)) {
            $category_selection.fadeOut(animation_time, function () {
                $category.removeClass(class_name);
            });
            $mask.fadeOut(animation_time);
            $body.off('touchmove');
        } else {
            $sort.removeClass(class_name);
            $sort_selection.hide();
            $category_selection.fadeIn(animation_time, function () {
                $category.addClass(class_name);
                categoryScroll = categoryScroll || new IScroll($category_selection[0], {
                        scrollY: true,
                        momentum: true,
                        mouseWheel: true,
                        preventDefaultException: {
                            tagName: /^A$/
                        }
                    });
            });
            if (!$mask.is(':visible')) {
                $mask.fadeIn(animation_time);
                $body.on('touchmove', function (event) {
                    event.preventDefault();
                });
            }
        }
    });

    $sort.on('click', function () {
        if ($sort.hasClass(class_name)) {
            $sort_selection.fadeOut(animation_time, function () {
                $sort.removeClass(class_name);
            });
            $mask.fadeOut(animation_time);
            $body.off('touchmove');
        } else {
            $category.removeClass(class_name);
            $category_selection.hide();
            $sort_selection.fadeIn(animation_time, function () {
                $sort.addClass(class_name);
                sortScroll = sortScroll || new IScroll($sort_selection[0], {
                        scrollY: true,
                        momentum: true,
                        mouseWheel: true,
                        preventDefaultException: {
                            tagName: /^A$/
                        }
                    });
            });
            if (!$mask.is(':visible')) {
                $mask.fadeIn(animation_time);
                $body.on('touchmove', function (event) {
                    event.preventDefault();
                });
            }
        }
    });

    //渲染模板所需数据，真实情况可用ajax获取
    var data = {
        url: "../products/detail.html",
        imageSrc: "../assets/images/temp/list-prod-3.jpg",
        noStore: "",
        prodName: "我是模板渲染出来的",
        comment: "特惠200促销 3GRAM 嘎嘎啊嘎嘎嘎嘎噶",
        price: "1999.99"
    };

    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace) {
        windowHeight = $(window).height();
    }

    var flag = true;

    //滑动加载更多
    $(window).on("scroll", function () {
        var pageHeight = document.body.clientHeight;

        //如果没有下一页了终止该方法
        if (noMore) {
            return;
        }

        if (!flag) {
            return;
        }

        if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
            var url;
            /*switch (parseInt($("input[name='commodityType']").val()) ) {
             case 0 : url = webCtx + "/product/search"; break;
             case 1 : url = webCtx + "/product/phone"; break;
             case 2 : url = webCtx + "/product/parts"; break;
             default : break;
             }*/
            url = window.location.href;
            flag = false;

            $.ajax({
                data: {pageNum: pageNum++},
                type: "POST",
                dataType: "json",
                url: url,
                success: function (data) {
                    flag = true;
                    if (data != null && data.length != 0){
                        for (var i = 0; i < data.length; i++) {
                            data[i].salePrice = data[i].salePrice.toFixed(2);
                            data[i].noStore = (noStoreSpus.indexOf("" + data[i].id) > -1) ? "no-good" : "has-good";
                            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                            $("#j_prodList").append(template("j_template", data[i]));
                        }
                    }
                    else{
                        noMore = true;
                    }
                }
            });

        }
    });

    $("#J_category-selection").find("a").on("click",function () {
        var url = window.location.href
        var category =$(this).attr("category");
        $("#J_category").text($(this).text());
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
        $category.trigger("click");
        $.ajax({
            url: url,
            data: {"category":category},
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data != null && data.length > 0){
                    var infoText = "";
                    for (var i = 0; i < data.length; i++) {
                        data[i].salePrice = data[i].salePrice.toFixed(2);
                        data[i].noStore = (noStoreSpus.indexOf("" + data[i].id) > -1) ? "no-good" : "has-good";
                        infoText +=template("j_template", data[i]);
                    }
                    $("#j_prodList").html(infoText);
                }
            }
        });
    });

});

