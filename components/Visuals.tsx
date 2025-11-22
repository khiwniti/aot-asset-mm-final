import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { VisualContext } from '../types';

interface VisualsProps {
  visualData: VisualContext | null;
}

const Visuals = ({ visualData }: VisualsProps) => {
  if (!visualData || !visualData.data) {
    return null;
  }

  const { chartType, data } = visualData;

  if (chartType === 'pie') {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.series || []
      }]
    };

    return (
      <div className="h-[300px] w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    );
  }

  if (chartType === 'area' || chartType === 'line') {
    const seriesData = data.series || [];
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: seriesData.map((d: any) => d.name || '')
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        type: chartType === 'area' ? 'line' : 'line',
        data: seriesData.map((d: any) => d.value || 0),
        areaStyle: chartType === 'area' ? {} : undefined
      }]
    };

    return (
      <div className="h-[300px] w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    );
  }

  return null;
};

export default Visuals;
