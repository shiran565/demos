$(function () {

    var $body = $(document.body),
        $mask = $('#J_mask'),
        $category = $('#J_category'),
        $sort = $('#J_sort'),
        $category_selection = $('#J_category-selection'),
        $sort_selection = $('#J_sort-selection'),
        class_name = 'down',
        animation_time = 200;

    $category.on('tap', function () {
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
            });
            if (!$mask.is(':visible')) {
                $mask.fadeIn(animation_time);
                $body.on('touchmove', function (event) {
                    event.preventDefault();
                });
            }
        }
    });

    $sort.on('tap', function () {
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
            });
            if (!$mask.is(':visible')) {
                $mask.fadeIn(animation_time);
                $body.on('touchmove', function (event) {
                    event.preventDefault();
                });
            }
        }
    });


    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace) {
        windowHeight = $(window).height();
    }

    var flag = true;

    var pageNum = 2;
    var noMore = false;

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
            flag = false;

            $.ajax({
                data: {
                    pageNum: pageNum++,
                    classify: classify,
                    sortBy: sortBy,
                    sortOrder: sortOrder,
                    needCheckVcoin: needCheckVcoin
                },
                type: "POST",
                dataType: "json",
                url: webCtx + "/vcoins/asyncGetVcoinCommodityList",
                success: function (data) {
                    flag = true;
                    var briefInfo = data.briefInfo;
                    if (briefInfo != null && briefInfo.length != 0)
                        for (var i = 0; i < briefInfo.length; i++) {
                            var vcoinCommodity = {};
                            vcoinCommodity.id = briefInfo[i].id;
                            vcoinCommodity.name = briefInfo[i].name;
                            vcoinCommodity.needVcoin = briefInfo[i].needVcoin;
                            vcoinCommodity.smallPic = briefInfo[i].smallPic;
                            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                            $("#j_prodList").append(template("j_template", vcoinCommodity));
                        }
                    else
                        noMore = true;
                }
            });

        }
    });
});