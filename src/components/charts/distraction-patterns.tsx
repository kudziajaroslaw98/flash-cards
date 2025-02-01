'use client';
import { useChartResize } from '#/hooks/use-chart-resize';
import { useThemeContext } from '#/providers/theme-provider.component';
import { analyzeDistractionPatterns } from '#/shared/utils/charts/analyze-distraction-patterns';
import { FocusSession } from '#/types/focus-session.type';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

export const DistractionPatterns = ({
  sessions,
}: {
  sessions: FocusSession[];
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const patterns = analyzeDistractionPatterns(sessions);
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
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 8, right: 8, bottom: 40, left: 48 };
    const tooltip = d3.select(tooltipRef.current);
    const axisColor = isLightMode ? '#4b5563aa' : '#e2e8f0bb'; // Change this for axis line color
    const gridColor = isLightMode ? '#e2e8f004' : '#e2e8f001'; // Change this for grid line color
    const textColor = isLightMode ? '#444' : '#ccc'; // Change this for axis text color

    svg.selectAll('*').remove();

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(patterns.map((d) => d.hour.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(patterns, (d) => d.distractions) || 0])
      .range([height - margin.bottom, margin.top]);

    // Draw bars
    svg
      .selectAll('rect')
      .data(patterns)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.hour.toString()) || 0)
      .attr('y', (d) => yScale(d.distractions))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - margin.bottom - yScale(d.distractions))
      .attr('fill', '#4ade80')
      .attr('z-index', 10)
      .on('mouseover', function (event, d) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltip
          .style('opacity', 1)
          .html(
            `
                 Hour: ${d.hour}:00<br/>
                 Distractions: ${d.distractions}<br/>
                 `,
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
      .attr('stroke-opacity', 0.2);

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
      .attr('stroke-opacity', 0.2);

    //   labels
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
      .text('Distractions');

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(0, 24, 3).map(String))
      .tickFormat((d) => `${d.padStart(2, '0')}:00`);
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

    svg.selectAll('.domain').attr('stroke', axisColor).attr('stroke-width', 0);
    svg
      .selectAll('.tick line')
      .attr('stroke', axisColor)
      .attr('stroke-width', 0.2)
      .attr('z-index', 2);
  }, [width, height, patterns]);

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full max-w-[625px] justify-center'
    >
      <svg
        ref={svgRef}
        className='h-ful w-full max-w-[625px]'
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
