/**
 * Created by 10994375 on 2016/10/25.
 */
/**
 * downCount: Simple Countdown clock with offset
 * Author: Sonny T. <hi@sonnyt.com>, sonnyt.com
 */

(function ($) {

    $.fn.downCount = function (options, callback) {
        var settings = $.extend({
            now : null,
            date: null
        }, options);

        // Throw error if date is not set
        if (!settings.date) {
            $.error('Date is not defined.');
        }

        // Throw error if date is set incorectly
        if (!Date.parse(settings.date)) {
            $.error('Incorrect date format, it should look like this, 12/24/2012 12:00:00.');
        }

        // Save container
        var container = this;

        /**
         * Change client's local date to match offset timezone
         * @return {Object} Fixed Date object.
         */
        var currentDate = function () {
            // get client's current date
            var date = settings.now ? Date.parse(settings.now) : new Date();

            return date;
        };

        /**
         * Main downCount function that calculates everything
         */
        function countdown () {
            var target_date = new Date(settings.date), // set target date
                current_date = currentDate(); // get fixed current date

            // difference of dates
            var difference = target_date - current_date;

            // if difference is negative than it's pass the target date
            if (difference < 0) {
                // stop timer
                clearInterval(interval);

                if (callback && typeof callback === 'function') callback();

                return;
            }

            // basic math variables
            var _second = 1000,
                _minute = _second * 60,
                _hour = _minute * 60,
                _day = _hour * 24;

            // calculate dates
            var days = Math.floor(difference / _day),
                hours = Math.floor((difference % _day) / _hour),
                minutes = Math.floor((difference % _hour) / _minute),
                seconds = Math.floor((difference % _minute) / _second);

            // fix dates so that it will show two digets
            days = (String(days).length >= 2) ? days : '0' + days;
            hours = (String(hours).length >= 2) ? hours : '0' + hours;
            minutes = (String(minutes).length >= 2) ? minutes : '0' + minutes;
            seconds = (String(seconds).length >= 2) ? seconds : '0' + seconds;

            // set to DOM
            render(container.find('.days'),days);
            render(container.find('.hours'),hours);
            render(container.find('.minutes'),minutes);
            render(container.find('.seconds'),seconds);
        };

        //render number switch animation
        function render(target,value){
            if(!$(target).find("i").length){
                $(target).append($("<i></i><i></i>"))
            }
            if(!$(target).find("i").first().hasClass("num-"+String(value).charAt(0))){
                $(target).find("i").first().removeAttr("class").addClass("num-"+String(value).charAt(0));
            }
            if(!$(target).find("i").last().hasClass("num-"+String(value).charAt(1))){
                $(target).find("i").last().removeAttr("class").addClass("num-"+String(value).charAt(1));
            }
        }

        // start
        var interval = setInterval(countdown, 1000);
    };

})(Zepto);