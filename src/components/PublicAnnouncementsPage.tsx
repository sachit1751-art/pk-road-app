import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { Announcement } from '../types';
import { AlertTriangle, Megaphone, Pin, Clock, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { PUBLIC_COLONY, formatDate } from '../public-colony-config';

const PAGE_PUBLIC_ANNOUNCEMENTS: Announcement[] = PUBLIC_COLONY.publicAnnouncements;

function pageFormatDate(iso: string): string {
  return formatDate(iso);
}

export const PublicAnnouncementsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Emergency',
    'Water Shutdown',
    'Maintenance',
    'Electricity',
    'Meeting',
    'Security',
    'General',
    'Event',
  ];

  const combined = [...PAGE_PUBLIC_ANNOUNCEMENTS];

  const filtered = combined.filter((ann) => {
    if (selectedCategory !== 'ALL' && ann.category !== selectedCategory) return false;
    return true;
  });

  const pinned = filtered.filter((a) => a.isPinned);
  const rest = filtered.filter((a) => !a.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A2530]">Announcements</h1>
          <p className="mt-1 text-sm text-stone-600">Stay updated with the latest news and important colony information.</p>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Read-only banner */}
      <div className="rounded-xl border border-stone-200 bg-blue-50 p-4 text-sm text-stone-800">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-stone-200 text-stone-600">
            <Lock className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">You can only view public announcements here.</p>
            <p className="text-stone-600">
              Log in for resident access to more updates, acknowledgements and account-related notices.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2530] px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'border-[#1A2530] bg-[#1A2530] text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              {category}
            </button>
          );
        })}
      </div>

      {/* Announcement list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          No public announcements in this category yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {[...pinned, ...rest].map((ann) => (
            <li
              key={ann.id}
              onClick={() => navigate(`/announcements/${ann.id}`)}
              className={`group rounded-2xl border p-5 transition cursor-pointer ${
                ann.priority === 'emergency'
                  ? 'border-rose-300 bg-rose-50/60'
                  : ann.priority === 'urgent'
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-stone-100 px-2.5 py-0.5 text-stone-700">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                  {ann.priority === 'emergency' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-100 px-2.5 py-0.5 text-rose-800">
                      <AlertTriangle className="h-3 w-3" />
                      Emergency
                    </span>
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800">
                      Urgent
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600">
                    {ann.category}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-stone-500">{pageFormatDate(ann.createdAt)}</span>
              </div>

              <h3 className={`mt-2 text-base font-semibold ${
                ann.priority === 'emergency' ? 'text-rose-900' : 'text-[#1A2530]'
              }`}>
                {ann.title}
              </h3>

              <p className="mt-1 text-sm text-stone-600 line-clamp-2">{ann.content}</p>

              <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                <Clock className="h-4 w-4" />
                Public notice
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer CTA */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-700">
        Some resident notices are only shown inside the resident app.{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-semibold text-[#1A2530] underline-offset-2 hover:underline"
        >
          Log in for resident access
        </button>
      </div>
    </div>
  );
};

export function PublicAnnouncementDetail({ announcementId }: { announcementId: string }) {
  const { navigate } = useRouter();
  const announcement = [...PAGE_PUBLIC_ANNOUNCEMENTS].find((a) => a.id === announcementId);

  if (!announcement) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-stone-600">Announcement not found.</p>
        <button
          onClick={() => navigate('/announcements')}
          className="mt-2 inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-5 py-2 text-sm font-semibold transition hover:bg-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Announcements
        </button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate('/announcements')}
        className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Announcements
      </button>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-stone-100 px-2.5 py-0.5 text-stone-700">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          {announcement.priority === 'emergency' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-100 px-2.5 py-0.5 text-rose-800">
              <AlertTriangle className="h-3 w-3" />
              Emergency
            </span>
          )}
          {announcement.priority === 'urgent' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800">
              Urgent
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600">
            {announcement.category}
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1A2530]">{announcement.title}</h2>
        <p className="mt-2 text-sm text-stone-500">
          <Clock className="inline h-4 w-4" />
          {pageFormatDate(announcement.createdAt)} · Public notice
        </p>
        <hr className="my-5 border-stone-200" />
      </header>

      <p className="text-sm leading-relaxed text-stone-700">{announcement.content}</p>
    </article>
  );
}


