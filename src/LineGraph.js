import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: true,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;

  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }


  return chartData;
};

function LineGraph({ casesType, country }) {
  const [data, setData] = useState({});
  const [Flag, setFlag] = useState(false);

  if (!country) {
    country = "all";
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=60`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.country || data.cases) {
            if (country !== "all") { data = data.timeline; }
            let chartData = buildChartData(data, casesType);
            setData(chartData);
          }
          else {
            setFlag(true);
            setData({});
          }
        });
    };

    fetchData();
  }, [casesType, country]);


  var graph_color;
  if (casesType === 'cases') {
    graph_color = "#CC1034";
  }
  else if (casesType === 'recovered') {
    graph_color = "#90ee90";
  }
  else {
    graph_color = "#555e55";
  }

  console.log("check flag", Flag);

  return (
    <div>

      {


        data.length > 0 ? (
          <Line
            data={{
              datasets: [
                {
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  borderColor: `${graph_color}`,
                  data: data,
                },
              ],
            }}
            options={options}
          />
        ) : <div Style="margin:4rem;">Recents updates unavailable.</div>
      }
    </div>
  );
}

export default LineGraph;