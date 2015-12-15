/*
$(function () {

    //渲染模板所需数据，真实情况可用ajax获取
    var data = {
        url: "../products/detail.html",
        imageSrc: "../assets/images/temp/list-prod-3.jpg",
        prodName: "我是模板渲染出来的",
        comment: "特惠200促销 3GRAM 嘎嘎啊嘎嘎嘎嘎噶",
        price: "1999.99"
    };

    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();

    //滑动加载更多
    $(window).on("scroll", function () {
        var pageHeight = document.body.clientHeight;

        //如果没有下一页了终止该方法
        if(false){
            return;
        }

        if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {

            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
            $("#j_prodList").append(template("j_template", data));
        }
    });

});

*/
$(function () {

    var vcoinListData, createTime, reffer_type, numberClass, symbol, vcoinData;
    var pageNum = parseInt($("#pageVO").attr("pageNum"));
    var pageSize = parseInt($("#pageVO").attr("pageSize"));
    var total = parseInt($("#pageVO").attr("total"));

    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();

    //滑动加载更多
    $(window).on("scroll", function () {
        var pageHeight = document.body.clientHeight;
        if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
            //如果没有下一页了终止该方法
            if (pageNum > Math.floor(total / pageSize)) {
                return;
            } else {
                pageNum += 1;
                $.ajax({
                    url: webCtx + "/my/vcoin/ajax",
                    type: "POST",
                    data: {pageNum: pageNum},
                    success: function (data) {
                        vcoinListData = data.vcoinExchangeRecordsList;
                        $(vcoinListData).each(function () {
                            switch (this.refferType) {
                                case 1 : reffer_type = "购买"; break;
                                case 2 : reffer_type = "兑换"; break;
                                case 4 : reffer_type = "退款"; break;
                                default : reffer_type = this.memo; break;
                            }

                            createTime = new Date(this.createTime);

                            switch (this.exchangeFlag) {
                                case 1 : numberClass = "number add"; symbol = "+"; break;
                                case 2 : numberClass = "number reduce"; symbol = "-"; break;
                                default : break;
                            }

                            vcoinData = {
                                refferType: reffer_type,
                                createTime: createTime.getFullYear()+"-"+
                                            ( /^\d$/.test(createTime.getMonth()+1) ? "0"+(createTime.getMonth()+1) : (createTime.getMonth()+1) ) +
                                            "-"+( /^\d$/.test(createTime.getDate()) ? "0"+createTime.getDate() : createTime.getDate() ),
                                remainderVcoin: this.remainderVcoin,
                                numberClass: numberClass,
                                symbol: symbol,
                                vcoin: this.vcoin
                            };
                            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                            $("#myVcoinList").append(template("j_template", vcoinData));
                        })
                    }
                });
            }
        }
    });

    //获取元素的样式
    function getStyle(ele,attr){
        if(ele.currentStyle){
            return ele.currentStyle[attr];
        }
        else{
            return document.defaultView.getComputedStyle(ele,null)[attr];
        }
    }

    //当content区域过短时，自动加长
    (function(){
        var header=$('#header')[0],
            content=$('#default')[0]||$('#content ul')[0],
            body=document.body,
            body_height=header.offsetHeight+parseFloat(getStyle(header,'margin-bottom'))
                +content.parentNode.clientHeight+parseFloat(getStyle(body,'padding-bottom')),
            html_height=document.documentElement.clientHeight,
            h=html_height-body_height;

        if(h>0){
            content.style.paddingBottom=parseFloat(getStyle(content,'padding-bottom'))+h+'px';
        }
    }());
});


