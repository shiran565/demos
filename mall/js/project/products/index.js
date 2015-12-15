$(function () {
	
	var pageNum = 2;
	var noMore = false;

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
        if(noMore){
            return;
        }

        if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
             var url;
             switch ( $("input[name='commdityType']").val() ) {
                 case 0 : url = webCtx + "/product/search"; break;
                 case 1 : url = webCtx + "/product/phone"; break;
                 case 2 : url = webCtx + "/product/parts"; break;
                 default : break;
             }
        	 $.ajax({
                 data: { pageNum : pageNum++},
                 type: "POST",
                 dataType: "json",
                 url: url,
                 success: function (data) {
                	 console.info(pageNum);
                	 if(data != null && data.length != 0)
                		 for(var i = 0; i < data.length; i ++){
                             data[i].salePrice = data[i].salePrice.toFixed(2);
                			 //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
                			 $("#j_prodList").append(template("j_template", data[i]));
                		 }
                	 else
                		 noMore = true;
                 }
             });
            
        }
    });
    
});

