import dynamic from "next/dynamic";
import React from "react";
import ChartHeader from "./ChartHeader";
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

class Charts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "Desktops",
          data: [
            // 130, 41, 97, 75, 35, 65, 25, 35, 130, 90, 200
          ],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "line",
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth',
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            gradientToColors: ["#FF5BEF"],
            shadeIntensity: 1,
            type: "horizontal",
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100],
          },
        },
        markers: {
          size: 6,
          colors: ["#fff"],
          strokeColors: "#AE8FF7",
          strokeWidth: 3,
          hover: {
            size: 10,
          },
        },
        tooltip: {
          followCursor: false,
          theme: "dark",
          x: {
            show: false,
          },
          marker: {
            show: true,
          },
          y: {
            title: {
              formatter: function () {
                return "";
              },
            },
          },
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
        },
        yaxis: {
          show: false,
          // logBase: 20,
          tickAmount: 6,
          min: 6,
        },
      },
    };
  }

  render() {
    return (
      <div className="bg-white p-3 rounded-2xl">
        <div style={{ width: "100%" }}>
          <ChartHeader />
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="line"
            height="300"
            width="100%"
          />
          <div className="flex justify-end items-center gap-3 pr-2">
            <button className="px-5 py-1 rounded font-bold text-primary border-2 border-primary hover:bg-[#FAFAFB]">
              After Math
            </button>
            <button className="px-5 py-1.5 rounded font-bold text-primary bg-[#F2E9FC] hover:bg-[#FAFAFB]">
              Sales
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Charts;
