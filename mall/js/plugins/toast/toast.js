/**
 * Toast提示框
 * @parameters
 *option={
 * text 提示文本
 * color 字体颜色
 * fontSize 字体大小
 * backgroundColor 背景色
 * padding 提示框的内边距
 * borderRadius 边框圆角的半径
 * time 显示的时长，单位毫秒
 * }
 *
 * 使用方法，使用之前要依次加载zepto.min.js，fx.js，fx_methods.js和该js文件
 * var toast=new Toast({
 *  text:'xxxx',
 *  time:2000
 * });
 * toast.show();
 */
(function(global){
    'use strict';

    global.Toast=function(option){
        this.configuration={
            text:'亲，能提示点神马不',
            color:'white',
            fontSize:'.35rem',
            backgroundColor:'black',
            opacity:'0.7',
            padding:'.3rem',
            borderRadius:'14px',
            time:2000
        };
        $.extend(this.configuration,option);
    };

    $.extend(global.Toast.prototype,{
        createTemplate:function(){
            var style='color:'+this.configuration.color+';'
                    +'font-size:'+this.configuration.fontSize+';'
                    +'background-color:'+this.configuration.backgroundColor+';'
                    +'opacity:'+this.configuration.opacity+';'
                    +'padding:'+this.configuration.padding+';'
                    +'border-radius:'+this.configuration.borderRadius+';'
                    +'position: fixed;z-index:999;left: 50%;top: 50%;display:none;'
                    +'-webkit-transform: translate(-50%,-50%);'
                    +'-moz-transform: translate(-50%,-50%);'
                    +'-ms-transform: translate(-50%,-50%);'
                    +'-o-transform: translate(-50%,-50%);'
                    +'transform: translate(-50%,-50%);';
            var template='<div style="'+style+'">'
                    +this.configuration.text
                    +'</div>';
            return $(template);
        },
        addToDOM:function($template){
            $('body').append($template);
            $template.fadeIn();
        },
        removeFromDOM:function($template){
            $template.fadeOut(function(){
                $template.remove();
            });
        },
        show:function(){
            var $template=this.createTemplate(),that=this;
            this.addToDOM($template);
            setTimeout(function(){
                that.removeFromDOM($template);
            },this.configuration.time);
        }
    });
}(this));