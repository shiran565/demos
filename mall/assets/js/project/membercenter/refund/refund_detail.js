$(function () {

    var refundDetailOption = {

        init: function () {
            var self = this;
            // 提交
            self.voucher();
            // 用户提交退凭证
            self.submitRefundVoucher();
            // 退货凭证点击查看
            self.checkRefundVoucher();
            // 退出退货凭证查看
            self.exitCheckRefundVoucher();
            // 取消操作
            self.cancelSubmitRefundVoucher();
            // 设置买家退货截止时间定时器
            self.setDeadLineTimeOut();
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
                                    window.location.href = webCtx + '/my/refund?detail=' + orderNo;
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
            $("#J_submit-voucher").on("tap", function () {
                $("#J_order-express").val("");
                $("#J_track-no").val("");
                $("#J_mask").show();
            })
        },

        checkRefundVoucher: function () {
            var that = this;
            $(".submit-voucher-img").on("tap", function () {
                var imgUrl = $(this).attr("src");
                $("#J_voucher-mask").find("img").attr("src", imgUrl);
                $("#J_voucher-mask").show();
            })
        },

        exitCheckRefundVoucher: function () {
            var that = this;
            $("#J_voucher-mask").on("tap", function () {
                $("#J_voucher-mask").hide();
            })
        },

        cancelSubmitRefundVoucher: function () {
            $("#J_cancel-submit-voucher").on("tap", function () {
                $("#J_mask").hide();
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
            if (remainedTime != null && remainedTime != "") {
                var hour = parseInt((remainedTime) / (1000 * 60 * 60));
                var minute = parseInt((remainedTime - hour * (1000 * 60 * 60)) / (1000 * 60));
                var second = parseInt(((remainedTime - hour * (1000 * 60 * 60) - minute * (1000 * 60))) / 1000);
                $("#J_return-hour").html(hour);
                $("#J_return-minute").html(minute);
                $("#J_return-second").html(second);
                if (remainedTime <= 1) {
                    window.location.href = window.location.href;
                }
                remainedTime = remainedTime - 1000;
            }
        }

    };

    refundDetailOption.init();

})