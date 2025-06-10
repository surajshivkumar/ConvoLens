"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Clock,
  Calendar,
  Phone,
  User,
  MessageSquare,
  Copy,
} from "lucide-react";
import Link from "next/link";

interface CallData {
  call_id: string;
  date_id: string;
  agent_name: string;
  agent_email: string;
  customer_name: string;
  customer_email: string;
  duration_seconds: number;
  call_timestamp: string;
  audio_url: string;
  sentiment: string;
  issue_type: string;
  resolved: string;
  sentiment_score: number;
  agent_politeness: number;
  agent_professionalism: number;
  process_adherence: number;
  transcript: string;
  summary: string;
}

interface TranscriptMessage {
  role: string;
  content: string;
  start_time: number;
}

export function CallDetail({ callId }: { callId: string }) {
  const [vconData, setVconData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [parsedTranscript, setParsedTranscript] = useState<TranscriptMessage[]>(
    []
  );

  useEffect(() => {
    async function fetchVconData() {
      try {
        setLoading(true);

        const { data, error } = await supabase.rpc("get_recent_call", {
          r_call_id: callId,
        });

        console.log("Fetched data:", data);

        if (error) throw error;

        if (data) {
          setVconData(data[0] as CallData);

          // Parse transcript if it's a JSON string
          try {
            if (data.transcript && typeof data.transcript === "string") {
              const parsed = JSON.parse(data.transcript);
              if (Array.isArray(parsed)) {
                setParsedTranscript(parsed);
              }
            }
          } catch (parseError) {
            console.log("Transcript is not JSON, treating as plain text");
            setParsedTranscript([]);
          }
        } else {
          setError("No data found for this call ID");
        }
      } catch (err) {
        console.error("Error fetching call data:", err);
        setError("Failed to load call data");
      } finally {
        setLoading(false);
      }
    }

    fetchVconData();
  }, [callId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "neutral":
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-slate-600 text-slate-400 hover:bg-slate-800"
          >
            <Link href="/conversations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Call Details</h1>
        </div>

        <div className="grid gap-6">
          <Card className="kpi-card">
            <CardHeader>
              <Skeleton className="h-8 w-48 bg-slate-700" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 bg-slate-700" />
                <Skeleton className="h-20 bg-slate-700" />
                <Skeleton className="h-20 bg-slate-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader>
              <Skeleton className="h-8 w-32 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 bg-slate-700" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-slate-600 text-slate-400 hover:bg-slate-800"
          >
            <Link href="/conversations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Call Details</h1>
        </div>

        <Card className="kpi-card">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-xl">!</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Error Loading Data
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button asChild>
                <Link href="/conversations">Back to Conversations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vconData) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="border-slate-600 text-slate-400 hover:bg-slate-800"
        >
          <Link href="/conversations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">Call Details</h1>
      </div>

      {/* Call Overview */}
      <Card className="kpi-card card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Call Overview</CardTitle>
            <Badge
              variant="outline"
              className={getSentimentColor(vconData.sentiment)}
            >
              {vconData.sentiment} Sentiment
            </Badge>
          </div>
          <CardDescription className="text-slate-400">
            Call ID: {vconData.call_id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First Row - Duration, Date, Issue Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Duration</p>
                <p className="font-medium text-white">
                  {formatDuration(vconData.duration_seconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Date & Time</p>
                <p className="font-medium text-white">
                  {formatDate(vconData.call_timestamp)} at{" "}
                  {formatTime(vconData.call_timestamp)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Issue Type</p>
                <p className="font-medium text-white">{vconData.issue_type}</p>
              </div>
            </div>
          </div>

          {/* Second Row - Agent and Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Agent</p>
                <p className="font-medium text-white">{vconData.agent_name}</p>
                <p className="text-xs text-slate-500">{vconData.agent_email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Customer</p>
                <p className="font-medium text-white">
                  {vconData.customer_name}
                </p>
                <p className="text-xs text-slate-500">
                  {vconData.customer_email}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {vconData.agent_politeness && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-400">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-400">Politeness</p>
                  <p className="text-lg font-medium text-white">
                    {vconData.agent_politeness}/10
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-400">Professionalism</p>
                  <p className="text-lg font-medium text-white">
                    {vconData.agent_professionalism}/10
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-400">Process Adherence</p>
                  <p className="text-lg font-medium text-white">
                    {vconData.process_adherence}/10
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Content */}
      <Card className="kpi-card card-hover">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader>
            <TabsList className="grid grid-cols-2 bg-slate-800">
              <TabsTrigger
                value="transcript"
                className="data-[state=active]:marine-gradient-subtle"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Transcript
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="data-[state=active]:marine-gradient-subtle"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="transcript" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {parsedTranscript.length > 0 ? (
                    parsedTranscript.map((message, index) => (
                      <div key={index} className="flex gap-4">
                        <div
                          className={`flex-1 ${
                            message.role === "customer" ? "ml-12" : ""
                          }`}
                        >
                          <div
                            className={`${
                              message.role === "customer"
                                ? "marine-gradient-subtle border border-cyan-500/30 text-white ml-auto max-w-2xl rounded-2xl px-4 py-3"
                                : "bg-slate-800/50 border border-slate-700 text-slate-300 rounded-2xl px-4 py-3"
                            }`}
                          >
                            <div className="text-xs opacity-80 mb-1 flex justify-between">
                              <span>
                                {message.role === "customer"
                                  ? "Customer"
                                  : "Agent"}
                              </span>
                              {message.start_time && (
                                <span className="text-slate-500">
                                  {formatDuration(message.start_time)}
                                </span>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {vconData.transcript || "No transcript available"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">AI Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-slate-400 hover:text-white"
                    onClick={() => copyToClipboard(vconData.summary)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {vconData.summary || "No summary available"}
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button className="marine-gradient glow-blue hover:glow-cyan">
          <Download className="h-4 w-4 mr-2" />
          Export Call Data
        </Button>
      </div>
    </div>
  );
}
