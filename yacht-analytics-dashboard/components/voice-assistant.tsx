"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, X } from "lucide-react"
import { Input } from "@/components/ui/input"

const exampleQueries = [
  "Show me frustrated customers this week",
  "What are the top GPS issues?",
  "Which agent has the highest satisfaction?",
  "How many calls were escalated today?",
  "What's the average resolution time?",
]

const mockResponses = {
  "frustrated customers":
    "I found 12 customers with negative sentiment this week. The main issues were GPS calibration (5 cases) and engine performance (4 cases). Would you like me to show you the detailed breakdown?",
  "gps issues":
    "GPS-related issues account for 32% of all calls this week. The most common problems are: calibration errors (45%), system freezing (30%), and map updates (25%). Sarah Johnson has resolved the most GPS cases with a 98% success rate.",
  "highest satisfaction":
    "Lisa Kim has the highest customer satisfaction rating at 4.9/5.0 this week, followed by Sarah Johnson at 4.8/5.0. Lisa has handled 38 calls with a 97% resolution rate.",
  "escalated today":
    "15 calls were escalated today, which is 6% of total calls. Main escalation reasons: complex technical issues (8), billing disputes (4), and warranty claims (3).",
  "resolution time":
    "The current average resolution time is 8.7 minutes, which is an 8% improvement from last week. The fastest resolver is Lisa Kim at 7.8 minutes average.",
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false)
        handleQuery("Show me frustrated customers this week")
      }, 3000)
    }
  }

  const handleQuery = (query) => {
    const newMessage = { type: "user", content: query, timestamp: new Date() }
    setMessages((prev) => [...prev, newMessage])

    // Simulate AI response
    setTimeout(() => {
      const lowerQuery = query.toLowerCase()
      let response = "I'm not sure about that. Could you try rephrasing your question?"

      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerQuery.includes(key)) {
          response = value
          break
        }
      }

      const aiMessage = { type: "ai", content: response, timestamp: new Date() }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)

    setInputValue("")
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleQuery(inputValue)
    }
  }

  const handleExampleQuery = (query) => {
    handleQuery(query)
    setIsOpen(true)
  }

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            {isListening && <div className="absolute inset-0 rounded-full bg-cyan-500/30 pulse-ring"></div>}
            <Button
              onClick={() => setIsOpen(true)}
              className={`h-14 w-14 rounded-full marine-gradient glow-blue hover:glow-cyan transition-all duration-300 ${
                isListening ? "scale-110" : ""
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
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "marine-gradient text-white"
                            : "glass-effect text-slate-300 border border-slate-600/30"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
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
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`${
                    isListening ? "bg-red-500 hover:bg-red-600" : "border-slate-600 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-slate-800 border-slate-600 focus:border-cyan-500"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="bg-cyan-500 hover:bg-cyan-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isListening && (
                <div className="text-center">
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                    Listening...
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
