$(function(){
    var all_class='all',
        no_pay_class='no-pay',
        no_receive_class='no-receive',
        completed_class='completed',
        closed_class='closed',
        default_hide_class='hide',
        $container=$('#content .container'),
        $no_pay=$('#content .'+no_pay_class),
        $no_receive=$('#content .'+no_receive_class),
        $completed=$('#content .'+completed_class),
        $closed=$('#content .'+closed_class),
        $nav_li=$('#nav li'),
        $default=$('#default'),
        $default_p=$default.find('p');

    //nav切换
    $('#nav ul').on('tap',function(e){
        var $target=$(e.target);
        if($target.is('a')){
            $nav_li.removeClass('active');
            $target.parent().addClass('active');
            if($container.size()===0){
                return;
            }
            $container.hide();
            $default.addClass(default_hide_class);
            switch(true){
                case $target.hasClass(all_class):
                    $container.show();
                    break;
                case $target.hasClass(no_pay_class):
                    if($no_pay.size()){
                        $no_pay.show();
                    }else{
                        $default_p.text('您暂无待付款的订单');
                        $default.removeClass(default_hide_class);
                    }
                    break;
                case $target.hasClass(no_receive_class):
                    if($no_receive.size()){
                        $no_receive.show();
                    }else{
                        $default_p.text('您暂无待收货的订单');
                        $default.removeClass(default_hide_class);
                    }
                    break;
                case $target.hasClass(completed_class):
                    if($completed.size()){
                        $completed.show();
                    }else{
                        $default_p.text('您暂无已完成的订单');
                        $default.removeClass(default_hide_class);
                    }
                    break;
                case $target.hasClass(closed_class):
                    if($closed.size()){
                        $closed.show();
                    }else{
                        $default_p.text('您暂无已关闭的订单');
                        $default.removeClass(default_hide_class);
                    }
                    break;
            }
        }
    });
});