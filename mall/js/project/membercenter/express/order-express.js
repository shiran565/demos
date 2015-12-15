(function(){
    'use strict';
    $('.href_JDDF').on('tap',function(){
        window.location.href="http://jd-ex.com/";
    })
    $('.href_YTO').on('tap',function(){
        var trackNo = $(this).attr("trackNo");
        $('input[name=waybillNo]').val(trackNo);
        $('form.yuantong').get(0).submit();
    })
    $('.href_EMS').on('tap',function(){
        var trackNo = $(this).attr("trackNo");
        $('input[name=mailNum]').val(trackNo);
        $('form.ems').get(0).submit();
    })
    $('.href_SF').on('tap',function(){
        var trackNo = $(this).attr("trackNo");
        window.location.href="http://www.sf-express.com/cn/sc/dynamic_functions/waybill/#search/bill-number/"+trackNo;
    })
}());