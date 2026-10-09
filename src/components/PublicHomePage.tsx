import React from 'react';
import { useRouter } from '../router/Router';
import { MapPin, Building, ArrowRight, ExternalLink } from 'lucide-react';
import { PUBLIC_COLONY, colonyAddressString, formatDate } from '../public-colony-config';

export const PublicHomePage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[#1A2530]">
        <div className="absolute inset-0 bg-[length:100%_100%] bg-[position:50%_0%] bg-no-repeat" style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 55%)" }} />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-20 text-white">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">Welcome to</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{PUBLIC_COLONY.name}</h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100">{PUBLIC_COLONY.brand.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
            >
              {PUBLIC_COLONY.brand.ctaCommunity}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/announcements')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {PUBLIC_COLONY.brand.ctaAnnouncements}
            </button>
          </div>
        </div>
      </section>

      {/* Colony overview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#1A2530]">About Our Colony</h2>
          <button
            onClick={() => navigate('/announcements')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
            >
              {PUBLIC_COLONY.brand.ctaViewNotices}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
          {PUBLIC_COLONY.name} is located in {PUBLIC_COLONY.shortLocation}.
          This is a residential colony serving residents of {PUBLIC_COLONY.area}, New Delhi.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <MapPin className="h-4 w-4" />
              <span className="font-semibold text-[#1A2530]">Location</span>
            </div>
            <p className="mt-1 text-stone-600">{colonyAddressString()}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <Building className="h-4 w-4" />
              <span className="font-semibold text-[#1A2530]">About</span>
            </div>
            <p className="mt-1 text-stone-600">Residential colony in Paharganj.</p>
            <p className="mt-1 text-xs text-stone-500">Details such as size, number of blocks, and resident count are not published publicly yet.</p>
          </div>
        </div>
      </section>

      {/* Two-column main content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-8">
          {/* Facilities — empty state */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="text-base font-bold tracking-tight text-[#1A2530]">Colony Facilities</h3>
            <p className="mt-1 text-xs text-stone-500">Public colony information.</p>
            <ul className="mt-4 space-y-3">
              {PUBLIC_COLONY.publicFacilities.length === 0 ? (
                <li className="text-sm text-stone-500">Colony facilities are coming soon. Verified amenities will appear here once confirmed.</li>
              ) : (
                PUBLIC_COLONY.publicFacilities.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A2530] text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#1A2530]">{item.label}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Public announcements preview */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight text-[#1A2530]">Latest Announcements</h3>
              <button
                onClick={() => navigate('/announcements')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
              >
                {PUBLIC_COLONY.brand.ctaViewAll}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {PUBLIC_COLONY.publicAnnouncements.length === 0 ? (
                <li className="text-sm text-stone-500">No public announcements yet.</li>
              ) : (
                PUBLIC_COLONY.publicAnnouncements.map((ann) => (
                  <li
                    key={ann.id}
                    onClick={() => navigate(`/announcements/${ann.id}`)}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-100 px-2.5 py-0.5 text-rose-800">
                        {ann.priority === 'emergency' ? 'Urgent' : 'Notice'}
                      </span>
                      <span className="text-xs font-semibold text-stone-600">{ann.category}</span>
                    </div>
                    <p className="mt-2 font-semibold text-[#1A2530]">{ann.title}</p>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">{ann.content}</p>
                    <p className="mt-2 text-xs text-stone-500">{formatDate(ann.createdAt)}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Public discussions preview */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight text-[#1A2530]">Recent Community Discussions</h3>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
              >
                {PUBLIC_COLONY.brand.ctaViewAll}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {PUBLIC_COLONY.publicPosts.length === 0 ? (
                <li className="text-sm text-stone-500">No public discussions yet.</li>
              ) : (
                PUBLIC_COLONY.publicPosts.map((post) => (
                  <li
                    key={post.id}
                    onClick={() => navigate('/chat')}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800">
                        {channelLabel(post.channel)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-[#1A2530]">{post.title || 'Community post'}</p>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">{post.content}</p>
                    <p className="mt-1 text-xs text-stone-500">{formatDate(post.createdAt)}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Right column: map */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="text-base font-bold tracking-tight text-[#1A2530]">Colony Map</h3>
            <p className="mt-1 text-xs text-stone-500">Public preview.</p>

            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
              <div className="flex h-full w-full items-center justify-center">
                <a
                  href={PUBLIC_COLONY.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-[#1A2530] transition hover:text-blue-700"
                >
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={PUBLIC_COLONY.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
              >
                {PUBLIC_COLONY.brand.ctaLogInForResidentAccess}
              </button>
            </div>

            <p className="mt-3 text-xs text-stone-500">
              This link opens the colony location in Google Maps.
              Internal facility pins and exact building layouts are not shown until verified.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA band */}
      <div className="rounded-2xl bg-[#1A2530] px-6 py-10 text-white sm:px-10">
        <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-200">
              <Building className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Be a part of your community</span>
            </div>
            <p className="max-w-sm text-sm text-blue-100">
              Join the conversation, stay informed, and help make our colony better.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#1A2530] transition hover:bg-stone-100"
            >
              {PUBLIC_COLONY.brand.ctaLogin}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {PUBLIC_COLONY.brand.ctaRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function channelLabel(channel: string): string {
  return channel.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
