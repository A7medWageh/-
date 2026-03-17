'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  created_at: string;
  admin_reply?: string;
  replied_at?: string;
}

export default function MessagesPage() {
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('يرجى إدخال بريدك الإلكتروني');
      return;
    }

    setLoading(true);
    setError('');
    setMessages([]);

    try {
      const response = await fetch('/api/messages?email=' + encodeURIComponent(email));
      
      if (!response.ok) {
        throw new Error('فشل في جلب الرسائل');
      }

      const data = await response.json();
      setMessages(data);
      setSearched(true);

      if (data.length === 0) {
        setError('لم نجد رسائل لهذا البريد الإلكتروني');
      }
    } catch (err) {
      setError('حدث خطأ في جلب رسائلك');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground">تتبع رسائلك</h1>
          <p className="text-muted-foreground mt-2">ادخل بريدك الإلكتروني لعرض رسائلك والردود</p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8 shadow-lg">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  جاري البحث...
                </>
              ) : (
                'البحث'
              )}
            </Button>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Messages List */}
        {searched && messages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">رسائلك ({messages.length})</h2>
            {messages.map((msg) => (
              <Card key={msg.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium text-foreground">{msg.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الموضوع</p>
                    <p className="font-medium text-foreground">{msg.subject}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">رسالتك</p>
                  <p className="text-foreground bg-muted p-3 rounded border border-border">
                    {msg.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleDateString('ar-SA')} - {new Date(msg.created_at).toLocaleTimeString('ar-SA')}
                  </p>
                </div>

                {/* Reply Section */}
                {msg.admin_reply ? (
                  <div className="bg-primary/10 border border-primary/20 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                      <p className="font-medium text-primary">رد الفريق</p>
                    </div>
                    <p className="text-foreground mb-2">{msg.admin_reply}</p>
                    {msg.replied_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.replied_at).toLocaleDateString('ar-SA')} - {new Date(msg.replied_at).toLocaleTimeString('ar-SA')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-warning/10 border border-warning/20 rounded p-4">
                    <p className="text-warning text-sm">⏳ الفريق يعمل على الرد على رسالتك</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searched && messages.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted/50 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد رسائل</p>
          </div>
        )}
      </div>
    </div>
  );
}
