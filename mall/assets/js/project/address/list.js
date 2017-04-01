$(function () {
    var $td = $(".table td");
    var $tr = $td.parent();
    $tr.on("tap click", function () {
        var self = this;
        //获取购买模式（1：购物车流程  2：立即购买流程）
        var buyMode = $("#buy-mode").val();
        //进入收货地址来源，order:到订单确认页  vcoin:到V币兑换确认页
        var source = $("#source").val();
        $(".select-box i").each(function () {
            $(this).removeClass("checked");
        })
        $(self).find("i").addClass("checked");
        var addressId = $(self).attr("addressId");
        setTimeout(function () {
            if (source == "order") {
                if (buyMode == 1) {
                    window.location.href = webCtx + "/order/cart/confirm?addressId=" + addressId;
                } else if (buyMode == 2) {
                    window.location.href = webCtx + "/order/quick/confirm?addressId=" + addressId;
                } else if (buyMode == 3) {
                    window.location.href = webCtx + "/second-buy/confirm?addressId=" + addressId;
                }
            } else if (source == "vcoin") {
                window.location.href = webCtx + "/vcoins/confirm?addressId=" + addressId;
            }

        }, 200);
    });

    $('.new-address-button').on("tap", function () {
        window.location.href = webCtx + "/my/address/addAddress";
    });

})