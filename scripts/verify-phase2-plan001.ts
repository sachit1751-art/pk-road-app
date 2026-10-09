import { parseRoute } from '../src/router/Router';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== PK Road App Phase 2 Verification Suite ===');

// Test 1: Public Routes
console.log('\n--- 1. Testing Router parseRoute for Public Routes ---');
const loginRoute = parseRoute('/login');
assert(loginRoute.isPublic === true, 'login is public');
assert(loginRoute.section === 'login', 'login section is "login"');
assert(loginRoute.id === undefined, 'login id is undefined');

const registerRoute = parseRoute('/register');
assert(registerRoute.isPublic === true, 'register is public');
assert(registerRoute.section === 'register', 'register section is "register"');
assert(registerRoute.id === undefined, 'register id is undefined');

const announcementsList = parseRoute('/announcements');
assert(announcementsList.isPublic === true, 'announcements is public');
assert(announcementsList.section === 'announcements', 'announcements section is "announcements"');
assert(announcementsList.id === undefined, 'announcements list id is undefined');

const announcementDetail = parseRoute('/announcements/ann-123');
assert(announcementDetail.isPublic === true, 'announcement detail is public');
assert(announcementDetail.section === 'announcements', 'announcement detail section is "announcements"');
assert(announcementDetail.id === 'ann-123', 'announcement detail id is "ann-123"');

const homeRoute = parseRoute('/home');
assert(homeRoute.isPublic === true, 'home is public');
assert(homeRoute.section === 'home', 'home section is "home"');

const chatRoute = parseRoute('/chat');
assert(chatRoute.isPublic === true, 'chat is public');
assert(chatRoute.section === 'chat', 'chat section is "chat"');

console.log('✓ Public route parsing verified.');

// Test 2: Resident Routes & Deep Links
console.log('\n--- 2. Testing Resident Routes & Deep Links ---');
const residentAnnRoute = parseRoute('/resident/announcements/ann-456');
assert(residentAnnRoute.role === 'resident', 'resident route role');
assert(residentAnnRoute.section === 'announcements', 'resident announcements section');
assert(residentAnnRoute.id === 'ann-456', 'resident announcement id');

const residentNotifs = parseRoute('/resident/notifications');
assert(residentNotifs.role === 'resident', 'resident route role');
assert(residentNotifs.section === 'notifications', 'resident notifications section');

console.log('✓ Resident route parsing verified.');

// Test 3: Public Branding Integrity
console.log('\n--- 3. Scanning Public Components for Old Branding ---');
const publicFiles = [
  'src/components/PublicHeader.tsx',
  'src/components/PublicHomePage.tsx',
  'src/components/PublicChatPage.tsx',
  'src/components/PublicAnnouncementsPage.tsx',
  'src/public-colony-config.ts',
];

for (const relFile of publicFiles) {
  const fullPath = path.resolve(process.cwd(), relFile);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(!content.includes('ColonyHub'), `${relFile} must not contain "ColonyHub"`);
  assert(!content.includes('Greenwood Estate'), `${relFile} must not contain "Greenwood Estate"`);
}

console.log('✓ All public components verified clean of obsolete branding.');

// Test 4: Firestore Security Rules Integrity
console.log('\n--- 4. Checking Firestore Rules Safety ---');
const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
assert(!rulesContent.includes('match /posts/{postId} {\n      allow read: if isSignedIn();'), 'Posts must not allow read to arbitrary signed in users without role');
assert(rulesContent.includes('userDoc().role == \'resident\''), 'Posts and notifications verify colony role');
assert(!rulesContent.includes('resource.data.userId == \'ALL\' ||\n        isAdmin()'), 'Notifications must not have naked userId == ALL without role check');
console.log('✓ Firestore rules confirmed hardened against broad access.');

console.log('\n=== All Phase 2 Verifications Passed Successfully ===');
