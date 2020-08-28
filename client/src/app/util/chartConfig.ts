 export const ChartOptions  = {
   bp: {
    scaleShowVerticalLines:false,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            left: 5,
            right: 20,
            top: 0,
            bottom: 0
        }
    },
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          color: 'white'
        },
        ticks: {
          fontSize: 10,
          fontColor: 'lightgrey'
        }
      }],
      yAxes: [{
        gridLines: {
          drawBorder: false,
          color: 'white'
        },
        ticks: {
          beginAtZero: false,
          fontSize: 10,
          fontColor: 'lightgrey',
          maxTicksLimit: 100,
          padding: 10,
          suggestedMin: 20,
          suggestedMax: 200
        }
      }]
    },
    tooltips: {
      backgroundColor: '#bbf7f0'
    }
   },
   temp: {
    scaleShowVerticalLines:false,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
        }
    },
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          color: 'white'
        },
        ticks: {
          fontSize: 10,
          fontColor: 'lightgrey'
        }
      }],
      yAxes: [{
        gridLines: {
          drawBorder: false,
          color: 'white'
        },
        ticks: {
          beginAtZero: false,
          fontSize: 10,
          fontColor: 'lightgrey',
          maxTicksLimit: 50,
          padding: 10,
          suggestedMin: 10,
          suggestedMax: 60
        }
      }]
    },
    tooltips: {
      backgroundColor: '#bbf7f0'
    }
   },
   pulse: {
    scaleShowVerticalLines:false,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            left: 5,
            right: 30,
            top: 0,
            bottom: 0
        }
    },
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          drawBorder: false,
          color: 'white'
        },
        ticks: {
          fontSize: 10,
          fontColor: 'lightgrey'
        }
      }],
      yAxes: [{
        gridLines: {
          drawBorder: false,
          color: 'white'
        },
        ticks: {
          beginAtZero: false,
          fontSize: 10,
          fontColor: 'lightgrey',
          maxTicksLimit: 20,
          padding: 10,
          suggestedMin: 5,
          suggestedMax: 20
        }
      }]
    },
    tooltips: {
      backgroundColor: '#bbf7f0'
    }
   }
};