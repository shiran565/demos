$(function () {
    var all_class = 'all',
        no_pay_class = 'not_paid',
        no_receive_class = 'to_receive',
        completed_class = 'completed',
        closed_class = 'closed',
        default_hide_class = 'hide',
        $container = $('#content .container'),
        $all = $('#content .' + all_class),
        $no_pay = $('#content .' + no_pay_class),
        $no_receive = $('#content .' + no_receive_class),
        $completed = $('#content .' + completed_class),
        $closed = $('#content .' + closed_class),
        $nav_li = $('#nav li'),
        $default = $('#default'),
        $default_p = $default.find('p');

    var balance = {

        init: function () {
            var self = this;
            /*初始化tab*/
            self.initTab();
            /*chang Tab*/
            self.changTab();
            /*高亮按钮点击事件*/
            self.clickHighLightBtn();
            /*链接点击事件*/
            self.clickHref();
            /*查看物流信息事件*/
            self.checkOrderExpress();
        },

        /*初始化tab  若没有订单,显示缺省页*/
        initTab: function () {
            if ($container.size()) {
                $container.show();
            } else {
                $default_p.text('您暂时没有相关记录');
                $default.removeClass(default_hide_class);
            }
        },

        changTab: function () {
            var self = this;
            $('#nav ul').on('tap', function (e) {
                var $target = $(e.target);
                if ($target.is('a')) {
                    $nav_li.removeClass('active');
                    $target.parent().addClass('active');
                    $container.hide();
                    $default.addClass(default_hide_class);
                    switch (true) {
                        case $target.hasClass(all_class):
                            if ($container.size()) {
                                $container.show();
                            } else {
                                $default_p.text('您暂时没有相关记录');
                                $default.removeClass(default_hide_class);
                            }
                            break;
                        case $target.hasClass(no_pay_class):
                            if ($no_pay.size()) {
                                $no_pay.show();
                            } else {
                                $default_p.text('您暂时没有相关记录');
                                $default.removeClass(default_hide_class);
                            }
                            break;
                        case $target.hasClass(no_receive_class):
                            if ($no_receive.size()) {
                                $no_receive.show();
                            } else {
                                $default_p.text('您暂时没有相关记录');
                                $default.removeClass(default_hide_class);
                            }
                            break;
                        case $target.hasClass(completed_class):
                            if ($completed.size()) {
                                $completed.show();
                            } else {
                                $default_p.text('您暂时没有相关记录');
                                $default.removeClass(default_hide_class);
                            }
                            break;
                        case $target.hasClass(closed_class):
                            if ($closed.size()) {
                                $closed.show();
                            } else {
                                $default_p.text('您暂时没有相关记录');
                                $default.removeClass(default_hide_class);
                            }
                            break;
                    }
                }
            });
        },

        clickHighLightBtn: function () {
            var self = this;
            $(".btn-highlight").on("tap", function () {
                var operation = $(this).attr("operation");
                var orderNo = $(this).attr("orderNo");
                var orderType = $(this).attr("orderType");
                var isDetail = $(this).attr("isDetail");
                switch (operation) {
                    /*去评论*/
                    case "comment" :
                        location.href = webCtx
                            + "/my/remark/unRemark-prod?orderNo="
                            + orderNo;
                        break;
                    /*去结算*/
                    case "settle":
                        $.ajax({
                            url: webCtx + "/my/order/settle",
                            type: "POST",
                            data: {orderNo: orderNo},
                            dataType: "JSON",
                            success: function (data) {
                                /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                                try{
                                    var dataObject=JSON.parse(data);
                                }catch(_error){
                                    window.location.href = webCtx + "/error/forbidden";
                                }
                                if (dataObject.rsCode == 200) {
                                    var paraMap = dataObject.paraMap;
                                    if (null != paraMap) {
                                        var redirect = dataObject.redirect;
                                        $("#orderPayform").attr("action", redirect);
                                        $.each(paraMap, function (key, value) {
                                            $("#orderPayform").append(
                                                "<input type='hidden' name='"
                                                + key + "' value='"
                                                + value + "' />");
                                        });
                                        $("#orderPayform").submit();
                                    } else {
                                        window.location = dataObject.redirect;
                                    }
                                } else if (dataObject.rsCode == 900) {
                                    (new Toast({text: "您的订单过期啦,请重新购买商品吧!", time: 3000})).show();
                                    setTimeout(function(){self.windowLocation(isDetail,orderNo);}, 3000);
                                }
                            }
                        });
                        break;
                    /*确认收货*/
                    case "confirm_receipt":
                        (new Dialog({
                            title: "是否确认收货?", confirmBtn: true, cancelBtn: true, confirmCallback: function () {
                                $.ajax({
                                    url: webCtx + "/my/order/confirmReceipt",
                                    type: "POST",
                                    data: {orderNo: orderNo},
                                    dataType: "JSON",
                                    success: function (data, status) {
                                        /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                                        try{
                                            var dataObject=JSON.parse(data);
                                        }catch(_error){
                                            window.location.href = webCtx + "/error/forbidden";
                                        }
                                        self.windowLocation(isDetail,orderNo);
                                    }
                                });
                            }
                        })).show();
                        break;
                }
            });
        },

        clickHref: function () {
            var self = this;
            // 取消订单弹出modal
            $(".btn-href").on("tap", function () {
                var orderNo = $(this).attr("orderNo");
                var orderType = $(this).attr("orderType");
                var isDetail = $(this).attr("isDetail");
                (new Dialog({
                    title: "确认取消订单?", confirmBtn: true, cancelBtn: true, confirmCallback: function () {
                        $.ajax({
                            url: webCtx + "/my/order/cancel",
                            type: "POST",
                            data: {orderNo: orderNo},
                            dataType: "JSON",
                            success: function (data, status) {
                                /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                                try{
                                    var dataObject=JSON.parse(data);
                                }catch(_error){
                                    window.location.href = webCtx + "/error/forbidden";
                                }

                                //客户端异常
                                if (dataObject.rsCode == 400) {
                                    (new Toast({text: "订单已发货,取消订单失败!", time: 3000})).show();
                                    setTimeout(function(){self.windowLocation(isDetail,orderNo);}, 3000);
                                    //self.windowLocation(isDetail,orderNo);
                                } else if (dataObject.rsCode == 200) {
                                    if (orderType == '02') {
                                        (new Toast({text: "取消订单提交成功,请等待客服审核!", time: 3000})).show();
                                        setTimeout(function(){self.windowLocation(isDetail,orderNo);}, 3000);
                                        // 在线支付订单
                                    } else {
                                        (new Toast({text: "取消订单提交成功!", time: 3000})).show();
                                        setTimeout(function(){self.windowLocation(isDetail,orderNo);}, 3000);
                                    }
                                }
                            }
                        });
                    }
                })).show();
            });
        },

        checkOrderExpress: function () {
            var self = this;
            $("#order-express").on("click", function () {
                var checkExpress = $(this).attr("checkExpress");
                var orderNo = $(this).attr("orderNo");
                window.location.href = webCtx + "/my/order/detail?orderNo=" + orderNo + "&checkExpress=" + checkExpress;
            })
        },

        windowLocation: function (isDetail,orderNo) {
            if (null == isDetail) {
                location.href = webCtx + "/my/order";
            } else {
                location.href = webCtx + "/my/order/detail?orderNo=" + orderNo;
            }
        }

    }
    balance.init();

});