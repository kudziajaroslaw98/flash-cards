'use client';
import { useChartResize } from '#/hooks/use-chart-resize';
import { useThemeContext } from '#/providers/theme-provider.component';
import { getWeeklyFocusTrends } from '#/shared/utils/charts/get-weekly-focus-trend';
import type { FocusSession } from '#/types/focus-session.type';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

export const WeeklyFocusChart = ({
  sessions,
}: {
  sessions: FocusSession[];
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const weeklyTrends = getWeeklyFocusTrends(sessions);
  const [width, setWidth] = useState(625);
  const [height, setHeight] = useState(200);
  const { isLightMode } = useThemeContext();

  const formatDurationFull = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  useChartResize(svgRef, () => {
    if (svgRef.current) {
      setWidth(
        svgRef.current.clientWidth > 625 ? 625 : svgRef.current.clientWidth,
      );
      setHeight(
        svgRef.current.clientHeight > 200 ? 200 : svgRef.current.clientHeight,
      );
    }
  });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 8, right: 8, bottom: 40, left: 48 };
    const tooltip = d3.select(tooltipRef.current);
    const columns = 7; // Days of week

    const axisColor = isLightMode ? '#4b5563aa' : '#e2e8f0bb'; // Change this for axis line color
    const gridColor = isLightMode ? '#e2e8f004' : '#e2e8f001'; // Change this for grid line color
    const textColor = isLightMode ? '#444' : '#ccc'; // Change this for axis text color

    svg.selectAll('*').remove();

    // #region Scales
    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(d3.range(columns).map(String))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - 40, margin.top]);

    // Create line generator
    const line = d3
      .line<{ day: string; ratio: number }>()
      .x((d) => (xScale(d.day) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.ratio))
      .curve(d3.curveMonotoneX);

    // Draw line
    svg
      .append('path')
      .datum(weeklyTrends)
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg
      .selectAll('circle')
      .data(weeklyTrends)
      .enter()
      .append('circle')
      .attr('cx', (d) => (xScale(String(d.day)) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(Number(d.ratio)) || 0)
      .attr('r', 4)
      .attr('fill', '#4ade80')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.0)
      .on('mouseover', function (event, d) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltip
          .style('opacity', 1)
          .html(
            `
                 Day: ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].at(parseInt(d.day))}<br/>
                 Active Time: ${formatDurationFull(d.active)}<br/>
                 Total Time: ${formatDurationFull(d.total)}<br/>
                 Ratio: ${(d.ratio * 100).toFixed(1)}%<br/>
                 `,
          )
          .style('left', `${mouseX + 10}px`)
          .style('top', `${mouseY - 28}px`)
          .style('background-color', isLightMode ? '#fff' : '#1f2937')
          .style('min-width', '200px')
          .style('z-index', '10000');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    // #endregion Scales

    // Add labels

    svg
      .append('text')
      .attr(
        'transform',
        `translate(${width / 2}, ${height - margin.bottom + 35})`,
      )
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', textColor)
      .text('Day of Week');

    svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', margin.left - 35)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', textColor)
      .text('Focus Ratio');

    // #region Grid
    // Add grid lines
    const gridLines = svg.append('g');

    // Horizontal grid lines
    gridLines
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-(height - margin.top - margin.bottom))
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', gridColor)
      .attr('stroke-opacity', 0.3);

    // Vertical grid lines
    gridLines
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', gridColor)
      .attr('stroke-opacity', 0.3);

    // #endregion Grid

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][+d]);
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(d3.range(0, 1.01, 0.2))
      .tickFormat(d3.format('.0%'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    svg
      .selectAll('.tick line')
      .attr('stroke', axisColor)
      .attr('stroke-width', 0.2);

    svg.selectAll('.domain').attr('stroke', axisColor).attr('stroke-width', 0);
  }, [width, height, weeklyTrends]);

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full max-w-[625px] justify-center'
    >
      <svg
        ref={svgRef}
        className='h-full w-full  max-w-[625px]'
      />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: 0,
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          pointerEvents: 'none',
          fontSize: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          transform: 'translate(0, -100%)', // Add this line
        }}
      />
    </div>
  );
};
