"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Plus,
  MoreHorizontal,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Mic,
  Paperclip,
  Phone,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: CallSource[];
  confidence?: string;
  isTyping?: boolean;
}

interface CallSource {
  call_id: string;
  agent_name: string;
  customer_name: string;
  call_timestamp: string;
  issue_type: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const API_BASE_URL = "http://localhost:8000";

const initialSessions: ChatSession[] = [
  {
    id: "1",
    title: "Customer Satisfaction Analysis",
    lastMessage: "Show me the satisfaction trends for this month",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    title: "GPS Issue Investigation",
    lastMessage: "What are the most common GPS problems?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    title: "Agent Performance Review",
    lastMessage: "Compare agent performance metrics",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

// Source Cards Component
const SourceCards = ({ sources }: { sources: CallSource[] }) => {
  if (!sources?.length) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCardClick = (uid: string) => {
    // You can replace this with your actual routing logic
    window.open(`/recent-calls/${uid}`, "_blank");
    // Or use: router.push(`/recent-calls/${uid}`);
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Phone className="h-4 w-4 text-cyan-400" />
        <span>
          {sources.length} relevant call{sources.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {sources.map((source, index) => (
          <Card
            key={source.call_id}
            className="kpi-card card-hover cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:glow-cyan"
            onClick={() => handleCardClick(source.call_id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full marine-gradient glow-blue flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {source.agent_name} → {source.customer_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {source.issue_type} • {formatDate(source.call_timestamp)}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState("1");
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callAPI = async (question: string, conversationHistory: any[]) => {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      // Prepare conversation history
      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await callAPI(currentInput, conversationHistory);
      // console.log(response);
      let parsedContent;
      try {
        parsedContent = JSON.parse(response.answer);
      } catch (parseError) {
        console.error("Failed to parse content JSON:", parseError);
        // Fallback to original content if parsing fails
        parsedContent = { answer: response.content };
      }
      console.log(parsedContent.sources);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: parsedContent.answer,
        sources: parsedContent.sources || [],
        confidence: parsedContent.confidence || "medium",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update session
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSession
            ? { ...session, lastMessage: currentInput, timestamp: new Date() }
            : session
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to get response");
      console.error("API Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-500/30 text-green-300 border border-green-500/50";
      case "negative":
        return "bg-red-500/30 text-red-300 border border-red-500/50";
      case "neutral":
        return "bg-slate-500/30 text-slate-300 border border-slate-500/50";
      default:
        return "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-300";
      case "medium":
        return "text-cyan-300";
      case "low":
        return "text-orange-300";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 kpi-card border-r border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={startNewChat}
            className="w-full justify-start gap-2 marine-gradient glow-blue hover:glow-cyan text-white"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 mb-1 ${
                  currentSession === session.id
                    ? "marine-gradient-subtle glow-cyan border border-cyan-500/30"
                    : "hover:bg-slate-800/50 hover:border-slate-600 border border-transparent"
                }`}
              >
                <div className="font-medium text-white text-sm truncate">
                  {session.title}
                </div>
                <div className="text-xs text-slate-400 truncate mt-1">
                  {session.lastMessage || "No messages yet"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatTime(session.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-4 header-gradient">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full marine-gradient glow-blue flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">
                  Yacht Analytics Assistant
                </h1>
                <p className="text-sm text-slate-400">Powered by AI</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-slate-700"
              >
                <DropdownMenuItem>Export chat</DropdownMenuItem>
                <DropdownMenuItem>Clear conversation</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full marine-gradient glow-blue flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Hello! I'm your Yacht Analytics Assistant
                </h2>
                <p className="text-slate-400 mb-6">
                  I can help you analyze customer service data, review
                  conversation trends, and provide insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    "Show me customer satisfaction trends",
                    "What are the most common GPS issues?",
                    "Compare agent performance metrics",
                    "Analyze call volume patterns",
                  ].map((suggestion, index) => (
                    <Card
                      key={index}
                      className="kpi-card card-hover cursor-pointer"
                      onClick={() => setInputValue(suggestion)}
                    >
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-300">
                          {suggestion}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Card className="kpi-card border-red-500/50 bg-red-900/20">
                <CardContent className="p-4 flex items-center gap-2">
                  <div className="text-red-400">⚠️</div>
                  <span className="text-red-400">{error}</span>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                {message.type === "assistant" && (
                  <div className="h-8 w-8 rounded-full marine-gradient glow-blue flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`flex-1 ${message.type === "user" ? "ml-12" : ""}`}
                >
                  <div
                    className={`${
                      message.type === "user"
                        ? "marine-gradient glow-blue text-white ml-auto max-w-2xl rounded-2xl px-4 py-3"
                        : "text-slate-300"
                    }`}
                  >
                    {message.type === "user" && (
                      <div className="text-xs opacity-80 mb-1">You</div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {/* Display source cards if they exist */}
                  {message.type === "assistant" && message.sources && (
                    <SourceCards sources={message.sources} />
                  )}

                  {message.type === "assistant" && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500 hover:text-slate-300"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500 hover:text-slate-300"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500 hover:text-slate-300"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500 hover:text-slate-300"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {message.type === "user" && (
                  <div className="">
                    <span className="text-sm  text-cyan-400">You</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full marine-gradient glow-blue flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-slate-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4 glass-effect">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your customer service data..."
                  className="pr-20 py-3 text-base bg-slate-800 border-slate-600 focus:border-cyan-500 focus:glow-cyan rounded-2xl text-white placeholder:text-slate-400"
                  disabled={isTyping}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-300"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-300"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-12 w-12 rounded-full marine-gradient glow-blue hover:glow-cyan disabled:bg-slate-700 disabled:text-slate-500"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-slate-500 mt-2 text-center">
              AI can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
