import type { ApexOptions } from 'apexcharts'

export const apexLineChartDefaultOption: ApexOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: { width: 3, curve: 'smooth' },
  dataLabels: { enabled: false },
  grid: { strokeDashArray: 4 },
  legend: { show: false },
}

export const apexBarChartDefaultOption: ApexOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  grid: { strokeDashArray: 4 },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '55%',
    },
  },
  legend: { show: false },
}

export const apexAreaChartDefaultOption: ApexOptions = {
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2, curve: 'smooth' },
  grid: { strokeDashArray: 4 },
  legend: { show: false },
}

export const apexSparklineChartDefaultOption: ApexOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false },
    sparkline: { enabled: true },
  },
  stroke: { width: 2, curve: 'smooth' },
  tooltip: { enabled: false },
}

export const apexDonutChartDefaultOption: ApexOptions = {
  chart: {
    type: 'donut',
  },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: { size: '70%' },
    },
  },
}

export const apexRadarChartDefultOption: ApexOptions = {
  chart: {
    type: 'radar',
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2 },
  legend: { show: false },
}
