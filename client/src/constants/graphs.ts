export interface GraphData {
  labels?: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: { x: string; y: number }[];
  fill: boolean;
  borderColor?: string;
  tension?: number;
}

export interface BarChartData {
  labels: string[];
  datasets: BarDataset[];
}

export interface BarDataset {
  label?: string;
  data: number[];
  fill: boolean;
  borderColor?: string | string[];
  backgroundColor?: string | string[];
  borderWidth?: number;
  maxBarThickness?: number;
  hoverBackgroundColor?: string | string[];
  hoverBorderColor?: string | string[];
}

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  type: any;
  label?: string;
  data: number[] | { x: string; y: number }[];
  fill: boolean;
  borderColor?: string | string[];
  backgroundColor?: string | string[];
  borderWidth?: number;
  maxBarThickness?: number;
  tension?: number;
  order?: number;
  hoverBackgroundColor?: string | string[];
  hoverBorderColor?: string | string[];
}
