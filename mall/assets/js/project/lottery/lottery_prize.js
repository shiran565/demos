$(function () {

    var dialogBox = $("#mask");
    var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
    var phone = /^((\+?86)|(\(\+86\)))?(0\d{2,3}(-)?)?\d{7,8}(-\d{3,4})?$/;

    // 剩余次数
    var $number = $("span.number-for-lottery");

    // 异步加载抽奖次数
    $.ajax({
        url: webCtx + "/lottery/queryNumber",
        type: "POST",
        data: {uuid: $(".lottery-uuid").val()},
        success: function(data) {
            if (data.retCode == 200) {
                if (data.retMsg < 0) {
                    $("span.number-for-lottery").text(0);
                }else{
                    $("span.number-for-lottery").text(data.retMsg);
                }
            }
        },
        error: function(data) {

        }
    });

    var prizeOptions = {
        init: function () {
            this.eventInit();
            this.dialogHideEvent();
        },
        eventInit: function () {
            this.startPrizeEvent();
            this.closeEvent();
            this.confirmAddressEvent();
        },
        startPrizeEvent: function () {
            var self = this;
            new Lottery({
                container: '#content .turntable',
                cards: 'li',
                noPrizeCards: 'li.empty',
                startBtn: '.start img',
                hightLightClass: 'active',
                url: webCtx + "/lottery/prize?uuid=" + $(".lottery-uuid").val(),
                callBack: function(data){
                    switch (data.code) {
                        case 200:
                            if (data.data.prizeType == 1 || data.data.prizeType == 2) {
                                self.dialogShowEvent(1, null);
                                dialogBox.find(".entity").attr("prizeId", data.data.id);
                                dialogBox.find(".entity").find(".prize-name").html("恭喜您抽中：" + data.data.prizeName);
                            }else if ( data.data.prizeType == 3 ) {
                                dialogBox.find(".virtual").find(".prize-name").html("恭喜您抽中：" + data.data.prizeName);
                                self.dialogShowEvent(3, null);
                            }else {
                                self.dialogShowEvent(5, null);
                            }
                            self.calculateNumber(data.times);
                            break;
                        case 403: {
                            LoginConfirm.redirect();
                            break;
                        }
                            /*self.dialogShowEvent(6, "登录超时！");*/
                            break;
                        case 404:
                            self.dialogShowEvent(6, "活动已经过期！");
                            break;
                        case 405:
                            self.dialogShowEvent(6, "V币余额不足！");
                            break;
                        case 406:
                            $number.text(0);
                            self.dialogShowEvent(6, "本活动累计抽奖次数已用完！");
                            break;
                        case 407:
                            self.dialogShowEvent(6, "操作过于频繁！");
                            break;
                        case 408:
                            self.dialogShowEvent(6, "活动已关闭！");
                            break;
                        case 409:
                            self.dialogShowEvent(6, "活动未开始！");
                            break;
                        case 410:
                            self.dialogShowEvent(6, "没有抽奖权限！");
                            break;
                        default :
                            self.dialogShowEvent(5, null);
                            self.calculateNumber(data.times);
                            break;
                    }
                }
            });
        },

        calculateNumber: function(data) {
            var left = 0;
            if ( !data ) {
                left = $number.text()*1 - 1;
            }else {
                left = data*1;
            }

            if (left < 0) {
                left = 0;
            }
            $number.text(left);
        },

        dialogShowEvent: function(type, message) {
            this.dialogEntityClear();
            this.dialogHideEvent();
            dialogBox.show();
            switch (type) {
                case 1: dialogBox.find(".entity").show();break;
                case 2: dialogBox.find(".entity").show();break;
                case 3: dialogBox.find(".virtual").show();break;
                //case 4: V币---暂无
                case 5: dialogBox.find(".empty").show();break;
                case 6: {
                    dialogBox.find(".tip").find(".tip-message").html(message);
                    dialogBox.find(".tip").show();
                };break;
                default :dialogBox.find(".empty").show();break;
            }
        },

        dialogHideEvent: function() {
            dialogBox.find("div.container").each(function(){
                $(this).hide();
            });
            dialogBox.hide();
        },

        dialogEntityClear: function () {
            var $entity = dialogBox.find(".entity");
            $entity.find('.name').val("");
            $entity.find('.telephone').val("");
            $entity.find('.address').val("")
        },

        closeEvent: function () {
            var self = this;
            $(".confirm-button").on("tap",function () {
                self.dialogHideEvent();
            });

            $(".close").on("tap", function () {
                self.dialogHideEvent();
            })
        },
        confirmAddressEvent: function(){
            var self = this;
            $(".confirm-address").on("tap", function(){
                var $entityBox = dialogBox.find(".entity");
                var shipName = $entityBox.find('.name').val().trim();
                var shipContact = $entityBox.find('.telephone').val();
                var address = $entityBox.find('.address').val().trim();
                if(!shipName||!shipContact||!address){
                    new Toast({
                        text: '请将信息填写完整'
                    }).show();
                    return;
                }
                if(shipName.length>20){
                    new Toast({
                        text: '收货人姓名不能超过20个字符'
                    }).show();
                    return;
                }
                if(!(shipContact.length == 11 && mobile.test(shipContact)) && !phone.test(shipContact)){
                    new Toast({
                        text: '联系电话格式错误'
                    }).show();
                    return;
                }
                if(address.length>50){
                    new Toast({
                        text: '收货地址不能超过50个字符'
                    }).show();
                    return;
                }
                var prizeId = dialogBox.find(".entity").attr("prizeId");
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
                        try{
                            var dataObject=JSON.parse(data);
                        }catch(error){
                            window.location.href = webCtx + "/error/forbidden";
                        }
                        if (dataObject.retCode == 200) {
                            new Toast({
                                text: '保存成功！'
                            }).show();
                            self.dialogHideEvent();
                            self.dialogEntityClear();
                        }else {
                            new Toast({
                                text: dataObject.retMsg
                            }).show();
                        }
                    },
                    /*另一终端修改密码，重定向url*/
                    error:function(data){
                        LoginConfirm.redirect();
                    }
                });
            })
        }
    };



    prizeOptions.init();
});


