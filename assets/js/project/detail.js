/**
 * Created by Administrator on 2015/7/3.
 */
$(function(){

    (function(){
        $("#J_gallery img").eq(0).on("load", function () {
            var width = $("#J_gallery").width();
            var height = $(this).parent().height()+20;
            $("#J_gallery").width(width)
                .height(height)
                .css("overflow","hidden")
                .perfectScrollbar();

        });
    }())





});