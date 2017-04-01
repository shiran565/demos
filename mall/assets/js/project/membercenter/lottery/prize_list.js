$(function () {
    function escape(str) {
        return str.replace(/&{1}/g, '&amp;').replace(/<{1}/g, '&lt;').replace(/>{1}/g, '&gt;')
    }

    var $mask=$('#mask'),
        $close=$mask.find('.close'),
        $confirm=$mask.find('.confirm'),
        $name=$mask.find('.name'),
        $telephone=$mask.find('.telephone'),
        $address=$mask.find('.address'),
        $button,
        $status,
        prizeListOptions = {
        init: function(){
            this.eventInit();
        },

        eventInit: function() {
            this.addShipAddressEvent();
        },

        clearInputMsg: function() {
            $name.val("");
            $telephone.val("");
            $address.val("");
        },

        addShipAddressEvent: function () {
            var self = this;
            $("tbody").on("tap", ".add-ship-address", function() {
                var $this=$(this);

                self.clearInputMsg();
                $mask.show();
                $button=$this;
                $status=$this.parent().next();
            });
            $close.on('tap',function(){
                $mask.hide();
            });
            $confirm.on('tap',function(){
                var name= $.trim($name.val()),
                    telephone= $.trim($telephone.val()),
                    address= $.trim($address.val());

                if(!name||!telephone||!address){
                    new Toast({
                        text: '请将信息填写完整'
                    }).show();
                    return;
                }
                if(name.length>20){
                    new Toast({
                        text: '收货人姓名不能超过20个字符'
                    }).show();
                    return;
                }
                if( !(telephone.length == 11 && mobile.test(telephone)) && !phone.test(telephone) ){
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
                $.ajax({
                    type: 'post',
                    url: webCtx + "/my/lottery/updatePrizedAddress",
                    data: {
                        memberPrizedId: $button.attr('data-id'),
                        shipName: name,
                        shipMobile: telephone,
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
                            var html='<p>'+escape(name)+'</p>\
                                <p>'+escape(telephone)+'</p>\
                                <p>'+escape(address)+'</p>';

                            $button.replaceWith($(html));
                            $status.text(dataObject.retMsg);
                            $mask.hide();
                            new Toast({
                                text: "保存成功！"
                            }).show();
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
            });
        }
    };

 // 联系方式校验
    var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
    var phone = /^((\+?86)|(\(\+86\)))?(0\d{2,3}(-)?)?\d{7,8}(-\d{3,4})?$/;


    //滑动加载更多
    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace){
        windowHeight = $(window).height();
    }
    var pageNum = 1;
    var requsting = false;

    $(window).on("scroll", function () {
        var pageHeight = document.body.clientHeight;
        var pageSize = $(".page-size").val();

        if (typeof(pageSize) == "undefined" || requsting) {
            return;
        }

        var pageMax = $(".page-total").val() / pageSize;

        //如果没有下一页了终止该方法
        if (pageNum >= pageMax) {
            return;
        }

        if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
            requsting = true;
            pageNum++;
            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
            $.ajax({
                url: webCtx + "/my/lottery",
                data: {pageNum: pageNum, pageSize: pageSize},
                success: function (data) {
                    var $lists = $(data).find("table tbody tr");
                    $("table tbody").append($lists);
                    requsting = false;
                }
            });
        }
    });

    prizeListOptions.init();
});


