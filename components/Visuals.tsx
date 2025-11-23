import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Map as MapIcon } from 'lucide-react';

interface VisualProps {
  data: any;
  theme?: 'light' | 'dark';
}

export const ChartVisual = ({ data, theme = 'dark' }: VisualProps) => {
  const isDark = theme === 'dark';
  
  // Common Colors (Power BI style palette)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  if (!data || !data.series) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">No chart data available</div>;
  }

  const commonOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: tooltipText, fontFamily: "'Plus Jakarta Sans', sans-serif" },
      borderWidth: 1,
      padding: 12,
      trigger: data.chartType === 'pie' ? 'item' : 'axis',
    },
    grid: {
      top: 30,
      left: 10,
      right: 20,
      bottom: 10,
      containLabel: true,
      borderColor: gridColor
    }
  };

  const getOption = () => {
    if (data.chartType === 'pie') {
      return {
        ...commonOption,
        legend: {
          bottom: '0%',
          left: 'center',
          textStyle: { color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }
        },
        series: [
          {
            name: data.title || 'Distribution',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: isDark ? '#0f172a' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                color: textColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              },
              itemStyle: {
                 shadowBlur: 10,
                 shadowOffsetX: 0,
                 shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: { show: false },
            data: data.series.map((item: any, index: number) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: colors[index % colors.length] }
            }))
          }
        ]
      };
    }

    if (data.chartType === 'bar') {
      const hasSeries2 = Array.isArray(data.series) && data.series.length > 0 && data.series[0]?.value2 !== undefined;
      return {
        ...commonOption,
        legend: {
            data: hasSeries2 ? ['Series 1', 'Series 2'] : undefined,
            textStyle: { color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" },
            top: 0
        },
        xAxis: {
          type: 'category',
          data: data.series.map((d: any) => d.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
          axisLabel: { 
            color: textColor,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            formatter: (val: number) => val >= 1000 ? `${val/1000}k` : val
          }
        },
        series: [
          {
            name: 'Series 1',
            data: data.series.map((d: any) => d.value),
            type: 'bar',
            itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#3b82f6' },
                    { offset: 1, color: '#1d4ed8' }
                ]),
                borderRadius: [4, 4, 0, 0] 
            },
            barMaxWidth: 40
          },
          ...(hasSeries2 ? [{
            name: 'Series 2',
            data: data.series.map((d: any) => d.value2),
            type: 'bar',
            itemStyle: { 
                color: isDark ? '#64748b' : '#cbd5e1',
                borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 40
          }] : [])
        ]
      };
    }

    // Area Chart (Trend)
    return {
      ...commonOption,
      tooltip: {
        ...commonOption.tooltip,
        axisPointer: {
          type: 'cross',
          label: { backgroundColor: '#6a7985' }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.series.map((d: any) => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: { color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }
      },
      series: [
        {
          name: data.title || 'Trend',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: { width: 3, color: '#3b82f6' },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.series.map((d: any) => d.value)
        }
      ]
    };
  };

  return (
    <div className="w-full h-full min-h-[250px]">
       <ReactECharts 
         option={getOption()} 
         style={{ height: '100%', width: '100%' }} 
         theme={isDark ? 'dark' : undefined}
       />
    </div>
  );
};

export const MapVisual = ({ data, theme = 'dark' }: VisualProps) => {
    const isDark = theme === 'dark';
    
    return (
     <div className="h-full flex flex-col relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 opacity-20">
           <svg viewBox="0 0 800 600" className="w-full h-full">
              <defs>
                 <pattern id={`grid-${theme}`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${theme})`} />
           </svg>
        </div>
        
        <div className="flex-1 relative z-10 flex items-center justify-center">
           <div className={`relative w-[80%] h-[80%] border rounded-xl backdrop-blur-sm p-4
              ${isDark ? 'border-slate-700/50 bg-slate-900/50' : 'border-slate-200/50 bg-white/50'}`}>
              
              <div className={`w-full h-full rounded flex items-center justify-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                 <MapIcon size={64} className="animate-pulse opacity-50" />
                 <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-mono">LOADING GEOSPATIAL DATA...</span>
              </div>
              
              {/* Floating Stats */}
              <div className={`absolute top-4 right-4 p-3 rounded-lg border shadow-xl
                  ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                 <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Avg Price/sqm</div>
                 <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>฿85,000</div>
              </div>
              <div className={`absolute bottom-4 left-4 p-3 rounded-lg border shadow-xl
                   ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                 <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Demand Score</div>
                 <div className="text-lg font-bold text-green-400">High (8.5)</div>
              </div>
           </div>
        </div>
     </div>
  );
}