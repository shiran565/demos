/**
 * Created by Administrator on 2016/1/27.
 */
/**
 * Created by Administrator on 2016/1/23.
 */
/*
 * 作者：都鸣 互联网软件一部
 * 用于对礼券进行渲染
 * @class Coupon
 * @param {Array} Result 服务器端响应json数组
 * @method Cookie 从浏览器获取参数
 * @method  model 建立礼券DOM树  用于渲染
 * @method ableCoupon 未过期礼券
 * @method unableCoupon 已用完和已过期礼券的公共部分
 * @method usedCoupon 已用完礼券
 * @method overdueCoupon 过期礼券
 * @method output 渲染 （过期和未过期不同）   待定
 * @method  addSign  cookie相关操作
 * @method addOtherMsg 同上
 * */
var Coupon={
    Cookie:function(){
        var obj;
        obj=Coupon.addSign(obj);
        obj=Coupon.addOtherMsg(obj);
        return obj;
    },
    model:function(){
        var divCoupon=$("<div></div>"),
            divCouponBalance=$("<div></div>"),
            divBalance=$("<div></div>"),
            pBalanceHead=$("<p></p>"),
            pBalanceContent=$("<p></p>"),
            divCouponText=$("<div></div>"),
            pCouponHead=$("<p></p>"),
            p1=$("<p></p>");
        p2=$("<p></p>");
        p3=$("<p></p>");
        divCoupon.addClass("coupon");
        divCouponBalance.addClass("coupon-balance");
        divBalance.addClass("balance");
        pBalanceHead.addClass("balance-head");
        pBalanceHead.text("余额：");
        pBalanceContent.addClass("balance-content");
        divCoupon.append(divCouponBalance);
        divCouponBalance.append(divBalance);
        divBalance.append(pBalanceHead);
        pBalanceHead.after(pBalanceContent);
        divCouponText.addClass("coupon-text");
        pCouponHead.addClass("coupon-head");
        p1.addClass("coupon-term");
        p2.addClass("coupon-term");
        p3.addClass("coupon-term");
        divCouponText.append(pCouponHead);
        pCouponHead.after(p1);
        pCouponHead.after(p2);
        pCouponHead.after(p3);
        divCouponBalance.after(divCouponText);
        return divCoupon;
    },

    ableCoupon:function(Result,i,ablecoupon,validity){
        var lastCoupon= $(".coupon:last-child .balance-content"),
            lastCouponTerm=$(".coupon:last-child .coupon-term");
        $(".coupon:last-child .coupon-balance").addClass("effective");
        lastCoupon.text(Result["tickets"][i].amount);
        $(".coupon:last-child .balance").css("background-color","#ffc652");
        var ableAmount=Result["tickets"][i].amount.toString();
        var str=ableAmount.replace(/[^0-9]+/g, '');
        if(str.length>3){
            lastCoupon.addClass("largeValue");
        }
        else if(str.length<2){
            lastCoupon.addClass("littleValue");
        }
        $(".coupon:last-child .coupon-text").addClass("blank");
        $(lastCouponTerm[0]).text(Result["tickets"][i].items[0].desc);
        $(lastCouponTerm[1]) .text(Result["tickets"][i].items[1].desc);
        $(lastCouponTerm[2]) .text(Result["tickets"][i].items[2].desc);
        $(".coupon:last-child .coupon-head").text(Result["tickets"][i].name);
        if(validity==1)                                  //即将过期
        {
            var img=$("<img src='assets/img/coupon/outDate.png' />");
            img.addClass("outDate");
            $(".current .coupon-text").append(img);
        }

    },
    unableCoupon:function(Result,i,unablecoupon){
        var lastCoupon= $(".coupon:last-child .balance-content"),
            lastCouponTerm=$(".coupon:last-child .coupon-term");
        $(".coupon:last-child .coupon-balance").addClass("uneffictive");
        lastCoupon.text(Result["tickets"][i].amount);
        $(".coupon:last-child .balance").css("background-color","#cccccc");
        var ableAmount=Result["tickets"][i].amount.toString();
        var str=ableAmount.replace(/[^0-9]+/g, '');
        if(str.length>3){                                //余额数字位数大于3个或为一个渲染出来的相对位置不同
            lastCoupon.addClass("largeValue");
        }
        else if(str.length<2){
            lastCoupon.addClass("littleValue");

        }
        $(lastCouponTerm[0]).text(Result["tickets"][i].items[0].desc);
        $(lastCouponTerm[1]) .text(Result["tickets"][i].items[1].desc);
        $(lastCouponTerm[2]) .text(Result["tickets"][i].items[2].desc);
        $(".coupon:last-child .coupon-head").text(Result["tickets"][i].name);

    },
    usedCoupon:function(Result,i,unablecoupon){
        if(Result["tickets"][i].amount==0)
        {
            $(".coupon:last-child .coupon-text").addClass("coupon-used");
        }
    },
    overdueCoupon:function(Result,i,unablecoupon){

            $(".coupon:last-child .coupon-text").addClass("coupon-overdue");

    },
    output:function(){
        var i,j;
        var obj=Coupon.Cookie;
        $.ajax({
                url:"http://192.168.2.230:1616/vcoin/game/tickets",
                type:"post",
                async:"false",
                data: {
                    /*"appVersion": "38",
                     "av": "19",
                     "elapsedtime": "770990982",
                     "imei": "867702027978405",
                     "logged": "true",
                     "model": "vivo%2BX5Max%2B",
                     "openid": "880461d865bd98c5",
                     "sign": "2%7C1248152093",
                     "token": "NzY1YjZiNjc2M2EyOTM5MGJkN2IuNTI1OTI3NS4xNDUzMjgzNDIyNzY5",
                     "username": "test",
                     "uuid": "test",
                     "version": "1.0.0",
                     "cs":"0"*/
                    "model":"vivo+Xplay3S",
                     "imei":"867320000022271",
                     "logged":"true",
                     "av":"19",
                     "cs":"0",
                     "version":"1.0.0",
                     "sign":"2|2258351182",
                     "username":"test",
                     "appVersion":"40",
                     "elapsedtime":"2085632199",
                     "token":"OTZlOGRjOGQyZjM4NTIxMmM2MjIuNTI1OTI3NS4xNDQ4MjYxMzQ2MjYx",
                     "openid":"880461d865bd98c5",
                     "uuid":"test"
                   /* "model": "vivo+X5Max+",
                    "imei": "867702027896706",
                    "logged": "true",
                    "av": "19",
                    "cs": "0",
                    "version": "1.0.0",
                    "sign": "2|1151195195",
                    "username": "test",
                    "appVersion": "38",
                    "elapsedtime": "384191993",
                    "token": "MzhiNGQwYWRmZjQ5N2UwNjJiNTQuNTI1OTI3NS4xNDQ4NzAwNTk5OTAy",
                    "openid": "880461d865bd98c5",
                    "uuid": "test"*/
                    /* "model":["vivo+X5Max+"],"imei":["867702027896706"],"logged":["true"],"av":["19"],"cs":["0"],"version":["1.0.0"],"sign":["2|1151195195"],"username":["test"],"appVersion":["38"],"elapsedtime":["384191993"],"token":["MzhiNGQwYWRmZjQ5N2UwNjJiNTQuNTI1OTI3NS4xNDQ4NzAwNTk5OTAy"],"openid":["880461d865bd98c5"],"uuid":["test"]
                     */
                    /* "model":["vivo+Xplay3S"],"imei":["867320000022271"],"logged":["true"],"av":["19"],"cs":["0"],"version":["1.0.0"],"sign":["2|2258351182"],"username":["test"],"appVersion":["40"],"elapsedtime":["2085632199"],"token":["OTZlOGRjOGQyZjM4NTIxMmM2MjIuNTI1OTI3NS4xNDQ4MjYxMzQ2MjYx"],"openid":["880461d865bd98c5"],"uuid":["test"]},
                     */

                  /*  "model":obj.model,
                    "imei":obj.imei,,
                    "logged":obj.logged,,
                    "av":obj.av,
                    "cs":obj.cs,,
                    "version":"1.0.0",
                    "sign":obj.sign,
                    "username":obj.username,
                    "appVersion":obj.appVersion,
                    "elapsedtime":obj.elapsedtime,
                    "token":obj.token,,
                    "openid":obj.openid,
                    "uuid":obj.uuid*/

                },
                    success:function(data){
                        var jsonResult = eval('(' + data+ ')');
                    if(jsonResult["respCode"]==200)
                    {
                        if(jsonResult["tickets"]){
                            for(i=0;j=jsonResult["tickets"].length,i<j;i++)
                            {
                                var validity=0;//标志即将过期
                                if(jsonResult["tickets"][i].amount>0){
                                    if(jsonResult["tickets"][i].endTime-jsonResult["tickets"][i].currentTime<=86400000&&jsonResult["tickets"][i].endTime-jsonResult["tickets"][i].currentTime>0)//等待接口测试
                                    {
                                        validity=1;
                                        var ablecoupon=Coupon.model();
                                        ablecoupon.addClass("current");
                                        $(".coupon-wrapper").append(ablecoupon);
                                        Coupon.ableCoupon(jsonResult,i,ablecoupon,validity);
                                        ablecoupon.removeClass("current");
                                        validity=0;
                                    }
                                    else  if(jsonResult["tickets"][i].endTime-jsonResult["tickets"][i].currentTime>86400000) {
                                        var ablecoupon=Coupon.model();
                                        ablecoupon.addClass("current");
                                        $(".coupon-wrapper").append(ablecoupon);
                                        Coupon.ableCoupon(jsonResult,i,ablecoupon,validity);
                                        ablecoupon.removeClass("current");
                                    }
                                }
                                else if(jsonResult["tickets"][i].amount==0){
                                    var unablecoupon=Coupon.model();
                                    unablecoupon.addClass("current");
                                    $(".coupon-wrapper").append(unablecoupon);
                                    Coupon.unableCoupon(jsonResult,i,unablecoupon);
                                    Coupon.usedCoupon(jsonResult,i,unablecoupon);
                                    unablecoupon.removeClass("current");
                                }

                            }
                        }
                    }
                        Coupon.couponFooter();
                }
            }
        );


       /* var jsonResult={
            "respCode": "200",
            "respMsg": "success",
            "result": true,
            "tickets": [
                {
                    "amount": "500",
                    "beginTime": 111111111,
                    "endTime": 12121221,
                    "currentTime":0,
                    "items": [
                        {
                            "desc": "全部订单可用",
                            "enabled": "0"
                        },
                        {
                            "desc": "太极熊猫可用",
                            "enabled": "0"
                        },
                        {
                            "desc": "使用期限:2015.08.05 - 2015.08.07",
                            "enabled": "0"
                        }
                    ],
                    "name": "5元礼券",
                    "ticketCode": "c11b8932fc98f6e3"
                }
            ]

             }
        }*/

    },
    overdueOutput:function(){
        var i,j;
        var obj=Coupon.Cookie;
        $.ajax({
            url:"http://192.168.2.230:1616/vcoin/game/tickets",
            type:"post",
            async:"false",
            data:{
               /* "appVersion": "38",
                "av": "19",
                "elapsedtime": "770990982",
                "imei": "867702027978405",
                "logged": "true",
                "model": "vivo%2BX5Max%2B",
                "openid": "880461d865bd98c5",
                "sign": "2%7C1248152093",
                "token": "NzY1YjZiNjc2M2EyOTM5MGJkN2IuNTI1OTI3NS4xNDUzMjgzNDIyNzY5",
                "username": "test",
                "uuid": "test",
                "version": "1.0.0",
                "cs":"0"*/
                "model":"vivo+Xplay3S",
                "imei":"867320000022271",
                "logged":"true",
                "av":"19",
                "cs":"0",
                "version":"1.0.0",
                "sign":"2|2258351182",
                "username":"test",
                "appVersion":"40",
                "elapsedtime":"2085632199",
                "token":"OTZlOGRjOGQyZjM4NTIxMmM2MjIuNTI1OTI3NS4xNDQ4MjYxMzQ2MjYx",
                "openid":"880461d865bd98c5",
                "uuid":"test"
               /* "model":"vivo+X5Max+",
                "imei":"867702027896706",
                "logged":"true",
                "av":"19",
                "cs":"0",
                "version":"1.0.0",
                "sign":"2|1151195195",
                "username":"test",
                "appVersion":"38",
                "elapsedtime":"384191993",
                "token":"MzhiNGQwYWRmZjQ5N2UwNjJiNTQuNTI1OTI3NS4xNDQ4NzAwNTk5OTAy",
                "openid":"880461d865bd98c5",
                "uuid":"test"*/
             /*   "model":["vivo+X5Max+"],"imei":["867702027896706"],"logged":["true"],"av":["19"],"cs":["0"],"version":["1.0.0"],"sign":["2|1151195195"],"username":["test"],"appVersion":["38"],"elapsedtime":["384191993"],"token":["MzhiNGQwYWRmZjQ5N2UwNjJiNTQuNTI1OTI3NS4xNDQ4NzAwNTk5OTAy"],"openid":["880461d865bd98c5"],"uuid":["test"]
*//*"model":["vivo+Xplay3S"],"imei":["867320000022271"],"logged":["true"],"av":["19"],"cs":["0"],"version":["1.0.0"],"sign":["2|2258351182"],"username":["test"],"appVersion":["40"],"elapsedtime":["2085632199"],"token":["OTZlOGRjOGQyZjM4NTIxMmM2MjIuNTI1OTI3NS4xNDQ4MjYxMzQ2MjYx"],"openid":["880461d865bd98c5"],"uuid":["test"]
         */

                /*  "model":obj.model,
                 "imei":obj.imei,,
                 "logged":obj.logged,,
                 "av":obj.av,
                 "cs":obj.cs,,
                 "version":"1.0.0",
                 "sign":obj.sign,
                 "username":obj.username,
                 "appVersion":obj.appVersion,
                 "elapsedtime":obj.elapsedtime,
                 "token":obj.token,,
                 "openid":obj.openid,
                 "uuid":obj.uuid*/
            },
            success:function(data){
                var jsonResult = eval('(' + data+ ')');
                if(jsonResult["respCode"]==200)
                {
                    if(jsonResult["tickets"]){
                        for(i=0;j=jsonResult["tickets"].length,i<j;i++)
                        {
                            var validity=0;//标志即将过期
                            if(jsonResult["tickets"][i].endTime-jsonResult["tickets"][i].currentTime<0)//等待接口测试
                            { var unablecoupon=Coupon.model();
                                unablecoupon.addClass("current");
                                $(".coupon-wrapper").append(unablecoupon);
                                Coupon.unableCoupon(jsonResult,i,unablecoupon);
                                Coupon.overdueCoupon(jsonResult,i,unablecoupon);
                                unablecoupon.removeClass("current");
                            }

                        }
                    }

                }
            }
        });
       /*  xmlhttp.onreadystatechange=function(){
         if(xmlhttp.readyState==4 && xmlhttp.status==200){
         var jsonResult = eval('(' + xmlhttp.responseText + ')');*/
      /*  var jsonResult={
            "respCode": "200",
            "respMsg": "success",
            "result": true,
            "tickets": [
                {
                    "amount": "500",
                    "beginTime": 111111111,
                    "endTime":0,
                    "currentTime":111111111,
                    "items": [
                        {
                            "desc": "全部订单可用",
                            "enabled": "0"
                        },
                        {
                            "desc": "太极熊猫可用",
                            "enabled": "0"
                        },
                        {
                            "desc": "使用期限:2015.08.05 - 2015.08.07",
                            "enabled": "0"
                        }
                    ],
                    "name": "5元礼券",
                    "ticketCode": "c11b8932fc98f6e3"
                }
            ]
        };*/

        /*     }
        };*/
       /* xmlhttp.open("POST","http://192.168.2.230:1616/vcoin/game/tickets",false);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send("appVersion=38&model=vivo%2BX5Max%2B&elapsedtime=770990982&cs=0&imei=867702027978405&av=19&version=1.0.0&logged=true&token=NzY1YjZiNjc2M2EyOTM5MGJkN2IuNTI1OTI3NS4xNDUzMjgzNDIyNzY5&openid=880461d865bd98c5&uuid=test&username=test&sign=2%7C1248152093");

 */   },
    addSign:function(obj){
        if(obj==null){
            obj={};
        }
        var status=$.cookie("status");
        obj.logged=(status=="1");
        obj.token=$.cookie("r");
        obj.openid=$.cookie("n");
        obj.uuid=$.cookie("q");
        obj.username=$.cookie("p");
        var sign=$.cookie("sign");
        if(!obj.sign&&sign){
            obj.sign=sign;
        }
        return obj;
    },
    addOtherMsg:function(obj){
        if(obj==null){
            obj={};
        }
        obj.appVersion=$.cookie("app_version");
        obj.model=$.cookie("model");
        obj.elapsedtime=$.cookie("elapsedtime");
        obj.cs=$.cookie("cs");
        obj.imei=$.cookie("imei");
        obj.av = $.cookie("av");
        return obj;
    },
    validity:function(endtime) {
        var currentTime = 0;   //此处等待从接口获取
        if (endtime - currentTime == 1) {
            return 0;
        }
        else if (endtime - currentTime > 1)
        {
            return 1;
        }else if(endtime-currentTime<0)
        {
            return - 1;
        }
    },
    couponFooter:function(){
        var div=$("<div></div>").addClass("more-coupon");
        var p=$("<p></p>").addClass("no-coupon");
        p.text("没有更多可用礼券了");
        var button= $("<a></a>").addClass("check");
        button.text("查看已过期礼券");
        button.prop("href","finish.html");
        div.append(p);
        div.append(button);
        $(".coupon-wrapper .coupon:last-child").after(div);
      /*  $(".coupon-wrapper").append(div);*/
    }
};

