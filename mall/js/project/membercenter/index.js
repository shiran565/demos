$(function () {

    (function (){
        var $vCoinSpan = $(".vcoin-span");
        $.ajax({
            url: webCtx + "/my/queryVCoin",
            type: "POST",
            data: "json",
            success: function(data){
                if(data.vCoin != null){
                    $vCoinSpan.text("我的V币：" + data.vCoin + "V币");
                }
            }
        });
    })();

    $(".add-shopping-cart").tap(function () {
        var $this = $(this);
        $.ajax({
            type: "POST",
            url: webCtx + "/shoppingcart/skuAdd",
            data: $.param({
                    "skuId" : $this.attr("sku-id"),
                    "num" : 1,
                    "sSkuIds": []}, true
            ),
            success: function(data){
                if (data.rsCode != 200) {
                    new Toast({
                        text:data.rsMsg,
                        time:2000
                    }).show();
                } else {
                    // $errorMsg.hide(); 隐藏错误 TODO
                    window.location = webCtx + "/shoppingcart";
                }
            },
            error: function () {
                new Toast({
                    text:'加入购物车错误！',
                    time:2000
                }).show();
            }
        });
    });

});