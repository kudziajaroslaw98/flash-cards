import type { DailyStat } from '#/types/daily-stat.type';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const RetentionHeatmap = ({ dailyStats }: { dailyStats: DailyStat[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();

    // Dimensions
    const width = svgRef.current.clientWidth;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 50, left: 50 };

    // Grid dimensions
    const columns = 7; // Days of week
    const rows = 24; // Time segments

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(d3.range(columns).map(String))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleBand()
      .domain(d3.range(rows).map(String))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    // Color scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(['#ff0000', '#ffff00', '#00ff00']);

    // Process data into grid format
    const gridData = dailyStats.map((stat) => ({
      x: new Date(stat.date).getDay(), // Day of week (0-6)
      y: new Date(stat.date).getHours(), // Hour of day (0-23)
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
      .attr('r', Math.min(xScale.bandwidth(), yScale.bandwidth()) * 0.4)
      .attr('fill', (d) => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(
            `${d3.timeFormat('%A %H:00')(new Date(d.date))}<br/>
                 Retention: ${(d.value * 100).toFixed(1)}%`,
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    // X Axis (Days of week)
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][+d]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    // Y Axis (Hours)
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}:00`);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2}, ${height - 10})`)
      .style('text-anchor', 'middle')
      .text('Day of Week');

    svg
      .append('text')
      .attr('transform', `rotate(-90) translate(${-height / 2}, 20)`)
      .style('text-anchor', 'middle')
      .text('Hour of Day');
  }, [dailyStats]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '500px' }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: 0,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          pointerEvents: 'none',
          fontSize: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
};

export default RetentionHeatmap;
