'use client';

import { db } from '#/db/dexie.db';
import { useThemeContext } from '#/providers/theme-provider.component';
import * as d3 from 'd3';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef } from 'react';

const RetentionHeatmap = () => {
  const dailyStats = useLiveQuery(() => db.dailyStats.toArray()) ?? [];
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLightMode } = useThemeContext();

  useEffect(() => {
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

    // Process data with flipped axes
    const gridData = dailyStats.map((stat) => ({
      x: new Date(stat.date).getHours(), // Hour (0-23)
      y: new Date(stat.date).getDay(), // Day of week (0-6)
      value: stat.retention,
      date: stat.date,
    }));

    // Create dots
    svg
      .selectAll('circle')
      .data(gridData)
      .enter()
      .append('circle')
      .attr('cx', (d) => (xScale(String(d.x)) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => (yScale(String(d.y)) || 0) + yScale.bandwidth() / 2)
      .attr('r', dotRadius)
      .attr('fill', (d) => colorScale(d.value))
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 0.0)

      .on('mouseover', (event: MouseEvent, d) => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;
        tooltip
          .style('opacity', 1)
          .style('background-color', isLightMode ? '#f9fafb' : '#020617')
          .style(
            'border',
            isLightMode ? '1px solid #e2e8f0' : '1px solid #4b5563',
          )
          .html(
            `${d3.timeFormat('%A %H:00')(new Date(d.date))}<br/>
                 Retention: ${(d.value * 100).toFixed(1)}%`,
          )
          .style('left', `${mouseX + 5}px`)
          .style('top', `${mouseY - 20}px`);
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
  }, [dailyStats, isLightMode]);

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
