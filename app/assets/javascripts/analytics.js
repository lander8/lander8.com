$(document).ready(function(){
  plotSalesData(30);

  // -- Sales Click Events -- //
  $('#salesChartShow').click(function(){
    setActiveInGroup(this);
    setActiveInGroup('.chart-nav.sales');
    setActiveInGroup('#sales30day');
    plotSalesData(30);
  });

  $('#sales30day').click(function(){
    setActiveInGroup(this);
    plotSalesData(30);
  });

  $('#sales7day').click(function(){
    setActiveInGroup(this);
    plotSalesData(7);
  });

  $('#sales1day').click(function(){
    setActiveInGroup(this);
    plotSalesData(1);
  });

  // -- Conversions Click Events -- //
  $('#conversionChartShow').click(function(){
    setActiveInGroup(this);
    setActiveInGroup('.chart-nav.conversions');
    plotConversionData();
  });
});

// Clears the chart completely (for use before adding a chart in its place)
function clearPreviousChart(chartID) {
	document.getElementById(chartID).innerHTML = "";
}

// Sets any given element as the active one in the group
function setActiveInGroup(element) {
  $(element).siblings().removeClass("active");
  $(element).addClass('active');
}

// ---------- BEGIN SALES CHART ---------- //

// Get all sales data
function fetchSalesData(){
  var result;

  $.ajax({
    async: false,
    type: 'GET',
    url: '/analytics/sales',
    success: function( data ){
      result = data;
    }
  })

  return result;
}

// Format sales for a given time
function generateSalesData(number_of_days) {
  var data = fetchSalesData();
  var rawData = {};

  // Generate the 30 days
  for (var i = 0; i < number_of_days; i++) {
    // Super long string formatting
    if (number_of_days > 1) {
      rawData[ (moment().subtract(i, 'days').format().substring(0, moment().subtract(i, 'days').format().indexOf("T"))) ] = 0
    } else {
      for (var j = 0; j < 24; j++) {
        rawData[ (moment().subtract(j, 'hours').format("YYYY-MM-DDTHH:00:00")) ] = 0
      }
    }
  }

  // Loop through all dates in array, add revenue to days that we have data for
  data[current_website].orders.map(function(order) {
    if (number_of_days > 1 && order.created_at.substring(0, order.created_at.indexOf("T")) in rawData) {
      rawData[order.created_at.substring(0, order.created_at.indexOf("T"))] += order.total
    } else if (moment(order.created_at).format("YYYY-MM-DDTHH:00:00") in rawData) {
      rawData[moment(order.created_at).format("YYYY-MM-DDTHH:00:00")] += order.total
    }
  })

  return Object.keys(rawData).map(function(key, index) {
    return {x: new Date(key), y: rawData[key]}
  }); 
}

// Shows basic sales data for the past 30 days
function plotSalesData(number_of_days) {
	clearPreviousChart('salesChart');
  try {
  	new Contour({
      el: '#salesChart',
      xAxis: { 
      	title: "Time",
      	type: 'time',
      	firstAndLast: true
      },
      yAxis: {
      	title: "Dollars in Sales",
        labels: { 
          formatter: function (datum) { 
            return '$' + datum 
          }
        }
      },
      tooltip: {
      	showTime: 300,
      	animate: true,
      	distance: 0,
        formatter: function(d) { 
          return '$' + d.y + ' in sales on <br>' + moment(d.x).format('dddd, MMMM Do YYYY ( HH:mm )') 
        }
      },
      line: {
        animationDirection: "bottom-to-top"
      }
    })
    .cartesian()
    .line([
    	{
    		name: "Sales Over Time",
        data: generateSalesData(number_of_days) // An array of objects
  	  }
    ])
    .tooltip()
    .render();
  } catch(e) {
    document.getElementById('salesChart').innerHTML = "No Data to show."
  }
}

// ---------- END SALES CHART ---------- //




// Shows conversion data
function plotConversionData() {
	clearPreviousChart('salesChart');

	new Contour({
    el: '#salesChart',
    xAxis: { 
    	title: "Time",
    	type: 'time',
    	firstAndLast: true
    },
    yAxis: {
    	title: "Conversions"
    },
    tooltip: {
    	showTime: 300,
    	animate: true,
    	distance: 0
    },
    line: {
      animationDirection: "bottom-to-top"
    }
  })
  .cartesian()
  .line([
  	{
  		name: "Conversions Over Time",
  		data: [
		  	{ x: new Date('1/1/2000'), y: 199122},
		    { x: new Date('2/1/2000'), y: 532323},
		    { x: new Date('3/1/2000'), y: 146112},
		    { x: new Date('4/1/2000'), y: 74443},
		    { x: new Date('5/1/2000'), y: 233443},
		    { x: new Date('6/1/2000'), y: 934434},
		    { x: new Date('7/1/2000'), y: 12323},
		    { x: new Date('8/1/2000'), y: 976112},
		    { x: new Date('9/1/2000'), y: 334443},
		    { x: new Date('10/1/2000'), y: 632343},
		    { x: new Date('11/1/2000'), y: 362323},
		    { x: new Date('12/1/2000'), y: 896112}
		  ]
	  }
  ])
  .tooltip()
  .render();
}
