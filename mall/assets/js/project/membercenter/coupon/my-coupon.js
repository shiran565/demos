$(function () {

    var couponListData;//后台传入的优惠劵列表数据
    var coupondata;//用于前台展示的单个优惠劵数据
    var status,couponClass, imgSrc,beginDate,endDate;//优惠劵属性
    var pageNum = parseInt($("#pageVo").attr("pageNum"));
    var pageSize = parseInt($("#pageVo").attr("pageSize"));
    var total = parseInt($("#pageVo").attr("total"));

    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace){
        windowHeight = $(window).height();
    }

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
                    url: webCtx + "/my/coupon/ajax",
                    type: "POST",
                    data: {pageNum: pageNum},
                    success: function (data) {
                        couponListData = data.couponList;
                        var len = $(couponListData).length;
                        $(couponListData).each(function (i) {
                            if (4 == this.status) {
                                couponClass = "container dated-used ";
                                status = "已禁用";
                                imgSrc = __uri("/assets/images/membercenter/coupon/coupon-forbidden.png");
                            } else if (3 == this.status) {
                                couponClass = "container dated-used ";
                                status = "已过期";
                                imgSrc = __uri("/assets/images/membercenter/coupon/coupon-dated.png");
                            }
                            else if (2 == this.status || 1 == this.status) {
                                couponClass = "container dated-used ";
                                status = "已使用";
                                imgSrc = __uri("/assets/images/membercenter/coupon/coupon-used.png");
                            }
                            else {
                                couponClass = "container unused ";
                                status = "未使用";
                                imgSrc = __uri("/assets/images/membercenter/coupon/coupon-undated.png");
                            }
                            //若优惠劵为最后一个,增加class="last"
                            if(len==i+1){
                                couponClass+="last";
                            }
                            beginDate = new Date(this.beginTime);
                            endDate = new Date(this.endTime);
                            coupondata = {
                                couponClass: couponClass,
                                couponName: this.couponName,
                                couponNum: this.couponNum,
                                couponAmount: this.couponAmount,
                                beginTime: beginDate.getFullYear()+"."+parseInt(beginDate.getMonth()+1)+"."+beginDate.getDate(),
                                endTime:  endDate.getFullYear()+"."+parseInt(endDate.getMonth()+1)+"."+endDate.getDate(),
                                status: status,
                                imgSrc: imgSrc
                            }
                            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                            $("#j_couponList").append(template("j_template", coupondata));
                        })
                    }
                });
            }
        }
    });

    //静态资源定位，开发环境兼容处理
    function __uri(src){
        return src;
    }

});

