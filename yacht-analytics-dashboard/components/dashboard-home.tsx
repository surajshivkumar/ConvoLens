"use client";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Clock,
  Star,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const kpiData = [
  {
    title: "Total Calls",
    value: "247",
    change: "+12%",
    trend: "up",
    icon: Phone,
    color: "text-cyan-400",
  },
  {
    title: "Avg Resolution Time",
    value: "8.5m",
    change: "-5%",
    trend: "down",
    icon: Clock,
    color: "text-green-400",
  },
  {
    title: "Frequent Sentiment",
    value: "4.8",
    change: "+0.2",
    trend: "up",
    icon: Star,
    color: "text-yellow-400",
  },
  {
    title: "Top Issues",
    value: "GPS",
    change: "32%",
    trend: "up",
    icon: AlertTriangle,
    color: "text-orange-400",
  },
];

const callVolumeData = [
  { day: "Mon", calls: 180 },
  { day: "Tue", calls: 220 },
  { day: "Wed", calls: 195 },
  { day: "Thu", calls: 247 },
  { day: "Fri", calls: 210 },
  { day: "Sat", calls: 165 },
  { day: "Sun", calls: 140 },
];

const conversationTypesData = [
  { type: "GPS Issues", count: 45, color: "#06b6d4" },
  { type: "Engine Support", count: 38, color: "#0ea5e9" },
  { type: "Navigation", count: 32, color: "#3b82f6" },
  { type: "Equipment", count: 28, color: "#6366f1" },
  { type: "Maintenance", count: 24, color: "#8b5cf6" },
];

const recentConversations = [
  {
    id: 1,
    customer: "Michael Thompson",
    type: "GPS Issues",
    duration: "12m 34s",
    status: "Resolved",
    sentiment: "Positive",
    agent: "Sarah J.",
    time: "2 hours ago",
  },
  {
    id: 2,
    customer: "Jennifer Walsh",
    type: "Engine Support",
    duration: "8m 15s",
    status: "In Progress",
    sentiment: "Neutral",
    agent: "Mike R.",
    time: "3 hours ago",
  },
  {
    id: 3,
    customer: "Robert Chen",
    type: "Navigation",
    duration: "15m 42s",
    status: "Escalated",
    sentiment: "Negative",
    agent: "Lisa K.",
    time: "4 hours ago",
  },
  {
    id: 4,
    customer: "Amanda Foster",
    type: "Equipment",
    duration: "6m 28s",
    status: "Resolved",
    sentiment: "Positive",
    agent: "Tom B.",
    time: "5 hours ago",
  },
];

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Customer service analytics overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="kpi-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="flex items-center text-xs">
                {kpi.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-green-400" />
                )}
                <span className="text-green-400">{kpi.change}</span>
                <span className="text-slate-400 ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call Volume Chart */}
        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Call Volume Trends</CardTitle>
            <CardDescription className="text-slate-400">
              Last 7 days call volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                calls: {
                  label: "Calls",
                  color: "#06b6d4",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={callVolumeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversation Types Chart */}
        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Conversation Types</CardTitle>
            <CardDescription className="text-slate-400">
              Distribution of support topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "#06b6d4",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conversationTypesData}
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    dataKey="type"
                    type="category"
                    stroke="#9ca3af"
                    fontSize={12}
                    width={70}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card className="kpi-card card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Conversations</CardTitle>
              <CardDescription className="text-slate-400">
                Latest customer interactions
              </CardDescription>
            </div>
            <Link href={"/conversations"}>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-800"
              >
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="conversation-row">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">
                        {conversation.customer}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`
                          ${
                            conversation.sentiment === "Positive"
                              ? "sentiment-positive"
                              : ""
                          }
                          ${
                            conversation.sentiment === "Neutral"
                              ? "sentiment-neutral"
                              : ""
                          }
                          ${
                            conversation.sentiment === "Negative"
                              ? "sentiment-negative"
                              : ""
                          }
                        `}
                      >
                        {conversation.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{conversation.type}</span>
                      <span>•</span>
                      <span>{conversation.duration}</span>
                      <span>•</span>
                      <span>Agent: {conversation.agent}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        conversation.status === "Resolved"
                          ? "status-resolved"
                          : ""
                      }
                      ${
                        conversation.status === "In Progress"
                          ? "status-progress"
                          : ""
                      }
                      ${
                        conversation.status === "Escalated"
                          ? "status-escalated"
                          : ""
                      }
                    `}
                  >
                    {conversation.status}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    {conversation.time}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Busiest Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="agent-avatar">
                <span className="text-cyan-400 font-semibold">SJ</span>
              </div>
              <div>
                <p className="font-medium text-white">Sarah Johnson</p>
                <p className="text-sm text-slate-400">47 calls today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Most Common Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="agent-avatar">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">GPS Navigation</p>
                <p className="text-sm text-slate-400">32% of all calls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Satisfaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="agent-avatar">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">Improving</p>
                <p className="text-sm text-slate-400">+0.2 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
