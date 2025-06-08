"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Play, Download, MoreHorizontal, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const conversations = [
  {
    id: 1,
    date: "2024-01-15",
    time: "14:32",
    customer: "Michael Thompson",
    phone: "+1 (555) 123-4567",
    agent: "Sarah Johnson",
    type: "GPS Issues",
    duration: "12m 34s",
    status: "Resolved",
    sentiment: "Positive",
    summary: "Customer had trouble with GPS navigation system. Guided through calibration process.",
    transcript:
      "Agent: Hello, this is Sarah from Yacht Support. How can I help you today?\nCustomer: Hi, I'm having issues with my GPS system...",
    tags: ["GPS", "Navigation", "Technical Support"],
  },
  {
    id: 2,
    date: "2024-01-15",
    time: "13:45",
    customer: "Jennifer Walsh",
    phone: "+1 (555) 987-6543",
    agent: "Mike Rodriguez",
    type: "Engine Support",
    duration: "8m 15s",
    status: "In Progress",
    sentiment: "Neutral",
    summary: "Engine performance concerns. Scheduled follow-up maintenance appointment.",
    transcript:
      "Agent: Good afternoon, this is Mike. What can I assist you with?\nCustomer: I've been noticing some unusual engine sounds...",
    tags: ["Engine", "Maintenance", "Follow-up"],
  },
  {
    id: 3,
    date: "2024-01-15",
    time: "12:18",
    customer: "Robert Chen",
    phone: "+1 (555) 456-7890",
    agent: "Lisa Kim",
    type: "Navigation",
    duration: "15m 42s",
    status: "Escalated",
    sentiment: "Negative",
    summary: "Complex navigation system malfunction. Escalated to technical team.",
    transcript:
      "Agent: Hello Mr. Chen, this is Lisa. I understand you're having navigation issues?\nCustomer: Yes, the system completely stopped working yesterday...",
    tags: ["Navigation", "Malfunction", "Escalated"],
  },
]

export function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || conv.status.toLowerCase() === statusFilter
    const matchesSentiment = sentimentFilter === "all" || conv.sentiment.toLowerCase() === sentimentFilter

    return matchesSearch && matchesStatus && matchesSentiment
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Conversations</h1>
        <p className="text-slate-400">Manage and analyze customer interactions</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by customer name or issue type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 focus:border-cyan-500"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-slate-600 text-slate-400 hover:bg-slate-800">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>

            <Button variant="outline" className="border-slate-600 text-slate-400 hover:bg-slate-800">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Date & Time</TableHead>
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Agent</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Sentiment</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.map((conversation) => (
                <TableRow key={conversation.id} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="text-white">
                    <div>
                      <div>{conversation.date}</div>
                      <div className="text-sm text-slate-400">{conversation.time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div>
                      <div>{conversation.customer}</div>
                      <div className="text-sm text-slate-400">{conversation.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{conversation.agent}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {conversation.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{conversation.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        ${conversation.status === "Resolved" ? "border-green-500 text-green-400" : ""}
                        ${conversation.status === "In Progress" ? "border-yellow-500 text-yellow-400" : ""}
                        ${conversation.status === "Escalated" ? "border-red-500 text-red-400" : ""}
                      `}
                    >
                      {conversation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`
                        ${conversation.sentiment === "Positive" ? "bg-green-500/20 text-green-400" : ""}
                        ${conversation.sentiment === "Neutral" ? "bg-yellow-500/20 text-yellow-400" : ""}
                        ${conversation.sentiment === "Negative" ? "bg-red-500/20 text-red-400" : ""}
                      `}
                    >
                      {conversation.sentiment}
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
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Conversation Details - {conversation.customer}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                              {conversation.date} at {conversation.time} • {conversation.duration}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-slate-800 border-slate-600">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm text-slate-400">Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <span className="text-sm text-slate-400">Name:</span>
                                    <span className="ml-2 text-white">{conversation.customer}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-slate-400">Phone:</span>
                                    <span className="ml-2 text-white">{conversation.phone}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-slate-400">Agent:</span>
                                    <span className="ml-2 text-white">{conversation.agent}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-slate-800 border-slate-600">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm text-slate-400">Call Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex flex-wrap gap-1">
                                    {conversation.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge
                                      variant="outline"
                                      className={`
                                        ${conversation.status === "Resolved" ? "border-green-500 text-green-400" : ""}
                                        ${conversation.status === "In Progress" ? "border-yellow-500 text-yellow-400" : ""}
                                        ${conversation.status === "Escalated" ? "border-red-500 text-red-400" : ""}
                                      `}
                                    >
                                      {conversation.status}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className={`
                                        ${conversation.sentiment === "Positive" ? "bg-green-500/20 text-green-400" : ""}
                                        ${conversation.sentiment === "Neutral" ? "bg-yellow-500/20 text-yellow-400" : ""}
                                        ${conversation.sentiment === "Negative" ? "bg-red-500/20 text-red-400" : ""}
                                      `}
                                    >
                                      {conversation.sentiment}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* AI Summary */}
                            <Card className="bg-slate-800 border-slate-600">
                              <CardHeader>
                                <CardTitle className="text-white">AI Summary</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-slate-300">{conversation.summary}</p>
                              </CardContent>
                            </Card>

                            {/* Audio Player */}
                            <Card className="bg-slate-800 border-slate-600">
                              <CardHeader>
                                <CardTitle className="text-white">Audio Recording</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                                  <Button size="icon" className="bg-cyan-500 hover:bg-cyan-600">
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <div className="flex-1 h-2 bg-slate-600 rounded-full">
                                    <div className="h-full w-1/3 bg-cyan-500 rounded-full"></div>
                                  </div>
                                  <span className="text-sm text-slate-400">4:32 / {conversation.duration}</span>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Transcript */}
                            <Card className="bg-slate-800 border-slate-600">
                              <CardHeader>
                                <CardTitle className="text-white">Transcript</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {conversation.transcript.split("\n").map((line, index) => (
                                    <div key={index} className="flex gap-3">
                                      <span className="text-sm text-slate-400 min-w-[60px]">
                                        {line.startsWith("Agent:") ? "Agent:" : "Customer:"}
                                      </span>
                                      <span className="text-slate-300">
                                        {line.replace(/^(Agent:|Customer:)\s*/, "")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
