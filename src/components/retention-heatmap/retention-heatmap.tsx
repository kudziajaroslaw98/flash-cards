'use client';

import { db } from '#/db/dexie.db';
import { useChartResize } from '#/hooks/use-chart-resize';
import { useThemeContext } from '#/providers/theme-provider.component';
import type { ReviewLog } from '#/types/review-log.type';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

const RetentionHeatmap = () => {
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [processedData, setProcessedData] = useState<
    { x: number; y: number; value: number; total: number; recalled: number }[]
  >([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const [width, setWidth] = useState(625);
  const [height, setHeight] = useState(200);
  const { isLightMode } = useThemeContext();

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
    if (!worker.current) return;
    worker.current.postMessage({ action: 'heatmap', items: reviewLogs });

    worker.current.onmessage = function (event) {
      setProcessedData(event.data.processedData);
    };
  }, [reviewLogs]);

  useEffect(() => {
    worker.current = new Worker(
      new URL('../../workers/heatmap-worker.ts', import.meta.url),
    );
    const loadData = async () => {
      const logs = await getWeeklyReviewLogs();
      setReviewLogs(logs);
    };
    loadData();

    return () => {
      worker.current!.terminate();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();

    // Styling configuration
    const axisColor = isLightMode ? '#4b5563aa' : '#e2e8f0bb'; // Change this for axis line color
    const gridColor = isLightMode ? '#e2e8f004' : '#e2e8f001'; // Change this for grid line color
    const textColor = isLightMode ? '#444' : '#ccc'; // Change this for axis text color

    // Dimensions
    const margin = { top: 8, right: 8, bottom: 40, left: 48 };

    // Grid configuration (24 hours x 7 days)
    const columns = 24; // Hours
    const rows = 7; // Days of week
    const maxDotSize = 20;

    // Calculate dot size based on available width
    const columnWidth = Math.min(
      maxDotSize,
      (width - margin.left - margin.right) / columns,
    );
    const dotRadius = columnWidth / 2.5;

    // Scales (flipped axes)
    const xScale = d3
      .scaleBand()
      .domain(d3.range(columns).map(String))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(d3.range(rows).map(String))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // Color scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(['#4ade8000', '#4ade808a', '#4ade80ff']);

    // Create dots
    svg
      .selectAll('circle')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => (xScale(String(d.x)) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => (yScale(String(d.y)) || 0) + yScale.bandwidth() / 2)
      .attr('r', dotRadius)
      .attr('fill', (d) => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.0)
      .on('mouseover', function (event, d) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltip
          .style('opacity', 1)
          .html(
            `Hour: ${d.x}:00<br/>
                 Day: ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d.y]}<br/>
                 Retention: ${(d.value * 100).toFixed(1)}%<br/>
                 Reviews: ${d.total} (${d.recalled} recalled)`,
          )
          .style('left', `${mouseX + 10}px`)
          .style('top', `${mouseY - 28}px`)
          .style('background-color', isLightMode ? '#fff' : '#1f2937')
          .style('min-width', '200px')
          .style('z-index', '10000');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
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

    // labels
    svg
      .append('text')
      .attr(
        'transform',
        `translate(${width / 2}, ${height - margin.bottom + 35})`,
      )
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', textColor)
      .text('Hour of Day');

    svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', margin.left - 35)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', textColor)
      .text('Day of Week');

    // X Axis with styling
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(0, 24, width > 290 ? 3 : 4).map(String))
      .tickFormat((d) => `${d.padStart(2, '0')}:00`);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    // Y Axis with styling
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][+d]);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    svg.selectAll('.domain').attr('stroke', axisColor).attr('stroke-width', 0);

    // Tick line styling
    svg
      .selectAll('.tick line')
      .attr('stroke', axisColor)
      .attr('stroke-width', 0.2);
  }, [width, height, processedData, isLightMode]);

  async function getWeeklyReviewLogs() {
    // Get date range for current week
    const monthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    const today = new Date();
    const monthlyPeriod = new Date(Date.now() - monthInMilliseconds);
    const endOfToday = getEndOfDay(today).toISOString();

    // Dexie query
    return await db.reviewLogs
      .where('timestamp')
      .between(monthlyPeriod, endOfToday, true, true)
      .toArray();
  }

  function getEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full max-w-[625px] justify-center'
    >
      <svg
        ref={svgRef}
        className='h-full w-full max-w-[625px]'
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

export default RetentionHeatmap;
