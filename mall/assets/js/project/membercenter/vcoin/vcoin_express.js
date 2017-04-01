(function(){
    'use strict';
    $('.href_JDDF').on('click',function(){
        window.location.href="http://jd-ex.com/";
    })
    $('.href_YTO,.href_YTOS').on('click',function(){
        var trackNo = $(this).attr("trackNo");
        $('input[name=waybillNo]').val(trackNo);
        $('form.yuantong').get(0).submit();
    })
    $('.href_EMS,.href_EMSDF').on('click',function(){
        var trackNo = $(this).attr("trackNo");
        $('input[name=mailNum]').val(trackNo);
        $('form.ems').get(0).submit();
    })
    $('.href_SF,.href_SFDF').on('click',function(){
        var trackNo = $(this).attr("trackNo");
        window.location.href="http://www.sf-express.com/cn/sc/dynamic_functions/waybill/#search/bill-number/"+trackNo;
    })
}());