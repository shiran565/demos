$(function(){
    //评星操作
    $('dl').on('tap',function(e){
        var $target=$(e.target),active_class='active',tag_name='dd';
        if($target.is(tag_name)){
            var $current;
            for($current=$target;$current.size()>0;$current=$current.next()){
                $current.addClass(active_class);
            }
            for($current=$target.prev();$current.is(tag_name);$current=$current.prev()){
                $current.removeClass(active_class);
            }
        }
    });


    $('.evaluate-submit').on('tap', function() {
        var remarkList = [];

        var checked = true;

        $('li.container').each(function (){

            var remark = {};
            remark["spuId"] = $(this).attr("spuId");
            remark["skuId"] = $(this).attr("skuId");
            remark["spuTitle"] = $(this).attr("spuTitle");
            remark["orderNo"] = $(this).attr("orderNo");

            $(this).find('ul.star-box dt').each(function(){
                var score = $(this).siblings('dd.active').size();
                if(score == 0){
                    checked = false;
                    return false;
                }
                remark[$(this).attr("key")] = score;
            });
            if (!checked){
                new Toast({
                    text:'您的评星是我们前进的动力！',
                    time:2000
                }).show();
                return false;
            }

            remark["content"] = $(this).find('.evaluate-text-context').val();
            if (remark["content"].length < 2 || remark["content"].length > 200) {
                checked = false;
                new Toast({
                    text: '麻烦填写2-200字哦！',
                    time: 2000
                }).show();
                return false;
            }

            remark["hasPicture"] = 0;

            remarkList.push(remark);

        });

        if(!checked){ return; }

        $.ajax({
            url: "add",
            type: "POST",
            traditional: true,
            data: JSON.stringify(remarkList),
            dataType: "json",contentType:"application/json",
            success: function (result) {
                if (result.retCode == 200) {
                    new Toast({
                        text:"您的评价已经提交，感谢您的评价！",
                        time:3000
                    }).show();
                    window.location.href = webCtx + "/my/order";
                } else {

                }
            },
            error: function () {

            }
        });

    });

    // 评论字数实时显示
    $("body").on("input propertychange", ".evaluate-text-context", function(){
        var length = $(this).val().length;

        if (length >= 200){
            $(this).val( $(this).val().substr(0, 200) );
        }
        length = $(this).val().length;
        $(this).next("p").find("em").text(length);
    });

    //确保textarea输入完后滚动条始终处在最下方
    $('textarea').on('blur',function(){
        var $submit;
        $(this).scrollTop(this.scrollHeight);
        //解决UC浏览器当textarea失去焦点时，底部悬浮框只显示部分的bug
        if(navigator.userAgent.indexOf("UCBrowser")>=0){
            $submit=$('#content .submit');
            $submit.hide();
            setTimeout(function(){
                $submit.show();
            },40);
        }
    });

    //获取元素的样式
    //function getStyle(ele,attr){
    //    if(ele.currentStyle){
    //        return ele.currentStyle[attr];
    //    }else{
    //        return document.defaultView.getComputedStyle(ele,null)[attr];
    //    }
    //}

    //当content区域过短时，自动加长
    //var header=$('#header')[0],
    //    $main=$('#main'),
    //    body=document.body,
    //    body_height,
    //    html_height=document.documentElement.clientHeight,
    //    h,
    //    $last_container=$main.find('.container:last'),
    //    original_padding_bottom=parseFloat(getStyle($last_container[0],'padding-bottom')),
    //    blur_padding_bottom,
    //    init=true,
    //    focused=false;
    //function resetContentHeight(){
    //    body_height=header.offsetHeight+parseFloat(getStyle(header,'margin-bottom'))
    //        +$main[0].clientHeight+parseFloat(getStyle(body,'padding-bottom'));
    //    h=html_height-body_height;
    //    if(h>0){
    //        $last_container[0].style.paddingBottom=original_padding_bottom+h+'px';
    //        if(init){
    //            blur_padding_bottom=original_padding_bottom+h;
    //            $last_container.find('textarea').on('tap',function(){
    //                if(!focused){
    //                    $last_container[0].style.paddingBottom = original_padding_bottom + 'px';
    //                    resetContentHeight();
    //                    focused=true;
    //                }
    //            }).on('blur',function(){
    //                $last_container[0].style.paddingBottom = blur_padding_bottom + 'px';
    //                focused = false;
    //            });
    //            init=false;
    //        }
    //    }
    //}
    //resetContentHeight();
});