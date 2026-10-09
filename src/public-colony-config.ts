import React from 'react';
import { Announcement, CommunityPost } from './types';

const emptyFacilities: Array<{ label: string; icon: React.ComponentType<{ className?: string }> }> = [];
const emptyAnnouncements: Announcement[] = [];
const emptyPosts: CommunityPost[] = [];

const BRAND = {
  name: 'PK Road App',
  tagline: 'PK Road App connects residents, community discussions, official notices, and colony services.',
  ctaCommunity: 'Explore Our Community',
  ctaAnnouncements: 'View Announcements',
  ctaLogin: 'Login',
  ctaRegister: 'Register',
  ctaLogInToParticipate: 'Log in to participate',
  ctaLogInForResidentAccess: 'Log in for resident access',
  ctaBackToHome: 'Back to Home',
  ctaBack: 'Back',
  ctaViewNotices: 'View Notices',
  ctaViewAll: 'View All',
  ctaExploreCommunity: 'Explore Community',
  welcomeBack: 'Welcome back',
  welcomeBackSub: 'Sign in to your account to continue.',
  createAccount: 'Create your account',
  createAccountSub: 'Join your community today.',
  noAccount: "Don’t have an account?",
  alreadyAccount: 'Already have an account?',
  login: 'Login',
  register: 'Register',
  signInWithGoogle: 'Continue with Google',
  signUpWithGoogle: 'Sign up with Google',
  emailPassword: 'Email / password',
  emailPasswordSoon: 'coming soon',
  or: 'or',
};

export const PUBLIC_COLONY = {
  name: 'Panchkuian Road Railway Colony',
  area: 'Railway Colony, Paharganj',
  city: 'New Delhi',
  state: 'Delhi',
  pin: '110055',
  country: 'India',

  addressLines: [
    'Panchkuian Road Railway Colony',
    'Railway Colony, Paharganj',
    'New Delhi, Delhi 110055',
    'India',
  ],

  shortLocation: 'Railway Colony, Paharganj, New Delhi',

  mapUrl: 'https://maps.app.goo.gl/R54A6rW274PAqUE28',

  brand: BRAND,

  // Public facilities are intentionally left empty until verified for this colony.
  // Generic amenities should not be listed as confirmed colony facilities.
  publicFacilities: emptyFacilities,

  // No fabricated public announcements. Verified public-safe notices will be added here.
  publicAnnouncements: emptyAnnouncements,

  // No fabricated public posts. Verified public-safe discussions will be added here.
  publicPosts: emptyPosts,
};

export function colonyAddressString(): string {
  return PUBLIC_COLONY.addressLines.join('\n');
}

export function colonyAddressOneLine(): string {
  return PUBLIC_COLONY.addressLines.slice(0, 3).join(', ');
}

export function colonyFullDescription(): string {
  return [
    'Panchkuian Road Railway Colony is a residential colony located in Railway Colony, Paharganj, New Delhi.',
    'It falls within Delhi 110055, India.',
  ].join(' ');
}

export function colonyShortDescription(): string {
  return ['Residential colony in Railway Colony, Paharganj, New Delhi.'].join(' ');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
