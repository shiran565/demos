new AreaPicker("#city-picker");

var linkage = new AreaLinkage("#area-linkage");
linkage.setValue(["江苏", "南京", "建邺区"]);

new DatePicker("#date-picker", {
	defaultDate: new Date(1990, 0, 1),
	startDate: new Date(1950, 0, 1),
	endDate: new Date()
});