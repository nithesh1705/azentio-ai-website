'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getLiveSessionById,
  getLiveComments,
  postLiveComment,
  reportLiveComment,
  endLiveSession,
} from '@/server/dal/employee/live';
import { LiveSession, LiveComment } from '@/types';
import {
  Radio,
  Play,
  Calendar,
  Clock,
  Users,
  Download,
  Bell,
  Send,
  Flag,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  AlertTriangle,
  StopCircle,
} from 'lucide-react';

export default function LiveSessionDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<LiveSession | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [reminderSet, setReminderSet] = useState<boolean>(false);
  const [mediaStreamUrl, setMediaStreamUrl] = useState<string | null>(null);

  const isPublisher =
    actor?.platformGrants?.includes('content_publisher') ||
    actor?.platformGrants?.includes('portal_admin');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee || !sessionId) return;
    try {
      const s = getLiveSessionById(actor, sessionId);
      if (s) setSession(s);
      const c = getLiveComments(actor, sessionId);
      setComments(c);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, sessionId]);

  // Load media route safely
  useEffect(() => {
    if (!session) return;
    fetch(`/api/media/${session.id}`, {
      headers: {
        'x-persona-employee': 'true',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.streamUrl) setMediaStreamUrl(data.streamUrl);
      })
      .catch((err) => console.error('Media stream load error:', err));
  }, [session]);

  // Countdown timer
  useEffect(() => {
    if (!session || session.status === 'ended') return;
    const interval = setInterval(() => {
      const diff = new Date(session.startTime).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Live Now');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !newComment.trim() || !session) return;

    try {
      postLiveComment(actor, session.id, newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    }
  };

  const handleReportComment = (commentId: string) => {
    if (!actor) return;
    if (confirm('Report this comment for inappropriate or off-topic content?')) {
      try {
        reportLiveComment(actor, commentId);
        loadData();
        alert('Comment reported. Thank you for maintaining community guidelines.');
      } catch (e: any) {
        alert(e.message || 'Failed to report comment');
      }
    }
  };

  const handleEndSession = () => {
    if (!actor || !session || !isPublisher) return;
    if (confirm('End this broadcast and archive the recording for employees?')) {
      try {
        endLiveSession(actor, session.id, `media-rec-${session.id}`);
        loadData();
      } catch (e: any) {
        alert(e.message || 'Failed to end session');
      }
    }
  };

  // Download .ics calendar event
  const downloadCalendarIcs = () => {
    if (!session) return;
    const startDate = new Date(session.startTime);
    const endDate = new Date(startDate.getTime() + session.durationMinutes * 60 * 1000);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Azentio Software//Employee Broadcasts//EN',
      'BEGIN:VEVENT',
      `UID:${session.id}@azentio.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${session.title}`,
      `DESCRIPTION:${session.description.replace(/\n/g, '\\n')}`,
      `LOCATION:Azentio Employee Broadcast Portal`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${session.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Radio className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Session Not Found</h2>
        <Link
          href="/employee/live"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Live Broadcasts</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/live"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-500">{session.id}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                  session.status === 'live'
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold'
                    : session.status === 'scheduled'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {session.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{session.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadCalendarIcs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            onClick={() => setReminderSet(!reminderSet)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              reminderSet
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-card border-border hover:bg-muted'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{reminderSet ? 'Reminder Set' : 'Remind Me'}</span>
          </button>

          {isPublisher && session.status !== 'ended' && (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 shadow-xs"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Stream Player (Left 2 cols) & Q&A Chat (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Player Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-border shadow-md flex items-center justify-center">
            {session.status === 'scheduled' ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Broadcast Scheduled</h3>
                <div className="text-2xl font-mono font-extrabold text-rose-400">{countdown}</div>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Stream will start automatically when host initiates broadcast.
                </p>
              </div>
            ) : mediaStreamUrl ? (
              <video
                src={mediaStreamUrl}
                controls
                autoPlay={session.status === 'live'}
                className="w-full h-full object-cover"
                poster={session.thumbnailUrl}
              />
            ) : (
              <div className="text-center text-zinc-400 text-xs">
                Connecting to secure internal media proxy (/api/media/{session.id})...
              </div>
            )}
          </div>

          {/* Details & Agenda Card */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {session.hostName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{session.hostName}</h3>
                  <p className="text-xs text-muted-foreground">{session.hostRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {session.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(session.startTime).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Session Description
              </h4>
              <p className="text-xs sm:text-sm text-foreground/90">{session.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Agenda
              </h4>
              <ul className="space-y-2">
                {session.agenda.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Live Q&A / Discussion Thread */}
        <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs min-h-[500px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Q&A and Discussion</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {comments.length} Comments
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No questions yet. Be the first to ask!
                </div>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                      comm.parentId
                        ? 'ml-5 border-border/40 bg-muted/20'
                        : 'border-border/70 bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{comm.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => handleReportComment(comm.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Report Comment"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-foreground/90">{comm.body}</p>

                    {!comm.parentId && (
                      <button
                        onClick={() => setReplyingTo(comm.id)}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="pt-4 border-t border-border space-y-2">
            {replyingTo && (
              <div className="flex items-center justify-between text-[11px] bg-muted/60 px-2.5 py-1 rounded-lg text-muted-foreground">
                <span>Replying to comment #{replyingTo}</span>
                <button onClick={() => setReplyingTo(null)} className="font-bold hover:text-foreground">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a technical question..."
                className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
