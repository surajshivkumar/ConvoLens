"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";

// Interfaces for the new data types
interface IssueDistribution {
  issue_type: string;
  percentage: number;
}

interface DailyResolution {
  date: string;
  resolved: number;
  escalated: number;
}

interface DailySentiment {
  date: string;
  positive_pct: number;
  negative_pct: number;
}

// Static data that doesn't have API endpoints yet
const agentPerformanceData = [
  {
    agent: "Sarah J.",
    calls: 47,
    avgTime: 8.5,
    satisfaction: 4.8,
    resolution: 95,
  },
  {
    agent: "Mike R.",
    calls: 42,
    avgTime: 9.2,
    satisfaction: 4.6,
    resolution: 92,
  },
  {
    agent: "Lisa K.",
    calls: 38,
    avgTime: 7.8,
    satisfaction: 4.9,
    resolution: 97,
  },
  {
    agent: "Tom B.",
    calls: 35,
    avgTime: 10.1,
    satisfaction: 4.4,
    resolution: 88,
  },
  {
    agent: "Amy S.",
    calls: 33,
    avgTime: 8.9,
    satisfaction: 4.7,
    resolution: 94,
  },
];

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
];

export function AnalyticsPage() {
  const [issueDistributionData, setIssueDistributionData] = useState<any[]>([]);
  const [resolutionPatternsData, setResolutionPatternsData] = useState<any[]>(
    []
  );
  const [callCenterData, setcallCenterData] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          issueResult,
          resolutionResult,
          sentimentResult,
          callCenterResults,
        ] = await Promise.all([
          supabase.rpc("get_issue_distribution"),
          supabase.rpc("get_daily_resolution_status"),
          supabase.rpc("get_daily_sentiment_pct"),
          supabase.rpc("get_call_center_metrics"),
        ]);
        if (callCenterResults.error) throw callCenterResults.error;
        if (callCenterResults.data) {
          console.log("Call Center Metrics:", callCenterResults.data);
          const transformedCallcenter = callCenterResults.data[0];
          setcallCenterData(transformedCallcenter);
        }

        // Handle issue distribution data
        if (issueResult.error) throw issueResult.error;
        if (issueResult.data) {
          console.log("Raw issue distribution:", issueResult.data);
          const transformedIssueData = issueResult.data.map(
            (item: any, index: number) => {
              const colors = [
                "#06b6d4",
                "#0ea5e9",
                "#3b82f6",
                "#6366f1",
                "#8b5cf6",
                "#a855f7",
                "#d946ef",
              ];

              // Handle different tuple formats
              let issue_type, percentage;
              if (Array.isArray(item)) {
                issue_type = item[0];
                percentage = parseFloat(item[1]);
              } else if (item.f1 !== undefined && item.f2 !== undefined) {
                issue_type = item.f1;
                percentage = parseFloat(item.f2);
              } else {
                issue_type = item.issue_type || item[0] || "Unknown";
                percentage = parseFloat(item.issue_dist || item[1] || 0);
              }

              return {
                name: issue_type,
                value: Math.round(percentage),
                color: colors[index % colors.length],
              };
            }
          );
          setIssueDistributionData(transformedIssueData);
          console.log("Transformed issue distribution:", transformedIssueData);
        }

        // Handle resolution patterns data
        if (resolutionResult.error) throw resolutionResult.error;
        if (resolutionResult.data) {
          console.log("Raw resolution data:", resolutionResult.data);
          const transformedResolutionData = resolutionResult.data.map(
            (item: any) => {
              // Handle different tuple formats
              let date, resolved, escalated;
              if (Array.isArray(item)) {
                date = item[0];
                resolved = parseInt(item[1]);
                escalated = parseInt(item[2]);
              } else if (
                item.f1 !== undefined &&
                item.f2 !== undefined &&
                item.f3 !== undefined
              ) {
                date = item.f1;
                resolved = parseInt(item.f2);
                escalated = parseInt(item.f3);
              } else {
                date = item.date_id || item[0] || "Unknown";
                resolved = parseInt(item.resolved || item[1] || 0);
                escalated = parseInt(item.escalated || item[2] || 0);
              }

              return {
                time: new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                resolved,
                escalated,
              };
            }
          );
          setResolutionPatternsData(transformedResolutionData);
          console.log(
            "Transformed resolution data:",
            transformedResolutionData
          );
        }

        // Handle sentiment data
        if (sentimentResult.error) throw sentimentResult.error;
        if (sentimentResult.data) {
          console.log("Raw sentiment data:", sentimentResult.data);
          const transformedSentimentData = sentimentResult.data.map(
            (item: any) => {
              // Handle different tuple formats
              let date, positive_pct, negative_pct;
              if (Array.isArray(item)) {
                date = item[0];
                positive_pct = parseFloat(item[1]);
                negative_pct = parseFloat(item[2]);
              } else if (
                item.f1 !== undefined &&
                item.f2 !== undefined &&
                item.f3 !== undefined
              ) {
                date = item.f1;
                positive_pct = parseFloat(item.f2);
                negative_pct = parseFloat(item.f3);
              } else {
                date = item.date_id || item[0] || "Unknown";
                positive_pct = parseFloat(item.positive_pct || item[1] || 0);
                negative_pct = parseFloat(item.negative_pct || item[2] || 0);
              }

              return {
                date: new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                positive: Math.round(positive_pct),
                neutral: Math.round(100 - positive_pct - negative_pct),
                negative: Math.round(negative_pct),
              };
            }
          );
          setSentimentData(transformedSentimentData);
          console.log("Transformed sentiment data:", transformedSentimentData);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400">
          Deep insights into customer service performance
          {!loading && (
            <span className="ml-2 text-cyan-400">
              • {issueDistributionData.length} issue types •{" "}
              {sentimentData.length} days • {resolutionPatternsData.length}{" "}
              resolution points
            </span>
          )}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <span className="inline-block animate-pulse bg-slate-700 h-8 w-16 rounded"></span>
              ) : (
                callCenterData?.total_conversations
              )}
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
              <span className="text-green-400">+12%</span>
              <span className="text-slate-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Agents
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">43</div>
            <div className="flex items-center text-xs">
              <span className="text-slate-400">5 online now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Avg Handle Time
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {callCenterData?.avg_handle_time} s
            </div>
            <div className="flex items-center text-xs">
              <TrendingDown className="mr-1 h-3 w-3 text-green-400" />
              <span className="text-green-400">-8%</span>
              <span className="text-slate-400 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Sentiment Score
            </CardTitle>
            <Star className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {callCenterData?.avg_sentiment_score}
            </div>
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
            <CardTitle className="text-white">
              Sentiment Analysis Over Time
            </CardTitle>
            <CardDescription className="text-slate-400">
              Customer sentiment trends by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[280px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
              </div>
            ) : sentimentData.length === 0 ? (
              <div className="h-[280px] w-full flex items-center justify-center text-slate-400">
                No sentiment data available
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sentimentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Distribution */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Issue Distribution</CardTitle>
            <CardDescription className="text-slate-400">
              Most common support topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[280px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
              </div>
            ) : issueDistributionData.length === 0 ? (
              <div className="h-[280px] w-full flex items-center justify-center text-slate-400">
                No issue distribution data available
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issueDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      fontSize={11}
                    >
                      {issueDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Agent Performance Metrics
          </CardTitle>
          <CardDescription className="text-slate-400">
            Individual agent statistics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformanceData.map((agent) => (
              <div
                key={agent.agent}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800"
              >
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
                    <p className="text-sm text-slate-400">
                      {agent.calls} calls today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Avg Time</p>
                    <p className="font-medium text-white">{agent.avgTime}m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Satisfaction</p>
                    <p className="font-medium text-white">
                      {agent.satisfaction}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Resolution</p>
                    <p className="font-medium text-white">
                      {agent.resolution}%
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        agent.resolution >= 95
                          ? "border-green-500 text-green-400"
                          : ""
                      }
                      ${
                        agent.resolution >= 90 && agent.resolution < 95
                          ? "border-yellow-500 text-yellow-400"
                          : ""
                      }
                      ${
                        agent.resolution < 90
                          ? "border-red-500 text-red-400"
                          : ""
                      }
                    `}
                  >
                    {agent.resolution >= 95
                      ? "Excellent"
                      : agent.resolution >= 90
                      ? "Good"
                      : "Needs Improvement"}
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
            <CardTitle className="text-white">
              Daily Resolution Patterns
            </CardTitle>
            <CardDescription className="text-slate-400">
              Daily resolution vs escalation rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[280px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
              </div>
            ) : resolutionPatternsData.length === 0 ? (
              <div className="h-[280px] w-full flex items-center justify-center text-slate-400">
                No resolution data available
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resolutionPatternsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Bar
                      dataKey="resolved"
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="escalated"
                      fill="#ef4444"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
  );
}
