"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Users, Clock, Star, MessageSquare } from "lucide-react"

const sentimentData = [
  { date: "2024-01-09", positive: 65, neutral: 25, negative: 10 },
  { date: "2024-01-10", positive: 70, neutral: 20, negative: 10 },
  { date: "2024-01-11", positive: 68, neutral: 22, negative: 10 },
  { date: "2024-01-12", positive: 72, neutral: 18, negative: 10 },
  { date: "2024-01-13", positive: 75, neutral: 15, negative: 10 },
  { date: "2024-01-14", positive: 78, neutral: 15, negative: 7 },
  { date: "2024-01-15", positive: 80, neutral: 15, negative: 5 },
]

const agentPerformanceData = [
  { agent: "Sarah J.", calls: 47, avgTime: 8.5, satisfaction: 4.8, resolution: 95 },
  { agent: "Mike R.", calls: 42, avgTime: 9.2, satisfaction: 4.6, resolution: 92 },
  { agent: "Lisa K.", calls: 38, avgTime: 7.8, satisfaction: 4.9, resolution: 97 },
  { agent: "Tom B.", calls: 35, avgTime: 10.1, satisfaction: 4.4, resolution: 88 },
  { agent: "Amy S.", calls: 33, avgTime: 8.9, satisfaction: 4.7, resolution: 94 },
]

const resolutionPatternsData = [
  { time: "9:00", resolved: 12, escalated: 2 },
  { time: "10:00", resolved: 18, escalated: 3 },
  { time: "11:00", resolved: 22, escalated: 4 },
  { time: "12:00", resolved: 15, escalated: 2 },
  { time: "13:00", resolved: 20, escalated: 3 },
  { time: "14:00", resolved: 25, escalated: 5 },
  { time: "15:00", resolved: 28, escalated: 4 },
  { time: "16:00", resolved: 24, escalated: 3 },
  { time: "17:00", resolved: 19, escalated: 2 },
]

const issueDistributionData = [
  { name: "GPS Issues", value: 32, color: "#06b6d4" },
  { name: "Engine Support", value: 28, color: "#0ea5e9" },
  { name: "Navigation", value: 20, color: "#3b82f6" },
  { name: "Equipment", value: 12, color: "#6366f1" },
  { name: "Maintenance", value: 8, color: "#8b5cf6" },
]

const wordCloudData = [
  { text: "GPS", size: 40, color: "#06b6d4" },
  { text: "Navigation", size: 35, color: "#0ea5e9" },
  { text: "Engine", size: 30, color: "#3b82f6" },
  { text: "Calibration", size: 25, color: "#6366f1" },
  { text: "System", size: 28, color: "#8b5cf6" },
  { text: "Error", size: 22, color: "#ec4899" },
  { text: "Reset", size: 20, color: "#f59e0b" },
  { text: "Update", size: 18, color: "#10b981" },
  { text: "Manual", size: 16, color: "#ef4444" },
  { text: "Settings", size: 24, color: "#06b6d4" },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400">Deep insights into customer service performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,247</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
              <span className="text-green-400">+12%</span>
              <span className="text-slate-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <div className="flex items-center text-xs">
              <span className="text-slate-400">5 online now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Handle Time</CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8.7m</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="mr-1 h-3 w-3 text-green-400" />
              <span className="text-green-400">-8%</span>
              <span className="text-slate-400 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
              <span className="text-green-400">+0.3</span>
              <span className="text-slate-400 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sentiment Analysis */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sentiment Analysis Over Time</CardTitle>
            <CardDescription className="text-slate-400">Customer sentiment trends for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                positive: { label: "Positive", color: "#10b981" },
                neutral: { label: "Neutral", color: "#f59e0b" },
                negative: { label: "Negative", color: "#ef4444" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Issue Distribution */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Issue Distribution</CardTitle>
            <CardDescription className="text-slate-400">Most common support topics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Issues", color: "#06b6d4" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {issueDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Agent Performance Metrics</CardTitle>
          <CardDescription className="text-slate-400">
            Individual agent statistics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformanceData.map((agent) => (
              <div key={agent.agent} className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-semibold">
                      {agent.agent
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{agent.agent}</p>
                    <p className="text-sm text-slate-400">{agent.calls} calls today</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Avg Time</p>
                    <p className="font-medium text-white">{agent.avgTime}m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Satisfaction</p>
                    <p className="font-medium text-white">{agent.satisfaction}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Resolution</p>
                    <p className="font-medium text-white">{agent.resolution}%</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      ${agent.resolution >= 95 ? "border-green-500 text-green-400" : ""}
                      ${agent.resolution >= 90 && agent.resolution < 95 ? "border-yellow-500 text-yellow-400" : ""}
                      ${agent.resolution < 90 ? "border-red-500 text-red-400" : ""}
                    `}
                  >
                    {agent.resolution >= 95 ? "Excellent" : agent.resolution >= 90 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resolution Patterns */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Call Resolution Patterns</CardTitle>
            <CardDescription className="text-slate-400">Hourly resolution vs escalation rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                resolved: { label: "Resolved", color: "#10b981" },
                escalated: { label: "Escalated", color: "#ef4444" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionPatternsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="resolved" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="escalated" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Word Cloud */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Common Keywords</CardTitle>
            <CardDescription className="text-slate-400">
              Most frequently mentioned terms in conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center p-4">
              <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-3 overflow-hidden">
                {wordCloudData.map((word, index) => (
                  <span
                    key={index}
                    className="font-semibold cursor-pointer hover:opacity-80 transition-opacity select-none"
                    style={{
                      fontSize: `${Math.min(word.size, 32)}px`,
                      color: word.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
