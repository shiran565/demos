//(function(){
//    $('#nav').on('tap',function(e){
//        var $target_parent=$(e.target).parent();
//        if($target_parent.hasClass('extension')){
//            $target_parent.siblings().removeClass('active');
//            $('#content .extension').siblings().hide();
//            $target_parent.addClass('active');
//            $('#content .extension').show();
//        }else if($target_parent.hasClass('broken-screen')){
//            $target_parent.siblings().removeClass('active');
//            $('#content .broken-screen').siblings().hide();
//            $target_parent.addClass('active');
//            $('#content .broken-screen').show();
//        }
//    });
//}());

$(function(){
    $('#nav').on('tap',function(e){
        var $target_parent=$(e.target).parent();
        if($target_parent.hasClass('extension')){
            window.location.href = webCtx + "/helpcenter/extend-service";
        }else if($target_parent.hasClass('broken-screen')){
            window.location.href = webCtx + "/helpcenter/broken-screen";
        }
    });
});