import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { toggleAssistant } from '../store/aiSlice';
import { sendMessage, addUserMessage } from '../store/assistantSlice';

export default function AIRestaurantAssistant() {
  const dispatch = useAppDispatch();
  const { isAssistantOpen } = useAppSelector((state) => state.ai);
  const { messages, status } = useAppSelector((state) => state.assistant);
  const [inputText, setInputText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === 'loading') return;

    dispatch(addUserMessage(inputText));
    const newMessages = [...messages, { role: 'user', content: inputText }];
    setInputText('');

    await dispatch(sendMessage(newMessages));
  };

  return (
    <>
      <button
        onClick={() => dispatch(toggleAssistant())}
        className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all z-50 flex items-center gap-2"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-surface border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: '600px', height: '80vh' }}
          >
            <div className="bg-secondary/50 p-4 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="text-primary" />
                <h3 className="font-bold text-white">AI Assistant</h3>
              </div>
              <button
                onClick={() => dispatch(toggleAssistant())}
                className="text-muted-foreground hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-secondary/40 text-foreground rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {status === 'loading' && (
                <div className="flex justify-start">
                  <div className="p-3 bg-secondary/40 text-muted-foreground rounded-xl rounded-bl-none">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 border-t border-border/50 bg-surface flex gap-2"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={status === 'loading'}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={status === 'loading'}
                className="px-3"
              >
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
