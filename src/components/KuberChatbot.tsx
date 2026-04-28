import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, X, Send, Sparkles, Loader2, User, Minimize2, Calculator } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "If I invest ₹5,000/month for 10 years at 12%, what will I get?",
  "How much SIP do I need to save ₹10 lakh in 5 years?",
  "Explain SIP vs Lumpsum — which is better for me?",
  "What's a good monthly budget for a college student?",
];

const STORAGE_KEY = "kuber_chat_history";

const KuberChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kuber-chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) throw new Error("Too many requests. Please wait a moment.");
        if (resp.status === 402) throw new Error("AI service temporarily unavailable.");
        throw new Error(err.error || "Failed to reach KUBER");
      }

      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        data-tour="kuber-chat"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 ${isOpen ? "hidden" : ""}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-glow flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-accent-foreground" />
          </motion.div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[620px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] flex flex-col glass-card rounded-2xl shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">KUBER</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    AI Advisor • SIP/EMI/Goal calculators
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear chat"
                    className="p-2 hover:bg-secondary rounded-lg transition-colors text-xs text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-2">
                    Hi! I'm KUBER 👋
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your personal AI financial advisor. I can run real SIP, lumpsum, EMI and goal-planning calculations — just ask in plain English.
                  </p>
                  <div className="flex items-center gap-2 justify-center mb-4 text-xs text-muted-foreground">
                    <Calculator className="w-3 h-3 text-primary" />
                    <span>Powered by Gemini + financial tool-calling</span>
                  </div>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleSend(question)}
                        className="block w-full text-left text-sm p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-accent"
                          : "bg-gradient-to-br from-primary to-primary/80"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-accent-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-accent text-accent-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary text-foreground rounded-2xl rounded-bl-md p-3 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground text-xs">Crunching numbers…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-secondary/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about SIP, goals, EMIs, budgeting..."
                  disabled={isLoading}
                  className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KuberChatbot;
