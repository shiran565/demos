$(function () {

    // 正在兑换标志位
    var exchanging = 0;

    //确认页面对象
    var balance = {
        //初始化页面
        init: function () {
            var self = this;
            // 点击确认兑换按钮
            self.clickExchangeButton();
        },

        clickExchangeButton: function () {
            var self = this;
            $("#J_confirm-exchange").on("tap", function () {
                if($(this).hasClass("disabled")){
                    return;
                }
                if (exchanging == 1){
                    return;
                }
                var addressId = $(this).attr("addressId");
                // 收货地址校验
                if (null == addressId || addressId == "") {
                    (new Toast({text: "请选择收货地址", time: 3000})).show();
                    return;
                }
                var exchangeDto = self.buildExchangeDto($(this));
                self.exchangeHandler(exchangeDto);
            })
        },

        exchangeHandler: function (data) {
            var self = this;
            exchanging = 1;
            $.ajax({
                url: webCtx + "/vcoins/exchange",
                type: "POST",
                data: data,
                dataType: "JSON",
                success: function (data) {
                    try{
                        var dataObject=JSON.parse(data);
                    }catch(_error){
                        window.location.href = webCtx + "/error/forbidden";
                    }
                    // 兑换成功跳转至我的兑换
                    if (dataObject.retCode == 200) {
                        (new Toast({text: "兑换成功", time: 3000})).show();
                        setTimeout(function () {
                            window.location = webCtx + "/my/vcoin"
                        }, 3000);
                        // 兑换失败跳转至V币商品详情
                    } else {
                        exchanging = 1;
                        (new Toast({text: dataObject.retMsg, time: 3000})).show();
                        setTimeout(function () {
                            window.location = webCtx + "/vcoins/detail/" + exchangeDto["goodsId"]
                        }, 3000);
                    }
                },
                /*另一终端修改密码，重定向url*/
                error:function(data){
                    LoginConfirm.redirect();
                }
            });
        },

        // 构造兑换DTO
        buildExchangeDto: function ($this) {
            var exchangeDto = {};
            var goodsId = $this.attr("goodsId");
            var phoneNumber = $this.attr("phoneNumber");
            var fullName = $this.attr("fullName");
            var shipProvince = $this.attr("shipProvince");
            var shipCity = $this.attr("shipCity");
            var shipArea = $this.attr("shipArea");
            var shipAddr = $this.attr("shipAddr");

            exchangeDto.goodsId = goodsId;
            exchangeDto.phoneNumber = phoneNumber;
            exchangeDto.fullName = fullName;
            exchangeDto.shipProvince = shipProvince;
            exchangeDto.shipCity = shipCity;
            exchangeDto.shipArea = shipArea;
            exchangeDto.shipAddr = shipAddr;
            return exchangeDto;
        }
    }


    //初始化页面
    balance.init();

    //防止乐园里出现底部悬浮按钮显示不全的bug
    (function () {
        var htmlHeight = document.documentElement.clientHeight,
            contentHeight = $('#header').height() + $('#content').height();

        //有些版本乐园没有对html元素进行缩放，但对body进行了缩放
        if (document.documentElement.clientWidth !== document.body.clientWidth) {
            htmlHeight *= (document.body.clientWidth / document.documentElement.clientWidth);
        }

        if (contentHeight < htmlHeight) {
            $('#content').css({
                paddingBottom: htmlHeight - contentHeight + 'px'
            });
        }
    }());
});
