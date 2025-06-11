"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  RotateCcw,
  Sparkles,
  Waves,
} from "lucide-react";
import Vapi from "@vapi-ai/web";

export function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [vapi, setVapi] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);

  // Initialize Vapi
  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
    setVapi(vapiInstance);

    // Handle call lifecycle events
    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsCallActive(true);
      setIsListening(true);
      console.log("Vapi call started");
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsCallActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setIsProcessing(false);
      console.log("Vapi call ended");
    });

    // Handle real-time conversation messages
    vapiInstance.on("message", (message) => {
      console.log("Vapi message:", message);

      if (message.type === "transcript") {
        if (message.role === "user") {
          setIsProcessing(true);
          setIsListening(false);
        } else if (message.role === "assistant") {
          setIsProcessing(false);
          setIsSpeaking(true);

          if (message.transcriptType === "final") {
            setTimeout(() => {
              setIsSpeaking(false);
              setIsListening(true);
            }, 1000);
          }
        }
      }

      if (message.type === "speech-update") {
        if (message.status === "started") {
          setIsSpeaking(true);
          setIsListening(false);
        } else if (message.status === "stopped") {
          setIsSpeaking(false);
          setIsListening(true);
        }
      }
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
      setIsConnected(false);
      setIsCallActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setIsProcessing(false);
    });

    // Cleanup on component unmount
    return () => {
      vapiInstance?.stop();
    };
  }, []);

  // Simulate audio visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        if (audioVisualizerRef.current) {
          const bars = audioVisualizerRef.current.children;
          for (let i = 0; i < bars.length; i++) {
            const height = Math.random() * 40 + 10;
            (bars[i] as HTMLElement).style.height = `${height}px`;
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const startListening = async () => {
    if (!vapi) return;

    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
    }
  };

  const stopListening = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  const handleMicToggle = () => {
    if (isCallActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {isConnected && (
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
            Connected
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => isCallActive && stopListening()}
          className="text-slate-400 hover:text-white"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Status Display */}
        <div className="text-center">
          {isListening && (
            <div className="space-y-2">
              <Badge className="marine-gradient text-white px-6 py-3 text-xl">
                <Waves className="h-5 w-5 mr-2" />
                Listening...
              </Badge>
              <p className="text-slate-400 text-lg">Speak now</p>
            </div>
          )}
          {isProcessing && (
            <div className="space-y-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-6 py-3 text-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Processing...
              </Badge>
              <p className="text-slate-400 text-lg">Analyzing your request</p>
            </div>
          )}
          {isSpeaking && (
            <div className="space-y-2">
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 text-xl">
                <Volume2 className="h-5 w-5 mr-2" />
                Speaking...
              </Badge>
              <p className="text-slate-400 text-lg">AI is responding</p>
            </div>
          )}
          {!isCallActive && !isProcessing && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-400 px-6 py-3 text-xl"
              >
                <Mic className="h-5 w-5 mr-2" />
                Ready
              </Badge>
              <p className="text-slate-400 text-lg">
                Click the microphone to start
              </p>
            </div>
          )}
        </div>

        {/* Audio Visualizer */}
        <div
          className="flex items-end justify-center gap-2 h-24"
          ref={audioVisualizerRef}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 rounded-full transition-all duration-100 ${
                isListening || isSpeaking ? "bg-cyan-400" : "bg-slate-600"
              }`}
              style={{ height: "10px" }}
            />
          ))}
        </div>

        {/* Main Microphone Button */}
        <div className="relative">
          {isCallActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 pulse-ring animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 pulse-ring"></div>
            </>
          )}
          <Button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={`h-40 w-40 rounded-full transition-all duration-300 ${
              isCallActive
                ? "bg-red-500 hover:bg-red-600 scale-110"
                : "marine-gradient glow-blue hover:glow-cyan hover:scale-105"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isCallActive ? (
              <MicOff className="h-16 w-16 text-white" />
            ) : (
              <Mic className="h-16 w-16 text-white" />
            )}
          </Button>
        </div>

        {/* Subtitle */}
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-2">
            Voice Assistant
          </h1>
          <p className="text-slate-400 text-lg">
            Speak naturally to analyze your customer service data
          </p>
        </div>
      </div>
    </div>
  );
}
