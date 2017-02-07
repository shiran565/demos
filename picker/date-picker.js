/**
 * 调用示例
 * new DatePicker("#date-picker", {
 *	defaultDate: new Date(1990, 0, 1),
 *	startDate:new Date(1950,0,1),
 *	endDate:new Date()
 * });
 *
 */
+(function() {

	function DatePicker(target, options) {

		var that = this,
			defaultValues;

		options = options || {};

		//起止时间
		this.startDate = options.startDate || new Date(1950, 0, 1);
		this.endDate = options.endDate || new Date();

		if (options.defaultDate && options.defaultDate instanceof Date) {
			defaultValues = [];
			defaultValues.push(options.defaultDate.getFullYear());
			defaultValues.push(("0" + options.defaultDate.getMonth() + 1).slice(-2));
			defaultValues.push(('0' + options.defaultDate.getDate()).slice(-2));
		}

		new Picker(target, [{
			values: this.getYears()
		}, {
			values: ['']
		}, {
			values: ['']
		}], {
			splitWith: '-',
			defaultValues: defaultValues,
			onChange: function(picker, column) {
				var columnLength = picker.pickerColumns.length,
					columnIndex = column.columnIndex,
					values = picker.values;
				if (column && columnIndex < columnLength) {
					//年
					if (columnIndex == 0) {
						picker.setColumnValues(1, that.getMonths(parseInt(values[0])));
					} else if (columnIndex == 1) { //市
						picker.setColumnValues(2, that.getDates(parseInt(values[0]), parseInt(values[1])));
						//默认值已经设置完毕，清空
						picker.defaultValues = null;
					} else { //区
						picker.$target.val(values.join("-"));
					}
				}
			}
		});
	}

	$.extend(DatePicker.prototype, {

		getYears: function() {
			var startYear = this.startDate.getFullYear(),
				endYear = this.endDate.getFullYear();

			return this.fillValues(startYear, endYear);
		},

		getMonths: function(year) {

			var startDate = this.startDate.getFullYear(),
				endDate = this.endDate.getFullYear(),
				startMonth = 1,
				endMonth = 12;

			if (year == this.startDate.getFullYear()) {
				startMonth = this.startDate.getMonth() + 1;
				endMonth = 12;
			} else if (year == this.endDate.getFullYear()) {
				startMonth = 1;
				endMonth = this.endDate.getMonth() + 1;
			}

			return this.fillValues(startMonth, endMonth);
		},

		getDates: function(year, month) {

			var monthEndDate = this.getMonthEndDate(year, month),
				startDate, endDate;


			if (year == this.startDate.getFullYear() && month == (this.startDate.getMonth() + 1)) {
				startDate = this.startDate.getDate();
				endDate = monthEndDate;
			} else if (year == this.endDate.getFullYear() && month == (this.endDate.getMonth() + 1)) {
				startDate = 1;
				endDate = this.endDate.getDate();
			} else {
				startDate = 1;
				endDate = monthEndDate;
			}
			return this.fillValues(startDate, endDate);
		},

		fillValues: function(start, end) {
			var values = [];
			for (var i = start; i <= end; i++) {
				values.push(String(i < 10 ? ("0" + i) : i));
			}
			return values;
		},

		isLeapYear: function(year) {
			year = parseInt(year);
			return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
		},

		isShortMonth: function(month) {
			month = parseInt(month);
			return ",4,6,9,11,".indexOf("," + month + ",") > -1;
		},

		getMonthEndDate: function(year, month) {
			if (this.isShortMonth(month)) {
				return 30;
			} else if (month === 2) {
				return this.isLeapYear(year) ? 29 : 28;
			} else {
				return 31;
			}
		}
	});

	window.DatePicker = DatePicker;

}());