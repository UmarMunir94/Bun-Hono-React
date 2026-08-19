import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

type PastelColor = 'purple' | 'yellow' | 'red' | 'green' | 'dark';

export interface PastelCardProps {
  color: PastelColor;
  title: string;
  value: string | number;
  percent?: number;
  chart?: {
    colors?: string[];
    categories: string[];
    series: number[];
    options?: ChartOptions;
  };
}


export default function PastelCard({ color, title, value, percent, chart }: PastelCardProps) {
  const theme = useTheme();
  const { mode } = useColorScheme();
  
  const shade = mode === 'dark' ? 'light' : 'main';
  const backgroundColor = theme.vars.palette.pastels?.[color]?.[shade] || '#FFFFFF';

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chart?.colors ?? [theme.palette.primary.main],
    stroke: { width: 0 },
    xaxis: { categories: chart?.categories || [] },
    tooltip: {
      y: { formatter: (val: number) => fNumber(val), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
    ...chart?.options,
  });

  const renderTrending = () => {
    if (percent === undefined) return null;
    return (
      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center', mt: 1 }}>
        <Iconify
          width={24}
          icon={
            percent < 0
              ? 'solar:double-alt-arrow-down-bold-duotone'
              : 'solar:double-alt-arrow-up-bold-duotone'
          }
          sx={{
            flexShrink: 0,
            color: 'success.main',
            ...(percent < 0 && { color: 'error.main' }),
          }}
        />
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
        <Box component="span" sx={{ typography: 'body2', opacity: 0.7 }}>
          last 7 days
        </Box>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        backgroundColor,
        boxShadow: 'none',
        // color: theme.vars.palette.text.primary,
        color: theme.palette.common.black,
        p: 3,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
          {value}
        </Typography>
        {renderTrending()}
      </Box>

      {chart && (
        <Chart
          type="bar"
          series={[{ data: chart.series }]}
          options={chartOptions}
          sx={{ width: 60, height: 40 }}
        />
      )}
    </Card>
  );
}
