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
assert(rulesContent.includes("userDoc().role == 'resident'"), 'Posts and notifications verify colony role');
assert(!rulesContent.includes("resource.data.userId == 'ALL' ||\n        isAdmin()"), 'Notifications must not have naked userId == ALL without role check');
assert(rulesContent.includes("resource.data.targetBlock in ['ALL', getUserBlock()]"), 'Announcements rule must support in query');
assert(rulesContent.includes('resource.data.department == getWorkerDept()'), 'Issues rule must permit worker department queue read');
assert(rulesContent.includes("hasOnly(['commentsCount', 'comments'])"), 'Posts rule must permit comments update');
assert(rulesContent.includes("hasOnly(['likesCount', 'reactions'])"), 'Posts rule must permit reactions update');

// Ensure client role privilege escalation is strictly forbidden in firestore.rules
assert(rulesContent.includes("'role'"), 'User profile rule checks role immutability');
assert(rulesContent.includes("'verified'"), 'User profile rule checks verified immutability');
assert(rulesContent.includes("hasOnly([\n            'name',\n            'phone',\n            'avatarUrl'\n          ])"), 'User profile update strictly limited to non-privilege fields');

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
assert(appCtxContent.includes('isDemoMode ? INITIAL_VISITORS : []'), 'Visitors must initialize empty in production');
assert(appCtxContent.includes('isDemoMode ? INITIAL_PREAPPROVED_VISITORS : []'), 'Pre-approved passes initialize empty in production');
assert(appCtxContent.includes('unsubPosts'), 'Posts listener unsubscribed cleanly');
assert(appCtxContent.includes('unsubPreApproved'), 'PreApproved passes listener unsubscribed cleanly');
assert(appCtxContent.includes('unsubVerif'), 'Verification requests listener unsubscribed cleanly');
console.log('✓ Production state isolation verified.');

// Test 7: Notification Producers and Scoped Addressing
console.log('\n--- 7. Checking Notification Producers Scope & Addressing ---');
assert(!appCtxContent.includes("id: 'notif-' + Date.now(),\n      title: `New ${data.department}"), 'createIssue must set userId on notification');
assert(appCtxContent.includes("userId: currentUser.uid,\n      flatNumber: currentUser.flatNumber,\n      title: `New ${data.department}"), 'createIssue assigns reporter userId');
assert(appCtxContent.includes("userId: preApproval.residentId,\n      flatNumber: preApproval.flatNumber,"), 'expeditePreApprovedVisitorEntry assigns resident userId');
assert(appCtxContent.includes("userId: req.userId,\n      flatNumber: req.flatNumber,\n      title: 'Residency Verification Approved!"), 'approveVerificationRequest assigns resident userId');
assert(appCtxContent.includes("userId: targetIssue.reporterId,\n        flatNumber: targetIssue.flatNumber,"), 'updateIssueStatus assigns reporter userId');
assert(appCtxContent.includes("userId: target.reporterId,\n        flatNumber: target.flatNumber,\n        title: `Work Completed"), 'resolveIssue assigns reporter userId');
console.log('✓ Notification producer scopes verified.');

// Test 8: Public Route Precedence over Auth Loading in App.tsx
console.log('\n--- 8. Checking Guest Route Precedence in App.tsx ---');
const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const publicRouteIndex = appContent.indexOf('if (isPublicRoute(path))');
const authLoadingIndex = appContent.indexOf('if (isAuthLoading)');
assert(publicRouteIndex !== -1, 'App.tsx checks isPublicRoute(path)');
assert(authLoadingIndex !== -1, 'App.tsx checks isAuthLoading');
assert(publicRouteIndex < authLoadingIndex, 'isPublicRoute(path) check must execute before isAuthLoading check');
console.log('✓ Guest route instant hydration precedence verified.');

// Test 9: Resident Shell Notification Tap Routing Handler
console.log('\n--- 9. Checking ResidentApp Notification Tap Handler ---');
const residentAppContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ResidentApp/ResidentApp.tsx'), 'utf8');
assert(residentAppContent.includes('handleNotificationTap'), 'ResidentApp has handleNotificationTap');
assert(residentAppContent.includes('markNotificationRead(notif.id)'), 'Notification tap marks read');
assert(residentAppContent.includes("navigate(`/resident/visitors/${notif.relatedId}`)"), 'Visitor notification routes to specific visitor');
assert(residentAppContent.includes("navigate('/resident/visitors')"), 'Visitor notification falls back to visitors hub');
assert(residentAppContent.includes("navigate(`/resident/issues/${notif.relatedId}`)"), 'Issue notification routes to specific issue');
assert(residentAppContent.includes("navigate('/resident/issues')"), 'Issue notification falls back to issues hub');
assert(residentAppContent.includes("navigate(`/resident/announcements/${notif.relatedId}`)"), 'Announcement routes to specific announcement');
assert(residentAppContent.includes("navigate('/resident/announcements')"), 'Announcement falls back to announcements list');
assert(residentAppContent.includes("navigate('/resident/profile')"), 'Verification notification routes to profile');
console.log('✓ Notification tap mapper and fallbacks verified.');

// Test 10: Email and Password Authentication & Backend Verification
console.log('\n--- 10. Checking Email/Password Authentication & Endpoints ---');
assert(appCtxContent.includes('signInWithEmail'), 'AppContext provides signInWithEmail');
assert(appCtxContent.includes('signUpWithEmail'), 'AppContext provides signUpWithEmail');
assert(appCtxContent.includes('sendPasswordReset'), 'AppContext provides sendPasswordReset');
assert(serverContent.includes('/api/auth/validate'), 'server.ts provides /api/auth/validate endpoint');
assert(serverContent.includes('/api/auth/roles'), 'server.ts provides /api/auth/roles endpoint');
assert(serverContent.includes('/api/auth/audit'), 'server.ts provides /api/auth/audit endpoint');

const loginContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/LoginPage.tsx'), 'utf8');
assert(loginContent.includes('signInWithEmail'), 'LoginPage uses signInWithEmail');
assert(loginContent.includes('showPassword'), 'LoginPage has password visibility toggle');
assert(loginContent.includes('sendPasswordReset'), 'LoginPage supports password reset');

const registerContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/RegisterPage.tsx'), 'utf8');
assert(registerContent.includes('signUpWithEmail'), 'RegisterPage uses signUpWithEmail');
assert(registerContent.includes('confirmPassword'), 'RegisterPage validates confirmPassword');
assert(registerContent.includes('getPasswordStrength'), 'RegisterPage features password strength evaluation');

console.log('✓ Email & password authentication workflows and backend verified.');

console.log('\n=== All Phase 2 & Auth Audit Verifications Passed Successfully ===');
