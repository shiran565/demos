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
            //校验优惠卷
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
            //支付总价
            var payAmount = totalAmount - privilegeAmount;

            var $coupon = $(".sel-select-coupon option:selected");
            var subAmount = parseFloat($coupon.attr("data-amount"));
            var couponType = $coupon.attr("data-type");

            //邮费
            var postAmount = 0;
            //免运费券
            if (couponType == "4001") {
                postAmount = 0;
            } else {
                //未免邮费
                if (couponType) {
                    if (payAmount - subAmount >= 67.999999999) {
                        postAmount = 0;
                    } else {
                        postAmount = 8;
                    }
                } else {
                    if (payAmount >= 67.999999999) {
                        postAmount = 0;
                    } else {
                        postAmount = 8;
                    }
                }
            }
            //重新计算优惠
            if (subAmount) {
                privilegeAmount += subAmount;
            }
            if (privilegeAmount > totalAmount) {
                privilegeAmount = totalAmount;
            }
            //重新计算支付价格
            payAmount = totalAmount - privilegeAmount + postAmount;

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
                })
                $(this).addClass("on");
            })
        },

        //修改发票信息
        modifiedInvoiceEvent: function () {
            $(".invoice-info button").on("tap", function () {
                $(".invoice-info button").each(function () {
                    $(this).removeClass("on");
                });
                $(this).addClass("on");
                if(2==$(this).val()){
                    $(".invoice-title").attr("placeholder","");
                }else{
                    $(".invoice-title").attr("placeholder","如不填写，默认以个人名称开票");
                }
            });
        },

        //优惠卷选择事件
        changeCouponEvent: function () {
            var self = this;
            $(".sel-select-coupon").on("change", function () {
                var text = $(this).find("option")[this.selectedIndex].innerText;
                self.computAndSetSum();
                $(this).prev().html(text)

            })

        },

        //验证优惠卷
        checkCouponEvent: function () {
            $("#check-coupon").on("tap", function () {
                if (!$.trim($(".txt-coupon-num").val())) {
                    (new Toast({text: "请输入优惠券号码!", time: 3000})).show();
                    return;
                }
                $.ajax({
                    url: webCtx + "/coupon/bind",
                    type: "POST",
                    data: {couponNum: $(".txt-coupon-num").val()},
                    success: function (data) {
                        if (data.rsCode == 200) {
                            if (1 == data.usable) {
                                (new Toast({text: "优惠卷绑定成功!", time: 3000})).show();
                                $(".sel-select-coupon").prepend("<option data-amount=" + data.couponAmount + " data-type=" + data.couponType + " data-num=" + data.couponNum + ">" + data.couponName + "</option>");
                                $(".sel-select-coupon option[data-num=" + data.couponNum + "]").attr("selected", true);
                                $(".txt-coupon-num").val("");
                                $(".sel-select-coupon").trigger("change");
                            } else {
                                (new Toast({text: "优惠卷绑定成功,但不可用于此订单!", time: 3000})).show();
                                return;
                            }
                        } else {
                            (new Toast({text: "温馨提示:" + data.rsMsg, time: 3000})).show();
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
                var taxType = $(".tax-type.on").val();
                var taxCompany = $(".invoice-title").val();
                if (!taxCompany) {
                    if(taxType==1){
                        taxCompany = $(".receiverName").attr("receiverName");
                    }else{
                        (new Toast({text: "请填写公司发票信息再提交!", time: 3000})).show();
                        return;
                    }

                }
                var orderMemo = $("#order-memo").val();
                var payMethod = $(".pay-method.on").val();
                var addressId = $(".addr-detail").attr("address-id");
                var couponNum = $(".sel-select-coupon option:selected").attr("data-num");
                var data = {
                    taxType: taxType, taxCompany: taxCompany, orderMemo: orderMemo,
                    payMethod: payMethod, addressId: addressId, couponNum: couponNum
                };
                $(self).attr("disabled", "disabled");
                $.ajax({
                    url: webCtx + "/order/submit",
                    type: "POST",
                    data: data,
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
                                    $("#orderPayform").append("<input type='hidden' name='" + key + "' value='" + value + "' />");
                                });
                                $("#orderPayform").submit();
                            } else {
                                window.location = dataObject.redirect;
                            }
                        } else {
                            (new Toast({text: dataObject.rsMsg, time: 3000})).show();
                            setTimeout(function(){window.location.href=webCtx+'/shoppingcart';}, 3000);
                        }
                    }
                })
            })
        }

    };
    balance.init();
    ;(function(){
        var ua = navigator.userAgent.toLowerCase();
        //osx 设备 ,双击页面下半部分会向上滑动，这里屏蔽该功能。。。。
        if(ua.indexOf("iphone")>=0||ua.indexOf("ipad")>=0){
            $(".cf-pay .total").on("touchstart",function(e){
                e.preventDefault();
            });
        }

    }());

});