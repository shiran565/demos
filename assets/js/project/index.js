/**
 * Created by Administrator on 2015/6/8.
 */
define(function(require,exports,module){
    var $ = require("$");
    $(function () {
        $("#J_submitForm").on({"touchstart":function(){
            $(this).addClass("pass-button-full-disabled");
        },"touchend touchcancel":function(){
            $(this).removeClass("pass-button-full-disabled");
        }});
    })
});