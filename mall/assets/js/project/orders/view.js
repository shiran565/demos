$(function () {

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
            //修改支付方式
            self.modifiedPayMethodEvent();
            //修改发票类型
            self.modifiedInvoiceEvent();
            //选择优惠券
            self.changeCouponEvent();
            //校验优惠劵
            self.checkCouponEvent();
            //发票抬头字数限制
            self.taxTitleNumberLimit();
            //订单留言字数限制
            self.orderMemoNumberLimit();
            //提交订单
            self.submitOrderEvent();
        },

        //计算并设置小计
        computAndSetSum: function () {
            //商品总价
            var totalAmount = 0;
            $(".prod-total-price").each(function () {
                totalAmount += parseFloat($(this).val());
            })
            //服务总价
            var serviceTotalAmount = 0;
            $(".service-total-price").each(function () {
                serviceTotalAmount += parseFloat($(this).val());
            })
            //商品总价+服务总价
            totalAmount += serviceTotalAmount;
            //优惠价格
            var privilegeAmount = 0;
            $(".prod-privilege-price").each(function () {
                privilegeAmount += parseFloat($(this).val());
            })
            // 支付总价
            var payAmount = totalAmount - privilegeAmount;

            var $coupon = $(".sel-select-coupon option:selected");
            var subAmount = parseFloat($coupon.attr("data-amount"));
            var couponType = $coupon.attr("data-type");

            // 邮费
            var postAmount = 0;
            // 免邮券
            if (couponType == "4001") {
                postAmount = 0;
            } else if (couponType) {
                privilegeAmount += subAmount;
                // 基于金额的免邮
                if (isBaseOnAmount) {
                    // 券金额+商品优惠金额>=商品总金额
                    if ((privilegeAmount) >= totalAmount) {
                        privilegeAmount = totalAmount;
                        postAmount = basePostFee;
                    } else {
                        // 大于基准金额，免邮
                        if (totalAmount - privilegeAmount >= baseAmount) {
                            postAmount = 0;
                        } else {
                            postAmount = basePostFee;
                        }
                    }
                    // 不基于金额无须重新计算，重接从后台获取邮费
                } else {
                    postAmount = postFee;
                }
                // 没有优惠券
            } else {
                // 基于金额的免邮
                if (isBaseOnAmount) {
                    // 大于基准金额，免邮
                    if (totalAmount - privilegeAmount >= baseAmount) {
                        postAmount = 0;
                    } else {
                        postAmount = basePostFee;
                    }
                    // 不基于金额无须重新计算，重接从后台获取邮费
                } else {
                    postAmount = postFee;
                }
            }

            //重新计算支付价格
            payAmount = totalAmount - privilegeAmount + postAmount;

            // 实际支付金额最低为0
            if (payAmount < 0) {
                payAmount = 0;
            }

            $(".total-price").html(totalAmount.toFixed("2"));
            $(".privilege-price").html(privilegeAmount.toFixed("2"));
            $(".post-price").html(postAmount.toFixed("2"));
            $(".pay-price").html(payAmount.toFixed("2"));
            /*V币*/
            var vcoin = 0;
            $(".prod-vcoin").each(function () {
                vcoin += parseFloat($(this).val());
            })
            $(".get-vcoin").html(vcoin);
            return payAmount;

        },

        //修改支付方式
        modifiedPayMethodEvent: function () {
            $(".paymethod-info").children("button").on("tap", function () {
                $(".paymethod-info").children("button").each(function () {
                    $(this).removeClass("on");
                });
                $(this).addClass("on");
            });
            $(".paymethod-info").find(".on").trigger("click");
        },

        //修改发票信息
        modifiedInvoiceEvent: function () {
            $(".invoice-info button").on("tap", function () {
                $(".invoice-info button").each(function () {
                    $(this).removeClass("on");
                });
                $(this).addClass("on");
                if (2 == $(this).val()) {
                    $(".invoice-title").attr("placeholder", "");
                } else {
                    $(".invoice-title").attr("placeholder", "如不填写，默认以个人名称开票");
                }
            });
        },

        //优惠劵选择事件
        changeCouponEvent: function () {
            var self = this;
            $(".sel-select-coupon").on("change", function () {
                var $this = $(this),
                    $option = $this.find('option'),
                    text = $option[this.selectedIndex].innerText;

                self.computAndSetSum();
                $this.prev().html(text);
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
                    data: {couponNum: outNum, requestUuid: $("#requestUuid").val()},
                    success: function (data) {
                        if (data.retCode == 200) {
                            if (1 == data.usable) {
                                (new Toast({text: "温馨提示:绑定成功" + outNum, time: 3000})).show();
                                var element = "<option data-amount=" + data.coupon.couponAmount +
                                    " data-type=" + data.coupon.couponType + " data-num=" + data.coupon.couponNum + ">"
                                    + data.coupon.couponName + "</option>";
                                var option = $(element);
                                $(".sel-select-coupon:first").prepend(option);
                                var optimalCouponNum;
                                var optimalCouponAmount = -1;
                                $(".sel-select-coupon option").each(function () {
                                    var couponAmount = parseInt($(this).attr("data-amount"));
                                    if (couponAmount > optimalCouponAmount) {
                                        optimalCouponAmount = couponAmount;
                                        optimalCouponNum = $(this).attr("data-num");
                                    }
                                });
                                $(".sel-select-coupon option[data-num=" + optimalCouponNum + "]").attr("selected", true);
                                $(".txt-coupon-num").val("");
                                $(".sel-select-coupon").trigger("change");
                            } else {
                                (new Toast({text: "温馨提示:绑定成功" + outNum + ",此券不可用于此订单!", time: 3000})).show();
                                return;
                            }
                        } else if (data.retCode == 600) {
                            LoginConfirm.redirect();
                            return;
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
                    $(this).val($(this).val().substr(0, 299));
                }
            })
        },
        //订单数据校验
        orderDataValidate: function () {
            if (!$(".addr-detail").attr("address-id")) {
                (new Toast({text: "请选择收货地址!", time: 3000})).show();
                return false;
            }

            if ($("#order-memo").val().length > 300) {
                (new Toast({text: "订单留言超过300字,请返回修改!", time: 3000})).show();
                return false;
            }

            if ($(".invoice-title").val().length > 50) {
                (new Toast({text: "发票抬头请输入少于50个字符!", time: 3000})).show();
                return false;
            }

            if (parseFloat($(".pay-price").text()) > 20000.00001) {
                (new Toast({text: "订单金额大于2万,请联系工作人员进行购买!", time: 3000})).show();
                return false;
            }

            if (parseFloat($(".pay-price").text()) <= 0) {
                (new Toast({text: "订单金额必须大于0，请修改订单!", time: 3000})).show();
                return false;
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

                //1:购物车流程  2：立即购买流程
                var buyMode = $("#buyMode").val();
                var requestUuid = $("#requestUuid").val();
                var skuId;
                var spuId;
                var sSkuIds = [];
                var num;
                //立即购买流程获取商品skuId 服务sSkuIds
                if (buyMode == 2 || buyMode == 3) {
                    skuId = $(".order-commodity-main").attr("skuId");
                    spuId = $(".order-commodity-main").attr("spuId");
                    $(".order-commodity-service").each(function () {
                        sSkuIds.push($(this).val());
                    })
                    num = $(".order-commodity-main").attr("num");
                }
                var taxType = $(".tax-type.on").val();
                var taxCompany = $(".invoice-title").val();
                if (!taxCompany) {
                    if (taxType == 1) {
                        taxCompany = $(".receiverName").attr("receiverName");
                    } else {
                        (new Toast({text: "请填写公司发票信息再提交!", time: 3000})).show();
                        return;
                    }

                }
                var orderMemo = $("#order-memo").val();
                var payMethod = $(".pay-method.on").val();
                var addressId = $(".addr-detail").attr("address-id");
                var couponNum = $(".sel-select-coupon option:selected").attr("data-num");
                var data = {
                    skuId: skuId,
                    sSkuIds: sSkuIds,
                    num: num,
                    taxType: taxType,
                    taxCompany: taxCompany,
                    orderMemo: orderMemo,
                    payMethod: payMethod,
                    addressId: addressId,
                    couponNum: couponNum,
                    requestUuid: requestUuid
                };
                $(self).attr("disabled", "disabled");
                $.ajax({
                    url: "submit",
                    type: "POST",
                    data: $.param(data, true),
                    dataType: "JSON",
                    success: function (data) {
                        /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                        try {
                            var dataObject = JSON.parse(data);
                            if (dataObject && dataObject.retCode == 503) {
                                $(self).attr("disabled", false);
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
                                window.location = webCtx + dataObject.redirect;
                            }
                        } else if (dataObject.retCode == 223 || dataObject.retCode == 224 || data.retCode == 226) {
                            (new Toast({text: dataObject.retMsg, time: 3000})).show();
                            setTimeout(function () {
                                window.location = webCtx + "/product/" + spuId;
                            }, 3000);
                        } else if (dataObject.retCode == 225) {
                            (new Toast({text: dataObject.retMsg, time: 3000})).show();
                            setTimeout(function () {
                                window.location = webCtx + "/my/order/";
                            }, 3000);
                            // 订单重复提交
                        } else if (dataObject.retCode == 230) {
                            (new Dialog({
                                title: dataObject.retMsg,
                                confirmBtn: true,
                                cancelBtn: true,
                                confirmText: "查看订单",
                                cancelText: "返回首页",
                                confirmCallback: function () {
                                    window.location = webCtx + "/my/order/";
                                },
                                cancelCallback: function () {
                                    window.location = webCtx + "/index.html";
                                }
                            })).show();

                        } else {
                            //出现异常时，根据购物流程进行跳转,购物车流程跳转到购物车
                            if (buyMode == 1) {
                                (new Toast({text: dataObject.retMsg, time: 3000})).show();
                                setTimeout(function () {
                                    window.location.href = webCtx + '/shoppingcart';
                                }, 3000);

                            } else {
                                //立即购买流程跳转到商品详情页
                                (new Toast({text: dataObject.retMsg, time: 3000})).show();
                                setTimeout(function () {
                                    window.location = webCtx + "/product/" + spuId;
                                }, 3000);
                            }
                        }
                    },
                    /*另一终端修改密码，重定向url*/
                    error: function () {
                        window.location.href = window.location;
                    }
                })
            })
        }

    };
    balance.init();
    ;
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