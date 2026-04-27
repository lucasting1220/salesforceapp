import { useState } from "react";
import { Star, StarOff, Search, Menu, RefreshCw, ChevronLeft, Archive, Trash2, Clock } from "lucide-react";
import { emails, clients, type Email } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface SimulatedGmailProps {
  onClientDetected: (clientId: string | null) => void;
}

const SimulatedGmail = ({ onClientDetected }: SimulatedGmailProps) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (email.clientId) {
      onClientDetected(email.clientId);
    } else {
      onClientDetected(null);
    }
  };

  const handleBack = () => {
    setSelectedEmail(null);
    onClientDetected(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8fc] rounded-lg overflow-hidden">
      {/* Gmail top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f6f8fc] border-b border-[#e0e0e0]">
        <Menu className="h-5 w-5 text-[#5f6368] cursor-pointer" />
        <div className="flex items-center flex-1 bg-[#eaf1fb] rounded-full px-4 py-2">
          <Search className="h-4 w-4 text-[#5f6368] mr-3" />
          <span className="text-sm text-[#5f6368]">Search mail</span>
        </div>
      </div>

      {/* Email list or email view */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedEmail ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e0e0e0] text-[#5f6368]">
                <input type="checkbox" className="mr-2 accent-[#1a73e8]" />
                <RefreshCw className="h-4 w-4 cursor-pointer hover:text-[#202124]" />
                <span className="text-xs ml-auto">1–{emails.length} of {emails.length}</span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#e0e0e0]">
                <div className="px-6 py-2.5 text-sm font-medium text-[#1a73e8] border-b-2 border-[#1a73e8]">Primary</div>
                <div className="px-6 py-2.5 text-sm text-[#5f6368]">Promotions</div>
                <div className="px-6 py-2.5 text-sm text-[#5f6368]">Social</div>
              </div>

              {/* Emails */}
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-[#f0f0f0] hover:shadow-[inset_0_-1px_0_#dadce0,inset_0_1px_0_#dadce0] transition-shadow ${
                    !email.read ? "bg-[#fff]" : "bg-[#f6f8fc]"
                  }`}
                >
                  <input type="checkbox" className="accent-[#1a73e8] shrink-0" />
                  {email.starred ? (
                    <Star className="h-4 w-4 text-[#f4b400] fill-[#f4b400] shrink-0" />
                  ) : (
                    <StarOff className="h-4 w-4 text-[#c4c7c5] shrink-0" />
                  )}
                  <span className={`text-sm w-36 shrink-0 truncate ${!email.read ? "font-semibold text-[#202124]" : "text-[#5f6368]"}`}>
                    {email.from}
                  </span>
                  <div className="flex-1 min-w-0 flex items-baseline gap-1">
                    <span className={`text-sm truncate ${!email.read ? "font-semibold text-[#202124]" : "text-[#5f6368]"}`}>
                      {email.subject}
                    </span>
                    <span className="text-sm text-[#5f6368] truncate"> — {email.preview}</span>
                  </div>
                  <span className="text-xs text-[#5f6368] shrink-0 ml-2">{email.time}</span>
                  {email.clientId && (
                    <span className="shrink-0 h-2 w-2 rounded-full bg-[#1a73e8] animate-pulse" title="Client detected" />
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fff]"
            >
              {/* Email toolbar */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e0e0e0] text-[#5f6368]">
                <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-[#202124]" onClick={handleBack} />
                <Archive className="h-4 w-4 cursor-pointer hover:text-[#202124]" />
                <Trash2 className="h-4 w-4 cursor-pointer hover:text-[#202124]" />
                <Clock className="h-4 w-4 cursor-pointer hover:text-[#202124]" />
              </div>

              {/* Email content */}
              <div className="p-6">
                <h2 className="text-xl text-[#202124] font-normal mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-[#fff] font-medium text-sm">
                    {selectedEmail.from.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#202124]">{selectedEmail.from}</span>
                      <span className="text-xs text-[#5f6368]">&lt;{selectedEmail.fromEmail}&gt;</span>
                    </div>
                    <span className="text-xs text-[#5f6368]">to me</span>
                  </div>
                  <span className="text-xs text-[#5f6368] ml-auto">{selectedEmail.time}</span>
                </div>
                <div className="text-sm text-[#202124] leading-relaxed whitespace-pre-line">
                  {selectedEmail.body}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimulatedGmail;
