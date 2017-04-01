/**
 * Created by Administrator on 2016/2/19.
 * 参数说明
 *
 * container：外部容器的选择器
 * cards：所有奖品的选择器
 * noPrizeCards:谢谢参与奖选择器
 * startBtn：开始按钮选择器
 * speed：速度
 * hightLightClass：高亮效果的类名
 * url:抽奖请求地址
 * callBack:回调，接收一个服务端传回的参数{code:200,data:{},msg:""}
 */
(function () {

    var Lottery = function (option) {
        this.option = {};
        if (option) {
            $.extend(this.option, {
                speed: 60,
                cards:".card",
                hightLightClass: "on",
                noPrizeCards:".null",
                callBack:function(){

                }
            }, option);
        }

        this.init();

    };

    $.extend(Lottery.prototype, {
        init: function () {
            this._sucIndex = -1;
            this.$container = $(this.option.container);
            this.$cards = this.$container.find(this.option.cards || ".card");
            this.$startBtn = this.$container.find(this.option.startBtn);
            this.$nullPrizeCars = this.$container.find(this.option.noPrizeCards);
            this.handleEvents();
        },
        start: function () {
            var _this = this;
            var index = _this._nowIndex || 1;
            var left = -1;
            var speed = _this.option.speed;

            //跑马灯效果
            function highlight() {

                _this.$cards.removeClass(_this.option.hightLightClass);
                _this.$cards.eq(index % 8).addClass(_this.option.hightLightClass);

                //未获取到服务端返回的标志位，持续轮播
                if (_this._sucIndex == -1) {
                    index++;
                    if (index > 8) {
                        index = 1;
                    }
                    setTimeout(highlight, speed);
                } else {
                    //获取到结果后，设置剩余次数标志位
                    if (left == -1) {
                        left = (_this._sucIndex - index) + 16;
                    } else if (left == 1) {
                        //停止
                        //重置各种状态位
                        left = -1;
                        _this._sucIndex = -1;
                        _this._nowIndex = index;
                        //执行回调函数
                        _this.option.callBack(_this.resultData);
                        return;
                    }

                    //将剩余次数轮播完毕
                    index++;
                    left--;
                    if (index > 8) {
                        index = 1;
                    }
                    speed += 10;
                    setTimeout(highlight, speed);
                }
            }

            highlight();
        },
        request: function () {
            var _this = this;
            $.ajax({
                type: "post",
                url: _this.option.url,
                data: {t: new Date().getTime()},
                dataType:"json",
                success: function (data) {
                    var noPrizeLength = _this.$nullPrizeCars.length;
                    var $noPrizeCard;
                    var prizeId;//奖品id
                    var sucIndex;

                    //谢谢参与的情况，从页面随机取一个结果
                    if ((data.code + "").indexOf("5") == 0) {
                        $noPrizeCard = _this.$nullPrizeCars.eq(Math.floor(Math.random() * noPrizeLength));
                        sucIndex = _this.$cards.index($noPrizeCard) + 1;
                    } else if ((data.code + "").indexOf("2") == 0) {
                        prizeId = data.data.prizeId;
                        sucIndex = _this.$cards.index(_this.$container.find("[prize-id='" + prizeId + "']")) + 1;
                    } else {
                        //抽奖失败
                        _this.option.callBack(data);
                        _this.isRequesting = false;
                        return;
                    }
                    _this.start();
                    setTimeout(function () {
                        //延时将结果暴露给外部对象，让动画效果执行一会
                        _this.resultData = data;
                        _this._sucIndex = sucIndex;
                        _this.isRequesting = false;
                    }, 3000);
                },
                error:function(){
                    if(Toast){
                        new Toast({
                            text:'网络异常，请重试',
                            time:2000
                        }).show();
                    }
                    _this.isRequesting = false;
                }
            });
        },
        handleEvents: function () {
            var _this = this;
            _this.$startBtn.on("tap", function () {
                if(_this.isRequesting !== true) {
                    _this.isRequesting = true;
                    _this.request();
                }
            });
        }
    });

    window.Lottery = Lottery;
})();