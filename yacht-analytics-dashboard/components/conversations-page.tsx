"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Play,
  Download,
  MoreHorizontal,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Conversation {
  date_id: string;
  agent_name: string;
  agent_email: string;
  customer_name: string;
  customer_email: string;
  duration_seconds: number;
  call_timestamp: string;
  audio_url: string;
  // Optional fields that might come from your database
  status?: string;
  sentiment?: string;
  summary?: string;
  transcript?: string;
  type?: string;
  tags?: string[];
}

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Helper function to format duration from seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Test function - remove after debugging
  const testSupabase = async () => {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.rpc("get_call_data");
    console.log("Data:", data);
    console.log("Error:", error);
    alert(`Data: ${JSON.stringify(data)} | Error: ${JSON.stringify(error)}`);
  };

  // Helper function to format date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date: dateStr, time: timeStr };
  };

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.rpc("get_call_data");

        if (error) {
          console.error("Error fetching conversations:", error.message);
          setError("Failed to load conversations. Please try again.");
        } else {
          setConversations(data as Conversation[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      conv.customer_name?.toLowerCase().includes(searchLower) ||
      conv.agent_name?.toLowerCase().includes(searchLower) ||
      conv.customer_email?.toLowerCase().includes(searchLower) ||
      conv.agent_email?.toLowerCase().includes(searchLower) ||
      conv.type?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || conv.status?.toLowerCase() === statusFilter;
    const matchesSentiment =
      sentimentFilter === "all" ||
      conv.sentiment?.toLowerCase() === sentimentFilter;

    return matchesSearch && matchesStatus && matchesSentiment;
  });

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-hidden space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-slate-400">
            Manage and analyze customer interactions
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="ml-2 text-slate-400">Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-slate-400">
            Manage and analyze customer interactions
          </p>
        </div>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Conversations</h1>
        <p className="text-slate-400">
          Manage and analyze customer interactions
        </p>
        {/* Temporary test button - remove after debugging */}
        {/* <Button
          onClick={testSupabase}
          className="mt-2 bg-red-500 hover:bg-red-600"
        >
          Test Supabase Connection (Check Console)
        </Button> */}
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex-1 min-w-0 lg:min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by customer name, agent, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sentimentFilter}
                onValueChange={setSentimentFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-800 w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                Date Range
              </Button>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-800 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Conversations</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredConversations.length} conversations found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">
                No conversations found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Date & Time
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Customer
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Agent
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Type
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Duration
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Sentiment
                    </TableHead>
                    <TableHead className="text-slate-400 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conversation, index) => {
                    const { date, time } = formatDateTime(
                      conversation.call_timestamp
                    );

                    return (
                      <TableRow
                        key={conversation.date_id + index}
                        className="border-slate-700 hover:bg-slate-800"
                      >
                        <TableCell className="text-white">
                          <div>
                            <div>{date}</div>
                            <div className="text-sm text-slate-400">{time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white whitespace-nowrap">
                          <div>
                            <div className="truncate max-w-[150px]">
                              {conversation.customer_name}
                            </div>
                            <div className="text-sm text-slate-400 truncate max-w-[150px]">
                              {conversation.customer_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white whitespace-nowrap">
                          <div>
                            <div className="truncate max-w-[150px]">
                              {conversation.agent_name}
                            </div>
                            <div className="text-sm text-slate-400 truncate max-w-[150px]">
                              {conversation.agent_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-slate-700 text-slate-300"
                          >
                            {conversation.type || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {formatDuration(conversation.duration_seconds)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              conversation.status?.toLowerCase() === "resolved"
                                ? "border-green-500 text-green-400"
                                : ""
                            }
                            ${
                              conversation.status?.toLowerCase() ===
                              "in progress"
                                ? "border-yellow-500 text-yellow-400"
                                : ""
                            }
                            ${
                              conversation.status?.toLowerCase() === "escalated"
                                ? "border-red-500 text-red-400"
                                : ""
                            }
                          `}
                          >
                            {conversation.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`
                            ${
                              conversation.sentiment?.toLowerCase() ===
                              "positive"
                                ? "bg-green-500/20 text-green-400"
                                : ""
                            }
                            ${
                              conversation.sentiment?.toLowerCase() ===
                              "neutral"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : ""
                            }
                            ${
                              conversation.sentiment?.toLowerCase() ===
                              "negative"
                                ? "bg-red-500/20 text-red-400"
                                : ""
                            }
                          `}
                          >
                            {conversation.sentiment || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-cyan-400"
                                  onClick={() =>
                                    setSelectedConversation(conversation)
                                  }
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Conversation Details -{" "}
                                    {conversation.customer_name}
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    {date} at {time} •{" "}
                                    {formatDuration(
                                      conversation.duration_seconds
                                    )}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-slate-800 border-slate-600">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-slate-400">
                                          Customer Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <span className="text-sm text-slate-400">
                                            Name:
                                          </span>
                                          <span className="ml-2 text-white">
                                            {conversation.customer_name}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-slate-400">
                                            Email:
                                          </span>
                                          <span className="ml-2 text-white">
                                            {conversation.customer_email}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-slate-400">
                                            Agent:
                                          </span>
                                          <span className="ml-2 text-white">
                                            {conversation.agent_name}
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card className="bg-slate-800 border-slate-600">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-slate-400">
                                          Call Metadata
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        {conversation.tags && (
                                          <div className="flex flex-wrap gap-1">
                                            {conversation.tags.map(
                                              (tag, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="bg-cyan-500/20 text-cyan-400"
                                                >
                                                  {tag}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                          {conversation.status && (
                                            <Badge
                                              variant="outline"
                                              className={`
                                              ${
                                                conversation.status.toLowerCase() ===
                                                "resolved"
                                                  ? "border-green-500 text-green-400"
                                                  : ""
                                              }
                                              ${
                                                conversation.status.toLowerCase() ===
                                                "in progress"
                                                  ? "border-yellow-500 text-yellow-400"
                                                  : ""
                                              }
                                              ${
                                                conversation.status.toLowerCase() ===
                                                "escalated"
                                                  ? "border-red-500 text-red-400"
                                                  : ""
                                              }
                                            `}
                                            >
                                              {conversation.status}
                                            </Badge>
                                          )}
                                          {conversation.sentiment && (
                                            <Badge
                                              variant="secondary"
                                              className={`
                                              ${
                                                conversation.sentiment.toLowerCase() ===
                                                "positive"
                                                  ? "bg-green-500/20 text-green-400"
                                                  : ""
                                              }
                                              ${
                                                conversation.sentiment.toLowerCase() ===
                                                "neutral"
                                                  ? "bg-yellow-500/20 text-yellow-400"
                                                  : ""
                                              }
                                              ${
                                                conversation.sentiment.toLowerCase() ===
                                                "negative"
                                                  ? "bg-red-500/20 text-red-400"
                                                  : ""
                                              }
                                            `}
                                            >
                                              {conversation.sentiment}
                                            </Badge>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* AI Summary */}
                                  {conversation.summary && (
                                    <Card className="bg-slate-800 border-slate-600">
                                      <CardHeader>
                                        <CardTitle className="text-white">
                                          AI Summary
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-slate-300">
                                          {conversation.summary}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Audio Player */}
                                  {conversation.audio_url && (
                                    <Card className="bg-slate-800 border-slate-600">
                                      <CardHeader>
                                        <CardTitle className="text-white">
                                          Audio Recording
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <audio
                                          controls
                                          className="w-full"
                                          src={conversation.audio_url}
                                        >
                                          <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                                            <span className="text-slate-400">
                                              Your browser does not support the
                                              audio element.
                                            </span>
                                          </div>
                                        </audio>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Transcript */}
                                  {conversation.transcript && (
                                    <Card className="bg-slate-800 border-slate-600">
                                      <CardHeader>
                                        <CardTitle className="text-white">
                                          Transcript
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                          {conversation.transcript
                                            .split("\n")
                                            .map((line, index) => (
                                              <div
                                                key={index}
                                                className="flex gap-3"
                                              >
                                                <span className="text-sm text-slate-400 min-w-[80px]">
                                                  {line.startsWith("Agent:")
                                                    ? "Agent:"
                                                    : line.startsWith(
                                                        "Customer:"
                                                      )
                                                    ? "Customer:"
                                                    : "Speaker:"}
                                                </span>
                                                <span className="text-slate-300">
                                                  {line.replace(
                                                    /^(Agent:|Customer:)\s*/,
                                                    ""
                                                  )}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
