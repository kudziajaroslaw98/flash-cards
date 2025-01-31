'use client';

import { db } from '#/db/dexie.db';
import { useThemeContext } from '#/providers/theme-provider.component';
import type { ReviewLog } from '#/types/review-log.type';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

async function getWeeklyReviewLogs() {
  // Get date range for current week
  const today = new Date();
  const startOfWeek = getStartOfWeek(today).toISOString();
  const endOfToday = getEndOfDay(today).toISOString();

  console.log(today, startOfWeek, endOfToday);

  // Dexie query
  return await db.reviewLogs
    .where('timestamp')
    .between(startOfWeek, endOfToday, true, true)
    .toArray();
}

// Helper functions
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sunday) - 6 (Saturday)
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

const RetentionHeatmap = () => {
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLightMode } = useThemeContext();

  const processedData = useMemo(() => {
    // Aggregates reviews into hourly buckets
    const hourlyCounts = new Map<string, { total: number; recalled: number }>();

    reviewLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      // Count total reviews and successful recalls
      if (!hourlyCounts.has(key)) {
        hourlyCounts.set(key, { total: 0, recalled: 0 });
      }

      const counts = hourlyCounts.get(key)!;
      counts.total++;
      if (log.recalled) counts.recalled++;
    });

    // Convert to heatmap format with retention rate
    const x = Array.from(hourlyCounts.entries()).map(([key, counts]) => {
      const [day, hour] = key.split('-').map(Number);
      return {
        x: hour,
        y: day,
        value: counts.total > 0 ? counts.recalled / counts.total : 0,
        total: counts.total,
        recalled: counts.recalled,
      };
    });
    console.log(x);

    return x;
  }, [reviewLogs]);

  useEffect(() => {
    const loadData = async () => {
      const logs = await getWeeklyReviewLogs();
      console.log(logs);
      setReviewLogs(logs);
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log(processedData);
    if (!svgRef.current || !tooltipRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();

    // Styling configuration
    const axisColor = isLightMode ? '#4b5563' : '#e2e8f0'; // Change this for axis line color
    const gridColor = isLightMode ? '#e2e8f011' : '#e2e8f011'; // Change this for grid line color
    const textColor = isLightMode ? '#444' : '#ccc'; // Change this for axis text color

    // Dimensions
    const width =
      svgRef.current.clientWidth > 625 ? 625 : svgRef.current.clientWidth;
    const height = 200;
    const margin = { top: 16, right: 16, bottom: 48, left: 64 };

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
      .attr('stroke-width', 0.8)
      .on('mouseover', function (event, d) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltip
          .style('opacity', 1)
          .html(
            `Hour: ${d.x}:00<br/>
                 Day: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.y]}<br/>
                 Retention: ${(d.value * 100).toFixed(1)}%<br/>
                 Reviews: ${d.total} (${d.recalled} recalled)`,
          )
          .style('left', `${mouseX + 10}px`)
          .style('top', `${mouseY - 28}px`);
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
      .attr('stroke-opacity', 0.5);

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
      .attr('stroke-opacity', 0.5);

    // X Axis with styling
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(0, 24, 3).map(String))
      .tickFormat((d) => `${d.padStart(2, '0')}:00`);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', textColor);

    // Y Axis with styling
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][+d]);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', textColor);

    // Axis line styling
    svg.selectAll('.domain').attr('stroke', axisColor).attr('stroke-width', 0);

    // Tick line styling
    svg
      .selectAll('.tick line')
      .attr('stroke', axisColor)
      .attr('stroke-width', 0.2);
  }, [processedData, isLightMode]);

  return (
    <div
      ref={containerRef}
      className='relative flex w-full justify-center'
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <svg
        ref={svgRef}
        style={{ width: '100%', maxWidth: '625px', height: '200px' }}
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
