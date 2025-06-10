"use client";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import React from "react";

interface Metrics {
  total_calls: number;
  avg_duration_in_sec: number;
  avg_sentiment: number;
  frequent_sentiment: number;
  top_issue: string;
  issue_count: number;
  busiest_agent: string;
  total_duration_in_sec: number;
  pct_positive: number;
}

interface WeekdayCallCount {
  weekday: string;
  count: number;
}

interface IssueCount {
  issue_type: string;
  count: number;
}

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
  const [dashData, setDashData] = useState<Metrics | null>(null);
  const [weekdayData, setWeekdayData] = useState<WeekdayCallCount[]>([]);
  const [issueData, setIssueData] = useState<IssueCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [summaryResult, weekdayResult, issueResult] = await Promise.all([
          supabase.rpc("get_call_summary"),
          supabase.rpc("get_weekday_call_counts"),
          supabase.rpc("get_issue_counts"),
        ]);

        // Handle summary data
        if (summaryResult.error) throw summaryResult.error;
        if (summaryResult.data && summaryResult.data.length > 0) {
          setDashData(summaryResult.data[0] as Metrics);
          console.log("Dashboard data:", summaryResult.data[0]);
        }

        // Handle weekday data - transform from tuple format
        if (weekdayResult.error) throw weekdayResult.error;
        if (weekdayResult.data) {
          console.log("Raw weekday data:", weekdayResult.data[0]);
          const transformedWeekdayData = weekdayResult.data.map((item: any) => {
            // Handle different possible tuple formats
            if (Array.isArray(item)) {
              return {
                weekday: item[0], // First element of array
                count: item[1], // Second element of array
              };
            } else if (item.f1 !== undefined && item.f2 !== undefined) {
              return {
                weekday: item.f1, // First element of tuple
                count: item.f2, // Second element of tuple
              };
            } else {
              // Direct object format
              return {
                weekday: item.weekday || item[0] || "Unknown",
                count: item.call_count || item[1] || 0,
              };
            }
          });
          setWeekdayData(transformedWeekdayData);
          console.log("Transformed weekday data:", transformedWeekdayData);
        }

        // Handle issue data - transform from tuple format
        if (issueResult.error) throw issueResult.error;
        if (issueResult.data) {
          console.log("Raw issue data:", issueResult.data);
          const transformedIssueData = issueResult.data.map((item: any) => {
            // Handle different possible tuple formats
            if (Array.isArray(item)) {
              return {
                issue_type: item[0], // First element of array
                count: item[1], // Second element of array
              };
            } else if (item.f1 !== undefined && item.f2 !== undefined) {
              return {
                issue_type: item.f1, // First element of tuple
                count: item.f2, // Second element of tuple
              };
            } else {
              // Direct object format
              return {
                issue_type: item.issue_type || item[0] || "Unknown Issue",
                count: item.issue_count || item[1] || 0,
              };
            }
          });
          setIssueData(transformedIssueData);
          console.log("Transformed issue data:", transformedIssueData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []); // Fixed: Added dependency array

  // Helper functions
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatSentiment = (sentiment: number) => {
    return (sentiment * 10).toFixed(1);
  };

  const calculateIssuePercentage = () => {
    if (!dashData) return "0";
    return ((dashData.issue_count / dashData.total_calls) * 100).toFixed(0);
  };

  // Transform weekday data for the line chart
  const getCallVolumeData = () => {
    if (weekdayData.length === 0) {
      return [
        { day: "Mon", calls: 0 },
        { day: "Tue", calls: 0 },
        { day: "Wed", calls: 0 },
        { day: "Thu", calls: 0 },
        { day: "Fri", calls: 0 },
        { day: "Sat", calls: 0 },
        { day: "Sun", calls: 0 },
      ];
    }

    // Map full weekday names to short names
    const dayMapping: { [key: string]: string } = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };

    return weekdayData.map((item) => ({
      day: dayMapping[item.weekday] || item.weekday.substring(0, 3),
      calls: item.count,
    }));
  };

  // Transform issue data for the bar chart
  const getConversationTypesData = () => {
    if (issueData.length === 0) {
      return [];
    }

    // Define colors for different issue types
    const colors = [
      "#06b6d4",
      "#0ea5e9",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#d946ef",
    ];

    return issueData
      .sort((a, b) => b.count - a.count) // Sort by count descending
      .map((item, index) => ({
        type: item.issue_type,
        count: item.count,
        color: colors[index % colors.length],
      }));
  };

  // Generate KPI data from real dashData
  const getKpiData = () => {
    if (!dashData) {
      return [
        {
          title: "Total Calls",
          value: "---",
          change: "---",
          trend: "up" as const,
          icon: Phone,
          color: "text-cyan-400",
        },
        {
          title: "Avg Call Duration",
          value: "---",
          change: "---",
          trend: "down" as const,
          icon: Clock,
          color: "text-green-400",
        },
        {
          title: "Sentiment Score",
          value: "---",
          change: "---",
          trend: "up" as const,
          icon: Star,
          color: "text-yellow-400",
        },
        {
          title: "Top Issue",
          value: "---",
          change: "---",
          trend: "up" as const,
          icon: AlertTriangle,
          color: "text-orange-400",
        },
      ];
    }

    return [
      {
        title: "Total Calls",
        value: dashData.total_calls.toString(),
        change: "+12%", // You can calculate this if you have previous period data
        trend: "up" as const,
        icon: Phone,
        color: "text-cyan-400",
      },
      {
        title: "Avg Call Duration",
        value: formatDuration(dashData.avg_duration_in_sec),
        change: "-5%", // You can calculate this if you have previous period data
        trend: "down" as const,
        icon: Clock,
        color: "text-green-400",
      },
      {
        title: "Sentiment Score",
        value: formatSentiment(dashData.frequent_sentiment),
        change: "+0.2", // You can calculate this if you have previous period data
        trend: "up" as const,
        icon: Star,
        color: "text-yellow-400",
      },
      {
        title: "Top Issue",
        value: dashData.top_issue,
        change: `${calculateIssuePercentage()}%`,
        trend: "up" as const,
        icon: AlertTriangle,
        color: "text-orange-400",
      },
    ];
  };

  const kpiData = getKpiData();
  const callVolumeData = getCallVolumeData();
  const conversationTypesData = getConversationTypesData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">
          Customer service analytics overview
          {!loading && dashData && (
            <span className="ml-2 text-cyan-400">
              • {dashData.total_calls} total calls •{" "}
              {weekdayData.length > 0 ? "Weekly" : "No"} data •{" "}
              {issueData.length} issue types
            </span>
          )}
        </p>
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
              <div className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block animate-pulse bg-slate-700 h-8 w-16 rounded"></span>
                ) : (
                  kpi.value
                )}
              </div>
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
            <CardTitle className="text-white">Weekly Call Volume</CardTitle>
            <CardDescription className="text-slate-400">
              Calls by day of week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Conversation Types Chart */}
        {/* Conversation Types Chart */}
        {/* Conversation Types Chart - DEBUG VERSION */}
        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Issue Types</CardTitle>
            <CardDescription className="text-slate-400">
              Most common support topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
              </div>
            ) : conversationTypesData.length === 0 ? (
              <div className="h-[250px] w-full flex items-center justify-center text-slate-400">
                No issue data available
              </div>
            ) : (
              <div className="space-y-4">
                {/* Debug: Show raw data */}

                {/* Simple HTML version first to test data */}
                <div className="space-y-2">
                  {conversationTypesData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-800/50 p-2 rounded"
                    >
                      <span className="text-white text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 bg-cyan-500 rounded"
                          style={{
                            width: `${
                              (item.count /
                                Math.max(
                                  ...conversationTypesData.map((d) => d.count)
                                )) *
                              100
                            }px`,
                          }}
                        ></div>
                        <span className="text-cyan-400 text-sm font-mono">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simple Recharts version without ChartContainer */}
              </div>
            )}
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
                <span className="text-cyan-400 font-semibold">
                  {loading
                    ? "..."
                    : dashData?.busiest_agent?.substring(0, 2).toUpperCase() ||
                      "NA"}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">
                  {loading ? (
                    <span className="inline-block animate-pulse bg-slate-700 h-4 w-24 rounded"></span>
                  ) : (
                    dashData?.busiest_agent || "No data"
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {loading ? "" : `${dashData?.total_calls || 0} calls total`}
                </p>
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
                <div className="font-medium text-white">
                  {loading ? (
                    <span className="inline-block animate-pulse bg-slate-700 h-4 w-20 rounded"></span>
                  ) : (
                    dashData?.top_issue || "No data"
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {loading ? "" : `${calculateIssuePercentage()}% of all calls`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card card-hover">
          <CardHeader>
            <CardTitle className="text-white">Positive Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="agent-avatar">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="font-medium text-white">
                  {loading ? (
                    <span className="inline-block animate-pulse bg-slate-700 h-4 w-12 rounded"></span>
                  ) : (
                    `${dashData?.pct_positive?.toFixed(1) || "0"}%`
                  )}
                </div>
                <p className="text-sm text-slate-400">Positive interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
