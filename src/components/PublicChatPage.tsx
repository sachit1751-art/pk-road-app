import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { CommunityPost, ChannelId } from '../types';
import { MessageSquare, Search, Lock, ArrowLeft, BadgeCheck } from 'lucide-react';
import { PUBLIC_COLONY } from '../public-colony-config';

const PUBLIC_CHANNELS: { id: ChannelId; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Casual colony chat & notices' },
  { id: 'events', label: 'Events', description: 'Festivals, sports, community gatherings' },
  { id: 'buy-sell', label: 'Buy & Sell', description: 'Marketplace for furniture and items' },
  { id: 'lost-found', label: 'Lost & Found', description: 'Lost pets, keys and items' },
];

const EMPTY_CHAT_MESSAGE =
  'No public discussions yet. Community discussions will appear here once they are published for public viewing.';

export const PublicChatPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeChannel, setActiveChannel] = useState<ChannelId>('general');
  const [search, setSearch] = useState('');

  const publicPosts: CommunityPost[] = PUBLIC_COLONY.publicPosts;

  const filtered = publicPosts
    .filter((post) => post.channel === activeChannel)
    .filter((post) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return post.content.toLowerCase().includes(q) || post.title?.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A2530]">Community Chat</h1>
          <p className="mt-1 text-sm text-stone-600">Browse public discussions and stay connected with the community.</p>
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
            <p className="font-semibold">You can only read public discussions.</p>
            <p className="text-stone-600">
              Log in to participate, reply, react or start new conversations.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2530] px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900"
            >
              <BadgeCheck className="h-4 w-4" />
              Log in to participate
            </button>
          </div>
        </div>
      </div>

      {/* Channel filter */}
      <div className="flex flex-wrap gap-2">
        {PUBLIC_CHANNELS.map((channel) => {
          const isActive = activeChannel === channel.id;
          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'border-[#1A2530] bg-[#1A2530] text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              {channel.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search public discussions..."
          className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-stone-400 focus:border-stone-600 focus:outline-none"
        />
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          {EMPTY_CHAT_MESSAGE}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post) => (
            <li key={post.id} className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300">
              {post.title && (
                <h3 className="text-base font-semibold text-[#1A2530]">{post.title}</h3>
              )}
              <p className="mt-1 text-sm text-stone-600 line-clamp-2">{post.content}</p>

              {post.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 max-h-72">
                  <img src={post.imageUrl} alt="Discussion attachment" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                <span>• {formatDate(post.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer CTA */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-700">
        This is a public preview.{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-semibold text-[#1A2530] underline-offset-2 hover:underline"
        >
          Log in to participate
        </button>
      </div>
    </div>
  );
};

function channelLabel(channel: string): string {
  return channel.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
