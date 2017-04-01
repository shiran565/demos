/**
 * Created by 10994375 on 2016/11/3.
 * x9直播页面抽奖相关的方法
 */
(function () {

    window.Lottery = {
        /**
         * 开始抽奖
         */
        start: function () {
            $("#j_lotteryIframe")[0].contentWindow.$(".start").trigger("tap");
        },
        /**
         * 初始化一些交互事件
         */
        initEvent:function(){
            $("#j_lotteryResult .btn-confirm").on("click",function(){
                var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
                var phone = /^((\+?86)|(\(\+86\)))?(0\d{2,3}(-)?)?\d{7,8}(-\d{3,4})?$/;

                //提交联系方式
                if($("#j_lotteryResult").attr("data-result") === "entity"){

                    var $entityBox = $("#j_lotteryResult");
                    var shipName = $entityBox.find('.name').val().trim();
                    var shipContact = $entityBox.find('.telephone').val();
                    var address = $entityBox.find('.address').val().trim();
                    if (!shipName || !shipContact || !address) {
                        $entityBox.find(".error").text('请将信息填写完整').show();
                        return;
                    }
                    if (shipName.length > 20) {
                        $entityBox.find(".error").text('收货人姓名不能超过20个字符').show();
                        return;
                    }
                    if (!(shipContact.length == 11 && mobile.test(shipContact)) && !phone.test(shipContact)) {
                        $entityBox.find(".error").text('联系电话格式错误').show();
                        return;
                    }
                    if (address.length > 50) {
                        $entityBox.find(".error").text('收货地址不能超过50个字符').show();
                        return;
                    }
                    var prizeId = $("#j_priceId").val();
                    $.ajax({
                        type: 'post',
                        url: webCtx + "/my/lottery/updatePrizedAddress",
                        data: {
                            memberPrizedId: prizeId,
                            shipName: shipName,
                            shipMobile: shipContact,
                            shipAddr: address
                        },
                        dataType:"JSON",
                        success: function (data) {
                            /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                            try {
                                var dataObject = JSON.parse(data);
                            } catch (error) {
                                location.href = webCtx + "/error/forbidden";
                            }
                            if (dataObject.retCode == 200) {
                                JS_BRIDGE.toast('保存成功！');
                                $("#j_lotteryResult").fadeOut();
                            } else {
                                JS_BRIDGE.toast( dataObject.retMsg);
                            }
                        },
                        /*另一终端修改密码，重定向url*/
                        error: function (data) {
                            LoginConfirm.redirect();
                        }
                    });



                }else{
                    $("#j_lotteryResult").fadeOut();
                }
            });
        },
        /**
         * 展示抽奖结果
         * @param data
         */
        showResult: function (data) {
            var results = {
                "404": "活动已过期！",
                "405": "V币余额不足！",
                "406": "本活动累计抽奖次数已用完！",
                "407": "操作过于频繁！",
                "408": "活动已关闭！",
                "409": "活动未开始！",
                "410": "没有抽奖权限！"
            };

            //隐藏旧的错误提示
            $("#j_lotteryResult .error").hide();

            if (data.code == 200) {
                if (data.data.prizeType == 1 || data.data.prizeType == 2) { //实物奖品
                    $("#j_lotteryResult").attr("data-result","entity").fadeIn();
                    $("#j_priceId").val(data.data.id);
                    $("#j_lotteryResult").find(".dialog-title").text("恭喜您抽中"+data.data.prizeName);

                } else if (data.data.prizeType == 3) {    //虚拟奖品
                    $("#j_lotteryResult").find(".dialog-title").text("恭喜您抽中"+data.data.prizeName);
                    $("#j_lotteryResult").attr("data-result","virtual").fadeIn();
                } else { //没抽中
                    $("#j_lotteryResult").attr("data-result","empty").fadeIn();
                    $("#j_lotteryResult").find(".dialog-title").text("很遗憾未中奖，请再接再厉~");
                }
            }else if(data.code == 403){//没登录
                showLoginDialog();
            }else if((data.code + "").indexOf("5") == 0){ //未抽中
                $("#j_lotteryResult").attr("data-result","empty").fadeIn();
                $("#j_lotteryResult").find(".dialog-title").text("很遗憾未中奖，请再接再厉~");
            }
            else{
                JS_BRIDGE.toast(results[""+data.code]);
            }
        }
    }
}());
