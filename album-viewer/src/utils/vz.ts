import * as d3 from 'd3'

type SalesPoint = {
	year: number
	month: number | string
	albumsSold: number
	sellingPrice: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function normalizeMonth(month: number | string): number {
	if (typeof month === 'number') {
		return month >= 1 && month <= 12 ? month - 1 : -1
	}

	const normalized = month.trim().slice(0, 3).toLowerCase()
	const index = MONTHS.findIndex((m) => m.toLowerCase() === normalized)
	return index
}

function asNumber(value: unknown): number {
	return typeof value === 'number' ? value : Number(value)
}

export async function renderAlbumSalesPlot(container: HTMLElement, dataUrl: string): Promise<void> {
	const raw = await d3.json<SalesPoint[]>(dataUrl)

	if (!Array.isArray(raw) || raw.length === 0) {
		throw new Error('Sales data source is empty or invalid.')
	}

	const data = raw
		.map((d) => {
			const monthIndex = normalizeMonth(d.month)
			return {
				year: asNumber(d.year),
				monthIndex,
				albumsSold: asNumber(d.albumsSold),
				sellingPrice: asNumber(d.sellingPrice)
			}
		})
		.filter((d) => d.monthIndex >= 0 && d.year > 0)

	if (data.length === 0) {
		throw new Error('No valid sales points were found in the JSON payload.')
	}

	const soldByMonth = d3.rollups(
		data,
		(points) => d3.sum(points, (p) => p.albumsSold),
		(d) => d.monthIndex
	)

	const soldMonthMap = new Map<number, number>(soldByMonth)
	const soldSeries = MONTHS.map((month, index) => ({
		month,
		monthIndex: index,
		albumsSold: soldMonthMap.get(index) ?? 0
	}))

	const priceByYearMonth = d3.rollups(
		data,
		(points) => d3.mean(points, (p) => p.sellingPrice) ?? 0,
		(d) => d.year,
		(d) => d.monthIndex
	)

	const yearlyPriceSeries = priceByYearMonth
		.map(([year, points]) => {
			const monthMap = new Map<number, number>(points)
			return {
				year,
				points: MONTHS.map((month, monthIndex) => ({
					month,
					monthIndex,
					sellingPrice: monthMap.get(monthIndex) ?? 0
				}))
			}
		})
		.sort((a, b) => a.year - b.year)

	const width = Math.max(container.clientWidth || 900, 700)
	const height = 460
	const margin = { top: 40, right: 90, bottom: 70, left: 70 }

	d3.select(container).selectAll('*').remove()

	const svg = d3
		.select(container)
		.append('svg')
		.attr('viewBox', `0 0 ${width} ${height}`)
		.attr('width', '100%')
		.attr('height', height)

	const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
	const innerWidth = width - margin.left - margin.right
	const innerHeight = height - margin.top - margin.bottom

	const x = d3
		.scaleBand<string>()
		.domain(MONTHS)
		.range([0, innerWidth])
		.padding(0.2)

	const maxSold = d3.max(soldSeries, (d) => d.albumsSold) ?? 0
	const ySold = d3
		.scaleLinear()
		.domain([0, Math.max(maxSold * 1.15, 10)])
		.nice()
		.range([innerHeight, 0])

	const maxPrice =
		d3.max(yearlyPriceSeries, (series) => d3.max(series.points, (p) => p.sellingPrice) ?? 0) ?? 0

	const yPrice = d3
		.scaleLinear()
		.domain([0, Math.max(maxPrice * 1.15, 1)])
		.nice()
		.range([innerHeight, 0])

	const color = d3.scaleOrdinal<number, string>(d3.schemeTableau10).domain(yearlyPriceSeries.map((d) => d.year))

	chart
		.append('g')
		.attr('transform', `translate(0,${innerHeight})`)
		.call(d3.axisBottom(x))
		.selectAll('text')
		.style('font-size', '12px')

	chart.append('g').call(d3.axisLeft(ySold).ticks(6))
	chart.append('g').attr('transform', `translate(${innerWidth},0)`).call(d3.axisRight(yPrice).ticks(6))

	chart
		.append('g')
		.attr('stroke', 'rgba(255,255,255,0.15)')
		.selectAll('line')
		.data(ySold.ticks(6))
		.join('line')
		.attr('x1', 0)
		.attr('x2', innerWidth)
		.attr('y1', (d) => ySold(d))
		.attr('y2', (d) => ySold(d))

	chart
		.selectAll('.bar')
		.data(soldSeries)
		.join('rect')
		.attr('class', 'bar')
		.attr('x', (d) => x(d.month) ?? 0)
		.attr('width', x.bandwidth())
		.attr('y', (d) => ySold(d.albumsSold))
		.attr('height', (d) => innerHeight - ySold(d.albumsSold))
		.attr('fill', 'rgba(255, 206, 86, 0.55)')

	const line = d3
		.line<{ month: string; monthIndex: number; sellingPrice: number }>()
		.x((d) => (x(d.month) ?? 0) + x.bandwidth() / 2)
		.y((d) => yPrice(d.sellingPrice))

	const lineGroup = chart
		.append('g')
		.selectAll('g')
		.data(yearlyPriceSeries)
		.join('g')

	lineGroup
		.append('path')
		.attr('fill', 'none')
		.attr('stroke-width', 2.2)
		.attr('stroke', (d) => color(d.year))
		.attr('d', (d) => line(d.points))

	lineGroup
		.selectAll('circle')
		.data((d) => d.points.map((p) => ({ ...p, year: d.year })))
		.join('circle')
		.attr('cx', (d) => (x(d.month) ?? 0) + x.bandwidth() / 2)
		.attr('cy', (d) => yPrice(d.sellingPrice))
		.attr('r', 3.2)
		.attr('fill', (d) => color(d.year))
		.append('title')
		.text((d) => `${d.year} ${d.month} - Selling Price: $${d.sellingPrice.toFixed(2)}`)

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', height - 18)
		.attr('text-anchor', 'middle')
		.attr('fill', '#f8f8f8')
		.style('font-size', '13px')
		.text('Month')

	svg
		.append('text')
		.attr('x', 18)
		.attr('y', height / 2)
		.attr('transform', `rotate(-90, 18, ${height / 2})`)
		.attr('text-anchor', 'middle')
		.attr('fill', '#f8f8f8')
		.style('font-size', '13px')
		.text('Albums Sold')

	svg
		.append('text')
		.attr('x', width - 18)
		.attr('y', height / 2)
		.attr('transform', `rotate(90, ${width - 18}, ${height / 2})`)
		.attr('text-anchor', 'middle')
		.attr('fill', '#f8f8f8')
		.style('font-size', '13px')
		.text('Selling Price (USD)')

	const legend = svg.append('g').attr('transform', `translate(${margin.left}, 12)`)

	const legendItem = legend
		.selectAll('g')
		.data(yearlyPriceSeries)
		.join('g')
		.attr('transform', (_, i) => `translate(${i * 110},0)`)

	legendItem.append('rect').attr('width', 14).attr('height', 14).attr('fill', (d) => color(d.year))

	legendItem
		.append('text')
		.attr('x', 20)
		.attr('y', 11)
		.attr('fill', '#f8f8f8')
		.style('font-size', '12px')
		.text((d) => `Price ${d.year}`)
}
