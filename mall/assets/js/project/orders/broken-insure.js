$(function () {

    // 订单提交标志，1：正在提交中，0：提交完毕
    var submitFlag = 0;

    var balance = {

        init: function () {
            var self = this;
            $(".invoice-info button:first").addClass("on");
            //初始化页面事件
            self.initEvent();
            $(".sel-select-coupon").trigger("change");
        },

        initEvent: function () {
            var self = this;
            //选择优惠劵
            self.changeCouponEvent();
            //校验优惠劵
            self.checkCouponEvent();
            //订单留言字数限制
            self.orderMemoNumberLimit();
            //提交订单
            self.submitOrderEvent();
        },

        //计算并设置小计
        computAndSetSum: function () {
            //commodity total amount
            var marketPrice = parseFloat($("#market_price").val());
            var commodityPrivilege = parseFloat($("#commodity_privilege").val());

            var $coupon = $(".sel-select-coupon option:selected");

            var privilegeAmount = commodityPrivilege;

            var couponAmount = parseFloat($coupon.attr("data-amount"));
            if (couponAmount) {
                if (couponAmount + commodityPrivilege > marketPrice) {
                    privilegeAmount = marketPrice;
                } else {
                    privilegeAmount = couponAmount + commodityPrivilege;
                }
            }
            var payAmount = marketPrice - privilegeAmount;

            $("#privilege_amount").text(privilegeAmount.toFixed(2));
            $("#pay_amount").text(payAmount.toFixed(2));
        },

        //优惠劵选择事件
        changeCouponEvent: function () {
            var self = this;
            $(".sel-select-coupon").on("change", function () {
                var text = $(this).find("option")[this.selectedIndex].innerText;
                self.computAndSetSum();
                $(this).prev().html(text)
            })
        },

        //验证优惠劵
        checkCouponEvent: function () {
            $("#check-coupon").on("tap", function () {
                if (!$.trim($(".txt-coupon-num").val())) {
                    (new Toast({text: "请输入优惠券号码!", time: 3000})).show();
                    return;
                }
                var outNum = $.trim($(".txt-coupon-num").val());
                $.ajax({
                    url: webCtx + "/coupon/bind",
                    type: "POST",
                    data: {couponNum: outNum, orderType: "spb", skuId: $("#skuId").val()},
                    success: function (data) {
                        if (data.retCode == 200) {
                            if (1 == data.usable) {
                                (new Toast({text: "温馨提示:绑定成功"+outNum, time: 3000})).show();
                                var element = "<option data-amount=" + data.coupon.couponAmount +
                                    " data-type=" + data.coupon.couponType + " data-num=" + data.coupon.couponNum + ">"
                                    + data.coupon.couponName + "</option>";
                                var option = $(element);
                                $(".sel-select-coupon:first").prepend(option);
                                var optimalCouponNum;
                                var optimalCouponAmount=-1;
                                $(".sel-select-coupon option").each(function () {
                                    var couponAmount = parseInt($(this).attr("data-amount"));
                                    if(couponAmount>optimalCouponAmount){
                                        optimalCouponAmount=couponAmount;
                                        optimalCouponNum=$(this).attr("data-num");
                                    }
                                });
                                $(".sel-select-coupon option[data-num=" + optimalCouponNum + "]").attr("selected", true);
                                $(".txt-coupon-num").val("");
                                $(".sel-select-coupon").trigger("change");
                            } else {
                                (new Toast({text: "温馨提示:绑定成功" + outNum + ",此券不可用于此订单!", time: 3000})).show();
                                return;
                            }
                        } else {
                            (new Toast({text: "温馨提示:" + data.retMsg, time: 3000})).show();
                            return;
                        }
                    }
                });
            })

        },

        //发票抬头字数限制
        taxTitleNumberLimit: function () {
            var self = this;
            $("#tax-title").on("input propertychange", function () {
                var markTextLength = $(this).val().length;
                if (markTextLength >= 50) {
                    $(this).val($(this).val().substr(0, 49));
                }
            })
        },
        //订单备注字数限制
        orderMemoNumberLimit: function () {
            var self = this;
            $("#order-memo").on("input propertychange", function () {
                var memoTextLength = $(this).val().length;
                if (memoTextLength >= 300) {
                    $(this).val($(this).val().substr(0, 300));
                }
            });

            $("#linkmanName").on("input propertychange", function () {
                var memoTextLength = $(this).val().length;
                if (memoTextLength >= 20) {
                    $(this).val($(this).val().substr(0, 20));
                }
            });

            $("#imei").on("input propertychange", function () {
                var memoTextLength = $(this).val().length;
                if (memoTextLength >= 30) {
                    $(this).val($(this).val().substr(0, 30));
                }
            });

            $("#authenticationCode").on("input propertychange", function () {
                var memoTextLength = $(this).val().length;
                if (memoTextLength >= 50) {
                    $(this).val($(this).val().substr(0, 50));
                }
            });
        },
        //订单数据校验
        orderDataValidate: function () {
            var linkmanName = $("#linkmanName").val();
            var telephone = $("#telephone").val();
            if (!$.trim(linkmanName) && !$.trim(telephone)) {
                (new Toast({text: "请输入您的姓名和联系方式!", time: 3000})).show();
                return;
            }
            if (!$.trim(linkmanName)) {
                (new Toast({text: "请输入您的姓名!", time: 3000})).show();
                return;
            }
            if (!$.trim(linkmanName).length > 20) {
                (new Toast({text: "收货人姓名长度不能大于20!", time: 3000})).show();
                return;
            }

            if (!$.trim(telephone)) {
                (new Toast({text: "请输入您的联系电话!", time: 3000})).show();
                return;
            }

            var mobile = /^[13,14,15,17,18]\d{10}$/;
            var phone = /^((\+?86)|(\(\+86\)))?(0\d{2,3}(-)?)?\d{7,8}(-\d{3,4})?$/;
            var isMobile = mobile.test(telephone);
            var isPhone = phone.test(telephone);
            if (!isMobile && !isPhone) {
                (new Toast({text: "请正确输入联系电话!", time: 3000})).show();
                return;
            }
            var imei = $("#imei").val();
            var authenticationCode = $("#authenticationCode").val();
            if (!$.trim(imei) && !$.trim(authenticationCode)) {
                (new Toast({text: "请填写IMIE码/MEID、认证码!", time: 3000})).show();
                return;
            }
            if (!$.trim(imei)) {
                (new Toast({text: "请填写IMIE码/MEID!", time: 3000})).show();
                return;
            }

            if (!$.trim(authenticationCode)) {
                (new Toast({text: "请填写认证码!", time: 3000})).show();
                return
            }

            if ($.trim(imei).length > 15) {
                (new Toast({text: "IMIE码/MEID不能超过15位!", time: 3000})).show();
                return;
            }
            if ($.trim(authenticationCode).length > 8) {
                (new Toast({text: "认证码不能超过8位!", time: 3000})).show();
                return
            }

            if (parseFloat($(".pay-price").text()) > 20000.00001) {
                (new Toast({text: "订单金额大于2万,请联系工作人员进行购买!", time: 3000})).show();
                return;
            }
            return true;
        },

        //提交订单
        submitOrderEvent: function () {
            var that = this;
            $(".btn-submit").on("tap", function () {
                var self = this;
                //订单数据校验
                if (!that.orderDataValidate()) {
                    return;
                }

                var data = {
                    imei: $("#imei").val(),
                    authenticationCode: $("#authenticationCode").val(),
                    linkmanName: $("#linkmanName").val(),
                    telephone: $("#telephone").val(),
                    orderMemo: $("#order-memo").val(),
                    couponNum: $(".sel-select-coupon option:selected").attr("data-num"),
                    skuId: $("#skuId").val(),
                    source: $("#order_source").val()
                };
                // 如果正在提交，给出提示
                if(submitFlag == 1){
                    (new Toast({text: "亲爱的用户请不要频繁点击，请稍后重试...", time: 3000})).show();
                    return;
                }
                // 正在提交
                submitFlag = 1;
                $.ajax({
                    url: webCtx + "/brokenOrder/submit",
                    type: "POST",
                    data: data,
                    dataType: "JSON",
                    success: function (data) {
                        /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                        try {
                            var dataObject = JSON.parse(data);
                            if (dataObject && dataObject.retCode == 503) {
                                // 提交结束
                                submitFlag = 0;
                                (new Toast({text: "温馨提示:当前服务器太忙，请稍后重试!"})).show();
                                return false;
                            }
                        } catch (_error) {
                            window.location.href = webCtx + "/error/forbidden";
                        }
                        if (dataObject.retCode == 200) {
                            var paraMap = dataObject.paraMap;
                            if (null != paraMap) {
                                var redirect = dataObject.redirect;
                                $("#orderPayform").attr("action", redirect);
                                $.each(paraMap, function (key, value) {
                                    $("#orderPayform").append("<input type='hidden' name='" + key + "' value='" + value + "' />");
                                });
                                $("#orderPayform").submit();
                            } else {
                                window.location = dataObject.redirect;
                            }
                        } else {
                            // 提交结束
                            submitFlag = 0;
                            (new Toast({text: dataObject.retMsg, time: 3000})).show();
                        }
                    },
                    /*另一终端修改密码，重定向url*/
                    error:function(){
                        LoginConfirm.redirect();
                    }
                })
            })
        }

    };
    balance.init();

    (function () {
        var ua = navigator.userAgent.toLowerCase();
        //osx 设备 ,双击页面下半部分会向上滑动，这里屏蔽该功能。。。。
        if (ua.indexOf("iphone") >= 0 || ua.indexOf("ipad") >= 0) {
            $(".cf-pay .total").on("touchstart", function (e) {
                e.preventDefault();
            });
        }

    }());

});