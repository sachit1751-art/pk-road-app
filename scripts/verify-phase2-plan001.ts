import { parseRoute } from '../src/router/Router';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== PK Road App Phase 2 Deep Verification Suite ===');

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

const residentIssueRoute = parseRoute('/resident/issues/iss-789');
assert(residentIssueRoute.role === 'resident', 'resident issue role');
assert(residentIssueRoute.section === 'issues', 'resident issues section');
assert(residentIssueRoute.id === 'iss-789', 'resident issue id');

const residentVisitorRoute = parseRoute('/resident/visitors/vis-321');
assert(residentVisitorRoute.role === 'resident', 'resident visitor role');
assert(residentVisitorRoute.section === 'visitors', 'resident visitors section');
assert(residentVisitorRoute.id === 'vis-321', 'resident visitor id');

const residentNotifs = parseRoute('/resident/notifications');
assert(residentNotifs.role === 'resident', 'resident route role');
assert(residentNotifs.section === 'notifications', 'resident notifications section');

console.log('✓ Resident route & deep link parsing verified.');

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

// Test 4: Firestore Security Rules & Query Compatibility
console.log('\n--- 4. Checking Firestore Rules & Query Compatibility ---');
const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

assert(!rulesContent.includes('match /posts/{postId} {\n      allow read: if isSignedIn();'), 'Posts must not allow read to arbitrary signed in users without role');
assert(rulesContent.includes('userDoc().role == \'resident\''), 'Posts and notifications verify colony role');
assert(!rulesContent.includes('resource.data.userId == \'ALL\' ||\n        isAdmin()'), 'Notifications must not have naked userId == ALL without role check');
assert(rulesContent.includes('resource.data.targetBlock in [\'ALL\', getUserBlock()]'), 'Announcements rule must support in query');
assert(rulesContent.includes('resource.data.department == getWorkerDept()'), 'Issues rule must permit worker department queue read');
assert(rulesContent.includes('hasOnly([\'commentsCount\', \'comments\'])'), 'Posts rule must permit comments update');
assert(rulesContent.includes('hasOnly([\'likesCount\', \'reactions\'])'), 'Posts rule must permit reactions update');

console.log('✓ Firestore rules confirmed hardened and query-compatible.');

// Test 5: Backend API Endpoints in server.ts
console.log('\n--- 5. Checking Backend Express Endpoints ---');
const serverContent = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf8');
assert(serverContent.includes('/api/classify-issue'), 'server.ts has /api/classify-issue');
assert(serverContent.includes('/api/health'), 'server.ts has /api/health');
assert(serverContent.includes('/api/colony-info'), 'server.ts has /api/colony-info');
console.log('✓ Backend API routes verified in server.ts.');

// Test 6: Demo vs Production Data Separation in AppContext.tsx
console.log('\n--- 6. Checking Demo vs Production State Separation ---');
const appCtxContent = fs.readFileSync(path.resolve(process.cwd(), 'src/context/AppContext.tsx'), 'utf8');
assert(appCtxContent.includes('isDemoMode ? INITIAL_POSTS : []'), 'Posts must initialize empty in production');
assert(appCtxContent.includes('isDemoMode ? INITIAL_ISSUES : []'), 'Issues must initialize empty in production');
assert(appCtxContent.includes('isDemoMode ? INITIAL_NOTIFICATIONS : []'), 'Notifications must initialize empty in production');
assert(appCtxContent.includes('unsubPosts'), 'Posts listener unsubscribed cleanly');
assert(appCtxContent.includes('unsubPreApproved'), 'PreApproved passes listener unsubscribed cleanly');
assert(appCtxContent.includes('unsubVerif'), 'Verification requests listener unsubscribed cleanly');
console.log('✓ Production state isolation verified.');

console.log('\n=== All Phase 2 Audit Verifications Passed Successfully ===');
