import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Terminal,
  RefreshCw,
  Wallet,
} from "lucide-react";
import {
  queryAIAssistant,
  ExtractedEntity,
  AssistantResponse,
} from "../services/aiAssistantService";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  engine?: string;
  entities?: ExtractedEntity[];
  isStreaming?: boolean;
}

export default function AIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: `### 🤖 BitFlow AI Cybercrime & AML SOC Assistant

Welcome to the **BitFlow Autonomous Forensics & Threat Intelligence Assistant**. I am linked to real-time mempool transactions, whale alert triggers, and the 100-member AML benchmark database.

**Quick Questions You Can Ask:**
- 🚨 **Wallet Risks**: *"Summarize high-risk wallets"* or *"Inspect M001"*
- ⚠️ **Threat Alerts**: *"Explain latest threat alert"* or *"Check mempool warnings"*
- 📊 **Transaction Volume**: *"Check transaction volume"* or *"Compare scammer vs genuine volume"*
- 🕸️ **Peeling Chains**: *"Trace peeling chain scam"* or *"How do money mules relay funds?"*

Tap a quick-prompt chip below or enter your inquiry.`,
      timestamp: "Just now",
      engine: "BitFlow SOC Core",
      entities: [
        { type: "wallet", value: "bc1qbitflowdemo0001synthetic", label: "bc1q...synthetic" },
        { type: "member", value: "M001", label: "M001 (Aarav Kumar)" },
        { type: "member", value: "M008", label: "M008 (Vikram Patel)" },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message or stream update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: "ai",
        text: `### 🤖 Chat Session Reset

Conversation history cleared. Ready for new inquiries on threat alerts, wallet risks, and mempool transactions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        engine: "BitFlow SOC Core",
      },
    ]);
  };

  const quickPromptChips = [
    { label: "🚨 Summarize high-risk wallets", query: "Summarize high-risk wallets and money mules" },
    { label: "⚠️ Explain latest threat alert", query: "Explain latest threat alert and whale movements" },
    { label: "📊 Check transaction volume", query: "Check transaction volume and mempool distribution" },
    { label: "🕸️ Trace peeling chain scam", query: "Trace peeling chain scam and intermediary hop velocity" },
    { label: "⚡ Inspect mempool congestion", query: "What is current mempool congestion and fee rate?" },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    try {
      // Build conversation history
      const history = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          text: m.text,
        }));

      // Fetch response
      const response: AssistantResponse = await queryAIAssistant(query, history);

      // Simulate realistic streaming response
      const aiMsgId = `ai-${Date.now()}`;
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Create streaming placeholder message
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: "",
          timestamp: aiTimestamp,
          engine: response.engine,
          entities: response.entities,
          isStreaming: true,
        },
      ]);
      setIsTyping(false);

      // Stream text chunk by chunk
      const fullText = response.text;
      let currentIndex = 0;
      const chunkSize = Math.max(3, Math.floor(fullText.length / 35));

      const streamInterval = setInterval(() => {
        currentIndex += chunkSize;
        if (currentIndex >= fullText.length) {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? { ...msg, text: fullText, isStreaming: false }
                : msg
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? { ...msg, text: fullText.slice(0, currentIndex) }
                : msg
            )
          );
        }
      }, 25);
    } catch (err) {
      console.error("Assistant query failed:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ **Forensic Telemetry Interruption**: Unable to retrieve fresh analysis for query "${query}". Please check connectivity or retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          engine: "Telemetry Fallback",
        },
      ]);
    }
  };

  // Helper to render Markdown text
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // H3
      if (line.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="text-sm font-bold text-amber-400 mt-2.5 mb-1.5 flex items-center gap-1.5 leading-snug"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      // H4
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-xs font-bold text-white mt-2 mb-1 flex items-center gap-1.5">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      // Bullet list item
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="ml-3.5 list-disc text-xs text-slate-300 leading-relaxed my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInlineCode(content) }} />
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <div
            key={idx}
            className="text-xs text-slate-200 my-1.5 bg-[#090c13] p-2.5 rounded-lg border border-[#1c2436] leading-relaxed"
          >
            <span dangerouslySetInnerHTML={{ __html: formatInlineCode(line) }} />
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1">
          <span dangerouslySetInnerHTML={{ __html: formatInlineCode(line) }} />
        </p>
      );
    });
  };

  const formatInlineCode = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      .replace(
        /`([^`]+)`/g,
        "<code class='px-1.5 py-0.5 rounded bg-[#131926] text-amber-400 font-mono text-[11px] border border-[#1c2436] font-medium'>$1</code>"
      );
  };

  return (
    <>
      {/* Floating Action Button in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="ai-assistant-fab"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? "bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-amber-500/20 scale-105"
              : "bg-[#0d111b] hover:bg-[#121725] text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-black/80"
          }`}
          title={isOpen ? "Close AI Assistant" : "Open BitFlow AI SOC Assistant"}
        >
          {/* Animated Green Online Indicator Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className={isOpen ? "text-slate-950" : "text-amber-400"} />
            <span className="text-xs font-bold tracking-tight">AI Assistant</span>
          </div>

          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
              isOpen ? "bg-slate-950/20 text-slate-950" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            SOC
          </span>
        </button>
      </div>

      {/* Slide-over Drawer / Modal View */}
      {isOpen && (
        <div
          id="ai-assistant-panel"
          className={`fixed z-50 flex flex-col bg-[#0d111b] border border-[#1c2436] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden transition-all duration-200 ${
            isExpanded
              ? "inset-4 sm:inset-10 max-w-5xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-5rem)]"
              : "right-4 bottom-20 sm:bottom-20 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] h-[640px] max-h-[calc(100vh-7rem)]"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#1c2436] bg-[#090c13] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Bot size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                    BitFlow AI SOC Assistant
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                    INTEL ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  Threat alerts, high-risk wallets & mempool analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear chat button */}
              <button
                id="btn-clear-chat"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121725] transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 size={15} />
              </button>

              {/* Expand / Minimize modal button */}
              <button
                id="btn-toggle-expand"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121725] transition-colors cursor-pointer"
                title={isExpanded ? "Dock to Right" : "Expand to Center Modal"}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Close button */}
              <button
                id="btn-close-ai-drawer"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121725] transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick-Prompt Chips Bar */}
          <div className="px-4 py-2 bg-[#0a0e17] border-b border-[#1c2436] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 shrink-0 font-medium">
              Quick:
            </span>
            {quickPromptChips.map((chip, idx) => (
              <button
                key={idx}
                id={`quick-prompt-${idx}`}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isTyping}
                className="px-2.5 py-1 rounded-full bg-[#121725] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium border border-[#1c2436] hover:border-amber-500/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090c13]/50">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  id={`chat-msg-${m.id}`}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-xl p-3.5 text-xs ${
                      isUser
                        ? "bg-amber-500 text-slate-950 font-medium shadow-sm"
                        : "bg-[#0d111b] border border-[#1c2436] text-slate-200 shadow-md"
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                    ) : (
                      <div>
                        {renderFormattedMarkdown(m.text)}

                        {/* Blinking streaming cursor if message is actively streaming */}
                        {m.isStreaming && (
                          <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1 animate-pulse align-middle" />
                        )}

                        {/* Quick-Copy Entities (Wallet Addresses or Member IDs) */}
                        {m.entities && m.entities.length > 0 && !m.isStreaming && (
                          <div className="mt-3 pt-2.5 border-t border-[#1c2436] flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 w-full block mb-0.5">
                              Quick Copy Entities:
                            </span>
                            {m.entities.map((entity, eIdx) => {
                              const copyKey = `${m.id}-${entity.value}`;
                              const isCopied = copiedId === copyKey;
                              return (
                                <button
                                  key={eIdx}
                                  onClick={() => handleCopy(entity.value, copyKey)}
                                  className={`px-2 py-1 rounded bg-[#090c13] text-[10px] font-mono border transition-colors flex items-center gap-1 cursor-pointer ${
                                    isCopied
                                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                      : "border-[#1c2436] text-amber-300 hover:border-amber-500/40 hover:text-amber-200"
                                  }`}
                                  title={`Click to copy: ${entity.value}`}
                                >
                                  {entity.type === "wallet" ? (
                                    <Wallet size={10} className="shrink-0" />
                                  ) : (
                                    <Terminal size={10} className="shrink-0" />
                                  )}
                                  <span>{entity.label || entity.value}</span>
                                  {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Full Response Copy Button */}
                        {!m.isStreaming && (
                          <div className="mt-2.5 pt-2 border-t border-[#1c2436]/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono">{m.engine || "BitFlow Core"}</span>
                            <button
                              onClick={() => handleCopy(m.text, `full-${m.id}`)}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#121725] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Copy response text"
                            >
                              {copiedId === `full-${m.id}` ? (
                                <>
                                  <Check size={11} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Sender Meta */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                    <span>{m.timestamp}</span>
                    {!isUser && m.engine && <span>• {m.engine}</span>}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-[#0d111b] border border-[#1c2436] p-3 rounded-xl max-w-sm">
                <RefreshCw size={13} className="animate-spin text-amber-400 shrink-0" />
                <span className="font-medium">AI SOC Assistant analyzing mempool & ledger telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#090c13] border-t border-[#1c2436] flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              id="ai-assistant-input"
              type="text"
              placeholder="Ask about threat alerts, wallet risks, or mempool transactions..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isTyping}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d111b] border border-[#1c2436] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/80 transition-colors"
            />

            <button
              id="ai-assistant-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isTyping || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Send size={13} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
