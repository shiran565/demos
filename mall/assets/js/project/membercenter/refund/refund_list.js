$(function () {

    var vivo_space_hack_class = 'vivo-space-hack',
        $body = $('body'),
        $container = $(".container");
        $default = $("#default"),
        refundListOptions = {

            init: function () {
                var self = this;
                // 提交
                self.voucher();
                // 用户提交退凭证
                self.submitRefundVoucher();
                // 取消操作
                self.cancelSubmitRefundVoucher();
                // 设置买家退货截止时间定时器
                self.setDeadLineTimeOut();
                // 设置默认展示方式
                if($container.size()==0){
                    $default.removeClass("hide");
                }
            },

            voucher: function () {
                $("#J_submit").on("tap", function () {
                    var shipExpress = $("#J_order-express").val();
                    var trackNo = $.trim($("#J_track-no").val());
                    var orderNo = $("#J_order-no").val();
                    if (shipExpress == "") {
                        (new Toast({text: "请填写物流公司！", time: 3000})).show();
                        return;
                    }
                    if (trackNo == null || trackNo == "") {
                        (new Toast({text: "请填写物流单号！", time: 3000})).show();
                        return;
                    }
                    if (trackNo.length > 50) {
                        (new Toast({text: "物流单号请勿超过50个字符！", time: 3000})).show();
                        return;
                    }
                    var submitVoucherData = {shipExpress: shipExpress, trackNo: trackNo, orderNo: orderNo};
                    $.ajax({
                        url: webCtx + "/my/refund/voucherSubmit",
                        type: "POST",
                        data: $.param(submitVoucherData, true),
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
                            $("#J_mask").hide();
                            if (dataObject.retCode == 200) {
                                (new Dialog({
                                    title: dataObject.retMsg, confirmBtn: true, confirmCallback: function () {
                                        window.location.href = webCtx + '/my/refund';
                                    }
                                })).show();
                            } else {
                                (new Dialog({
                                    title: dataObject.retMsg, confirmBtn: true, confirmCallback: function () {
                                        window.location.href = webCtx + '/my/refund';
                                    }
                                })).show();
                            }
                        },
                        /*另一终端修改密码，重定向url*/
                        error: function () {
                            window.location.href = window.location;
                        }
                    })
                })
            },

            submitRefundVoucher: function () {
                var that = this;
                $(".J_submit-voucher").on("tap", function () {
                    var orderNo = $(this).attr("orderNo");
                    $("#J_order-no").val(orderNo);
                    //清空物流公司和发货单号
                    $("#J_order-express").val("");
                    $("#J_track-no").val("");
                    $body.addClass(vivo_space_hack_class);
                    $("#J_mask").show();
                })
            },

            cancelSubmitRefundVoucher: function () {
                $("#J_cancel-submit-voucher").on("click", function () {
                    $("#J_mask").hide();
                    $body.removeClass(vivo_space_hack_class);
                })
            },

            setDeadLineTimeOut: function () {
                var that = this;
                setInterval(function () {
                    that.showBuyerReturnDeadLineTime()
                }, 1000);

            },

            showBuyerReturnDeadLineTime: function () {
                var that = this;
                $(".remained-time").each(function () {
                    var getBuyerReturnRemainedTime = $(this).attr("remainedTime");
                    if (getBuyerReturnRemainedTime != null && getBuyerReturnRemainedTime != "") {
                        // 计算剩余时间时分秒
                        var hour = parseInt((getBuyerReturnRemainedTime) / (1000 * 60 * 60));
                        var minute = parseInt((getBuyerReturnRemainedTime - hour * (1000 * 60 * 60)) / (1000 * 60));
                        var second = parseInt(((getBuyerReturnRemainedTime - hour * (1000 * 60 * 60) - minute * (1000 * 60))) / 1000);
                        $(this).find(".return-hour").html(hour);
                        $(this).find(".return-minute").html(minute);
                        $(this).find(".return-second").html(second);

                        if (getBuyerReturnRemainedTime <= 1) {
                            window.location.href = webCtx + "/my/refund";
                        }
                    }

                    $(this).attr("remainedTime", getBuyerReturnRemainedTime - 1000);
                })
            }
        };

    refundListOptions.init();

})
