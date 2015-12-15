(function(){
    'use strict';
    $('a.yuantong').on('tap',function(){
        $('form.yuantong').get(0).submit();
    });
    $('a.ems').on('tap',function(){
        $('form.ems').get(0).submit();
    });
}());