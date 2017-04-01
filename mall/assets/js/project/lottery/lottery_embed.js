/**
 * Created by 10994375 on 2016/11/2.
 * 用于内嵌的抽奖页面逻辑
 */
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
        success: function (data) {
            if (data.retCode == 200) {
                if (data.retMsg < 0) {
                    $("span.number-for-lottery").text(0);
                } else {
                    $("span.number-for-lottery").text(data.retMsg);
                }
            }
        },
        error: function (data) {

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
        },
        startPrizeEvent: function () {
            var self = this;
            new Lottery({
                container: '#content .turntable',
                cards: 'li',
                noPrizeCards: 'li.empty',
                startBtn: '.start',
                hightLightClass: 'active',
                url: webCtx + "/lottery/prize?uuid=" + $(".lottery-uuid").val(),
                callBack: function (data) {
                    parent.Lottery.showResult(data);
                    self.calculateNumber();
                }
            });
        },

        calculateNumber: function (data) {
            var left = 0;
            if (!data) {
                left = $number.text() * 1 - 1;
            } else {
                left = data * 1;
            }

            if (left < 0) {
                left = 0;
            }
            $number.text(left);
        },
        dialogHideEvent: function () {
            dialogBox.find("div.container").each(function () {
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
            $(".confirm-button").on("tap", function () {
                self.dialogHideEvent();
            });

            $(".close").on("tap", function () {
                self.dialogHideEvent();
            })
        }
    };

    prizeOptions.init();
});