"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Vapi from "@vapi-ai/web";

const exampleQueries = [
  "Show me frustrated customers this week",
  "What are the top GPS issues?",
  "Which agent has the highest satisfaction?",
  "How many calls were escalated today?",
  "What's the average resolution time?",
];

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [vapi, setVapi] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    // Initialize Vapi Web SDK
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
    setVapi(vapiInstance);

    // Handle call lifecycle events
    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsCallActive(true);
      console.log("Call started");
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsCallActive(false);
      console.log("Call ended");
    });

    // Handle real-time conversation messages
    vapiInstance.on("message", (message) => {
      console.log("Vapi message:", message);

      if (message.type === "transcript") {
        const newMessage = {
          type: message.role === "user" ? "user" : "ai",
          content: message.transcript,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }

      // Handle function calls if your assistant uses them
      if (message.type === "function-call") {
        console.log("Function call:", message);
        // Handle any function calls your assistant might make
      }

      // Handle speech updates for real-time transcription
      if (message.type === "speech-update") {
        console.log("Speech update:", message);
      }
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
      setIsConnected(false);
      setIsCallActive(false);
    });

    // Cleanup on component unmount
    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startVoiceCall = async () => {
    if (!vapi) return;

    try {
      // Replace 'YOUR_ASSISTANT_ID' with your actual assistant ID
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const endVoiceCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  const handleVoiceToggle = () => {
    if (isCallActive) {
      endVoiceCall();
    } else {
      startVoiceCall();
    }
  };

  const handleTextQuery = (query) => {
    // For text input, you can either:
    // 1. Start a voice call and let the assistant respond
    // 2. Use a separate text-based API endpoint
    // 3. Convert text to speech and use voice call

    const newMessage = { type: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);

    // Option 1: Start voice call for text input
    if (!isCallActive) {
      startVoiceCall();
      // You might want to use text-to-speech to "speak" the query
    }

    setInputValue("");
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleTextQuery(inputValue);
    }
  };

  const handleExampleQuery = (query) => {
    handleTextQuery(query);
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            {isConnected && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 pulse-ring"></div>
            )}
            <Button
              onClick={() => setIsOpen(true)}
              className={`h-14 w-14 rounded-full marine-gradient glow-blue hover:glow-cyan transition-all duration-300 ${
                isConnected ? "scale-110" : ""
              }`}
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
      </div>

      {/* Voice Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96">
          <Card className="voice-assistant-card shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="h-8 w-8 rounded-full marine-gradient flex items-center justify-center">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                Voice Assistant
                {isConnected && (
                  <Badge className="bg-green-500/20 text-green-400 ml-2">
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="h-64 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Mic className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                    <p>Ask me anything about your customer service data</p>
                    <p className="text-xs mt-2">
                      Click the mic to start voice chat
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "marine-gradient text-white"
                            : "glass-effect text-slate-300 border border-slate-600/30"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Example Queries */}
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Try asking:</p>
                  <div className="space-y-1">
                    {exampleQueries.slice(0, 3).map((query, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExampleQuery(query)}
                        className="w-full justify-start text-left text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                      >
                        "{query}"
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleVoiceToggle}
                  variant={isCallActive ? "destructive" : "outline"}
                  size="icon"
                  className={`${
                    isCallActive
                      ? "bg-red-500 hover:bg-red-600"
                      : "border-slate-600 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {isCallActive ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500"
                    disabled={isCallActive}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-cyan-500 hover:bg-cyan-600"
                    disabled={isCallActive}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isConnected && (
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400"
                  >
                    {isCallActive ? "Voice Active - Speak now" : "Connected"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
