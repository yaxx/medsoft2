 export const ChartOptions  = {
   bp: {
    scaleShowVerticalLines: false,
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
    scaleShowVerticalLines: false,
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
    scaleShowVerticalLines: false,
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
   },
   resp: {
    scaleShowVerticalLines: false,
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
 export const pulseDataConfig = (data) => [{
    label: 'Pulse Rate',
    data,
    tension: 1.0,
    bezierCurve : true,
    lineTension: 0.4,
    borderColor: 'lightblue',
    hoverBackgroundColor: 'dodgerblue',
    hoverBorderColor: 'dodgerblue',
    color: 'ghostwhite',
    zeroLineColor: 'ghostwhite',
    fill: false,
    pointRadius: 4,
    borderWidth: 0,
    pointBackgroundColor: (context) => {
      const index = context.dataIndex;
      const value = context.dataset.data[index];
      return (value > 100 || value < 60 && value > 0) ? 'red' : 'transparent';
    }
}];
 export const tempDataConfig = (data) => [{
    label: 'Tempreture',
    data,
    tension: 1.0,
    bezierCurve : true,
    lineTension: 0.4,
    borderColor: 'lightblue',
    hoverBackgroundColor: 'dodgerblue',
    hoverBorderColor: 'dodgerblue',
    color: 'ghostwhite',
    zeroLineColor: 'ghostwhite',
    fill: false,
    pointRadius: 4,
    borderWidth: 0,
    pointBackgroundColor: (context) => {
      const index = context.dataIndex;
      const value = context.dataset.data[index];
      return value > 38 ? 'red' : 'transparent';
    }
}];

