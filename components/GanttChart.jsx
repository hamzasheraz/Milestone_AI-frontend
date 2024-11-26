import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

const GanttChart = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Simulating API call
    const fetchData = async () => {
      // In a real scenario, you would fetch data from your API here
      const response = {
        tasks: [
          {
            task_name: "Complete and Submit Liability Forms",
            start_date: "25-11-2024",
            end_date: "25-11-2024",
            description: "Maria and Ken need to complete and electronically sign the liability policy and confidentiality agreement and send it to Tare at tare.gulduz@mail.ca."
          },
          {
            task_name: "Send Email to Tare",
            start_date: "25-11-2024",
            end_date: "25-11-2024",
            description: "Ken needs to send an email to Tare to verify his email address."
          },
          {
            task_name: "Complete LogTeam Software Training",
            start_date: "25-11-2024",
            end_date: "09-12-2024",
            description: "Maria and Ken will undergo two weeks of training on the LogTeam software, covering basic functions, security features, add-ons, and common glitches, to become experts on the product."
          },
          {
            task_name: "Setup Employee Accounts",
            start_date: "25-11-2024",
            end_date: "25-11-2024",
            description: "IT needs to set up Maria and Ken's accounts on the computers they'll use for work."
          }
        ]
      }
      setData(response)
    }

    fetchData()
  }, [])

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const calculateTaskPosition = (task) => {
    if (!data) return { x: 0, width: 0 }

    const startDate = parseDate(task.start_date)
    const endDate = parseDate(task.end_date)

    const minDate = Math.min(...data.tasks.map(t => parseDate(t.start_date).getTime()))
    const maxDate = Math.max(...data.tasks.map(t => parseDate(t.end_date).getTime()))

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24)
    const startPosition = (startDate.getTime() - minDate) / (1000 * 60 * 60 * 24)
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1

    return {
      x: (startPosition / totalDays) * 100,
      width: (duration / totalDays) * 100
    }
  }

  const CustomBar = ({
    x,
    y,
    width,
    height,
    task
  }) => {
    const { x: barX, width: barWidth } = calculateTaskPosition(task)
    return (
      (<g>
        <rect
          x={`${barX}%`}
          y={y}
          width={`${barWidth}%`}
          height={height}
          fill="hsl(var(--primary))" />
        <text
          x={`${barX + 1}%`}
          y={y + height / 2}
          dy=".35em"
          fill="white"
          fontSize="12">
          {task.task_name}
        </text>
      </g>)
    );
  }

  const CustomTooltip = ({
    active,
    payload
  }) => {
    if (active && payload && payload.length) {
      const task = payload[0].payload
      return (
        (<div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <h3 className="font-bold">{task.task_name}</h3>
          <p>Start: {formatDate(parseDate(task.start_date))}</p>
          <p>End: {formatDate(parseDate(task.end_date))}</p>
          <p className="mt-2">{task.description}</p>
        </div>)
      );
    }
    return null
  }

  if (!data) return <div>Loading...</div>;

  const chartData = data.tasks.map((task, index) => ({
    ...task,
    index
  }))

  return (
    (<Card className="w-full">
      <CardHeader>
        <CardTitle>Project Gantt Chart</CardTitle>
        <CardDescription>Task timeline and descriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={20}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => {
                  const date = new Date(
                    Math.min(...data.tasks.map(t => parseDate(t.start_date).getTime())) + value * 24 * 60 * 60 * 1000
                  )
                  return formatDate(date);
                }} />
              <YAxis type="category" dataKey="task_name" hide />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar dataKey="index" fill="hsl(var(--primary))" shape={<CustomBar />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>)
  );
}

export default GanttChart

