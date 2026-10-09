import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Issue,
  IssueStatus,
  VisitorEntry,
  Announcement,
  CommunityPost,
  AppNotification,
  FlatRecord,
  Department,
  Priority,
  PreApprovedVisitor,
  VerificationRequest,
} from '../types';
import {
  DEMO_PROFILES,
  DEMO_FLATS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ISSUES,
  INITIAL_VISITORS,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PREAPPROVED_VISITORS,
  INITIAL_VERIFICATION_REQUESTS,
} from '../data/seedData';
import { auth, googleProvider, db, testConnection, handleFirestoreError, OperationType } from '../firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

interface AppContextType {
  currentUser: UserProfile;
  firebaseUser: User | null;
  activeRole: UserRole;
  isAuthLoading: boolean;
  flats: FlatRecord[];
  issues: Issue[];
  visitors: VisitorEntry[];
  announcements: Announcement[];
  posts: CommunityPost[];
  notifications: AppNotification[];
  preApprovedVisitors: PreApprovedVisitor[];
  verificationRequests: VerificationRequest[];
  unreadNotifsCount: number;
  isFirebaseConnected: boolean;

  // Auth & Persona switching
  switchRolePersona: (role: UserRole) => void;
  switchPersonaByUid: (uid: string) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;

  // Pre-approved visitors
  addPreApprovedVisitor: (
    data: Omit<PreApprovedVisitor, 'id' | 'createdAt' | 'residentId' | 'residentName' | 'isActive'>
  ) => Promise<PreApprovedVisitor>;
  togglePreApprovedVisitor: (id: string, isActive: boolean) => Promise<void>;
  deletePreApprovedVisitor: (id: string) => Promise<void>;
  expeditePreApprovedVisitorEntry: (preApproval: PreApprovedVisitor, gate: string) => Promise<VisitorEntry>;

  // Resident Verification
  submitVerificationRequest: (data: {
    block: string;
    flatNumber: string;
    residentType: 'Owner' | 'Tenant' | 'Family';
    documentType: 'Electricity Bill' | 'Rent Agreement' | 'Property Deed' | 'Utility Bill';
    proofDocumentUrl: string;
  }) => Promise<void>;
  approveVerificationRequest: (requestId: string) => Promise<void>;
  rejectVerificationRequest: (requestId: string, reason: string) => Promise<void>;

  // Issue Operations
  submitIssue: (data: {
    title: string;
    description: string;
    category: string;
    department: Department;
    issueType: string;
    priority: Priority;
    block: string;
    flatNumber?: string;
    locationDetails: string;
    photoUrl?: string;
    aiConfidence?: number;
    aiSummary?: string;
  }) => Promise<Issue>;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus, comment?: string) => Promise<void>;
  assignIssueToWorker: (issueId: string, workerUid: string, workerName: string, department?: Department) => Promise<void>;
  addIssueComment: (issueId: string, content: string, isInternal: boolean, photoUrl?: string) => Promise<void>;
  resolveIssueWithProof: (issueId: string, proofPhotoUrl?: string, notes?: string) => Promise<void>;

  // Visitor Operations
  registerVisitor: (data: Omit<VisitorEntry, 'id' | 'entryTime' | 'status' | 'residentApproval'>) => Promise<VisitorEntry>;
  markVisitorExit: (visitorId: string) => Promise<void>;
  updateVisitorApproval: (visitorId: string, approval: 'approved' | 'denied') => Promise<void>;

  // Announcement Operations
  publishAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'acknowledgedBy'>) => Promise<void>;
  acknowledgeAnnouncement: (announcementId: string) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;

  // Community Discussions
  createPost: (data: {
    channel: CommunityPost['channel'];
    title?: string;
    content: string;
    imageUrl?: string;
    price?: string;
  }) => Promise<void>;
  addPostComment: (postId: string, content: string) => Promise<void>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // AI Classification
  classifyIssueWithAI: (text: string, location?: string, category?: string) => Promise<{
    department: Department;
    issueType: string;
    priority: Priority;
    location: string;
    confidence: number;
    summary: string;
  }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    isDemoMode ? DEMO_PROFILES[0] : {
      uid: 'guest',
      name: 'Guest User',
      email: '',
      role: 'resident',
      verified: false,
      verificationStatus: 'unverified',
      createdAt: new Date().toISOString(),
    }
  );
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [flats, setFlats] = useState<FlatRecord[]>(DEMO_FLATS);
  const [issues, setIssues] = useState<Issue[]>(() => (isDemoMode ? INITIAL_ISSUES : []));
  const [visitors, setVisitors] = useState<VisitorEntry[]>(() => (isDemoMode ? INITIAL_VISITORS : []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => (isDemoMode ? INITIAL_ANNOUNCEMENTS : []));
  const [posts, setPosts] = useState<CommunityPost[]>(() => (isDemoMode ? INITIAL_POSTS : []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => (isDemoMode ? INITIAL_NOTIFICATIONS : []));
  const [preApprovedVisitors, setPreApprovedVisitors] = useState<PreApprovedVisitor[]>(() => (isDemoMode ? INITIAL_PREAPPROVED_VISITORS : []));
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => (isDemoMode ? INITIAL_VERIFICATION_REQUESTS : []));

  // Initial test connection to Firestore
  useEffect(() => {
    testConnection().then(() => {
      setIsFirebaseConnected(true);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Resident User',
              email: user.email || '',
              role: 'resident',
              verified: false,
              verificationStatus: 'unverified',
              avatarUrl: user.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (e) {
          console.warn('Profile fetch/create notice:', e);
        }
      } else {
        if (!isDemoMode) {
          setCurrentUser({
            uid: 'unauth',
            name: 'Guest User',
            email: '',
            role: 'resident',
            verified: false,
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString(),
          });
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for current user document
  useEffect(() => {
    if (!firebaseUser || isDemoMode) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setCurrentUser(snap.data() as UserProfile);
      }
    }, (err) => console.error('User doc snapshot error:', err));
    
    return () => unsubscribeUser();
  }, [firebaseUser, isDemoMode]);

  // Set up Firestore Listeners for real-time sync
  useEffect(() => {
    if (isDemoMode || !firebaseUser) return;
    try {
      const issuesCol = collection(db, 'issues');
      let issuesQuery;
      if (currentUser.role === 'rwa_admin') {
        issuesQuery = issuesCol;
      } else if (currentUser.role.includes('_worker')) {
        issuesQuery = query(issuesCol, where('department', '==', currentUser.department));
      } else {
        issuesQuery = query(issuesCol, where('reporterId', '==', currentUser.uid));
      }
      
      const unsubIssues = onSnapshot(issuesQuery, (snap) => {
          const list: Issue[] = [];
          snap.forEach((d) => list.push(d.data() as Issue));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setIssues(list);
      }, (err) => console.warn('Issues snapshot notice:', err.message));

      const visitorsCol = collection(db, 'visitors');
      let visitorsQuery;
      if (currentUser.role === 'security_guard' || currentUser.role === 'rwa_admin') {
        visitorsQuery = visitorsCol;
      } else if (currentUser.flatNumber && currentUser.block) {
        visitorsQuery = query(visitorsCol, where('flatNumber', '==', currentUser.flatNumber), where('block', '==', currentUser.block));
      } else {
        visitorsQuery = null;
      }
      
      let unsubVisitors = () => {};
      if (visitorsQuery) {
        unsubVisitors = onSnapshot(visitorsQuery, (snap) => {
          const list: VisitorEntry[] = [];
          snap.forEach((d) => list.push(d.data() as VisitorEntry));
          list.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
          setVisitors(list);
        }, (err) => console.warn('Visitors snapshot notice:', err.message));
      }

      let announceQuery;
      if (currentUser.role === 'rwa_admin') {
        announceQuery = collection(db, 'announcements');
      } else if (currentUser.block) {
        announceQuery = query(collection(db, 'announcements'), where('targetBlock', 'in', ['ALL', currentUser.block]));
      } else {
        announceQuery = query(collection(db, 'announcements'), where('targetBlock', '==', 'ALL'));
      }

      const unsubAnnounce = onSnapshot(announceQuery, (snap) => {
        const list: Announcement[] = [];
        snap.forEach((d) => {
          list.push(d.data() as Announcement);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAnnouncements(list);
      }, (err) => console.warn('Announcements snapshot notice:', err.message));

      const unsubNotifs = onSnapshot(query(collection(db, 'notifications'), where('userId', 'in', [currentUser.uid, 'ALL'])), (snap) => {
        const list: AppNotification[] = [];
        snap.forEach((d) => list.push(d.data() as AppNotification));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(list);
      }, (err) => console.warn('Notifications snapshot notice:', err.message));

      // Real-time Posts sync
      const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => {
        const list: CommunityPost[] = [];
        snap.forEach((d) => list.push(d.data() as CommunityPost));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(list);
      }, (err) => console.warn('Posts snapshot notice:', err.message));

      // Real-time Pre-Approved Visitors sync
      let preApprovedQuery;
      if (currentUser.role === 'security_guard' || currentUser.role === 'rwa_admin') {
        preApprovedQuery = collection(db, 'preapproved_visitors');
      } else {
        preApprovedQuery = query(collection(db, 'preapproved_visitors'), where('residentId', '==', currentUser.uid));
      }
      const unsubPreApproved = onSnapshot(preApprovedQuery, (snap) => {
        const list: PreApprovedVisitor[] = [];
        snap.forEach((d) => list.push(d.data() as PreApprovedVisitor));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPreApprovedVisitors(list);
      }, (err) => console.warn('PreApproved snapshot notice:', err.message));

      // Real-time Verification Requests sync
      let verifQuery;
      if (currentUser.role === 'rwa_admin') {
        verifQuery = collection(db, 'verification_requests');
      } else {
        verifQuery = query(collection(db, 'verification_requests'), where('userId', '==', currentUser.uid));
      }
      const unsubVerif = onSnapshot(verifQuery, (snap) => {
        const list: VerificationRequest[] = [];
        snap.forEach((d) => list.push(d.data() as VerificationRequest));
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setVerificationRequests(list);
      }, (err) => console.warn('Verification requests snapshot notice:', err.message));

      return () => {
        unsubIssues();
        unsubVisitors();
        unsubAnnounce();
        unsubNotifs();
        unsubPosts();
        unsubPreApproved();
        unsubVerif();
      };
    } catch (e) {
      console.warn('Firestore real-time listeners initialization notice:', e);
    }
  }, [firebaseUser, currentUser]);

  // Quick Persona Role Switcher for instant testing
  const switchRolePersona = (role: UserRole) => {
    if (!isDemoMode) {
      console.warn('Role switching blocked in production.');
      return;
    }
    const profile = DEMO_PROFILES.find((p) => p.role === role) || {
      ...DEMO_PROFILES[0],
      role,
      name: `Demo ${role.toUpperCase()}`,
    };
    setCurrentUser(profile);
  };

  const switchPersonaByUid = (uid: string) => {
    if (!isDemoMode) {
      console.warn('Persona switching blocked in production.');
      return;
    }
    const profile = DEMO_PROFILES.find((p) => p.uid === uid);
    if (profile) {
      setCurrentUser(profile);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'users/auth');
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Check demo credentials or offline fallback
    if (isDemoMode || !isFirebaseConnected) {
      const demoUser = DEMO_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail.toLowerCase());
      if (demoUser) {
        setCurrentUser(demoUser);
        fetch('/api/auth/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'login', email: cleanEmail, uid: demoUser.uid, role: demoUser.role }),
        }).catch(() => {});
        return { success: true };
      }
      if (isDemoMode) {
        const fallbackUser: UserProfile = {
          ...DEMO_PROFILES[0],
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
        };
        setCurrentUser(fallbackUser);
        return { success: true };
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setFirebaseUser(cred.user);

      // Retrieve user document from Firestore
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setCurrentUser(profile);
        fetch('/api/auth/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'login', email: cleanEmail, uid: cred.user.uid, role: profile.role }),
        }).catch(() => {});
      } else {
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Resident User',
          email: cred.user.email || cleanEmail,
          role: 'resident',
          verified: false,
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setCurrentUser(newProfile);
        fetch('/api/auth/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'login_new_profile', email: cleanEmail, uid: cred.user.uid, role: 'resident' }),
        }).catch(() => {});
      }

      return { success: true };
    } catch (err: any) {
      console.error('Email sign in error:', err);

      // Helpful fallback for demo accounts during local testing or offline states
      const demoUser = DEMO_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail.toLowerCase());
      if (
        demoUser &&
        (err.code === 'auth/invalid-credential' ||
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/operation-not-allowed')
      ) {
        setCurrentUser(demoUser);
        return { success: true };
      }

      let errorMsg = 'Failed to sign in. Please verify your email and password.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        errorMsg = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please wait a moment before trying again.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'This account has been deactivated.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Email/password sign-in is disabled in Firebase configuration.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Full name, email, and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (!isFirebaseConnected && isDemoMode) {
      const newDemoUser: UserProfile = {
        uid: 'demo-res-' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        phone: phone?.trim() || undefined,
        role: 'resident',
        verified: false,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newDemoUser);
      return { success: true };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

      if (cleanName) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (profileErr) {
          console.warn('Could not update Firebase displayName:', profileErr);
        }
      }

      const userRef = doc(db, 'users', cred.user.uid);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: cleanName || cred.user.email?.split('@')[0] || 'Resident User',
        email: cred.user.email || cleanEmail,
        phone: phone?.trim() || undefined,
        role: 'resident',
        verified: false,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);
      setFirebaseUser(cred.user);
      setCurrentUser(newProfile);

      fetch('/api/auth/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'register', email: cleanEmail, uid: cred.user.uid, role: 'resident' }),
      }).catch(() => {});

      return { success: true };
    } catch (err: any) {
      console.error('Email sign up error:', err);
      let errorMsg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Email/password registration is not enabled in Firebase Authentication.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    try {
      if (isFirebaseConnected) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }
      fetch('/api/auth/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'password_reset_request', email: cleanEmail }),
      }).catch(() => {});
      return { success: true };
    } catch (err: any) {
      console.error('Password reset error:', err);
      let errorMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No registered account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      // Explicitly clear to a safe unauthenticated state
      setCurrentUser({
        uid: 'guest',
        name: 'Guest User',
        email: '',
        role: 'resident',
        verified: false,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    // Whitelist allowed fields to prevent spoofing of roles, verification, etc.
    const allowedFields: (keyof UserProfile)[] = ['name', 'phone', 'avatarUrl'];
    const sanitizedData: Partial<UserProfile> = {};
    
    for (const key of allowedFields) {
      if (key in profileData) {
        sanitizedData[key] = profileData[key] as any;
      }
    }

    if (Object.keys(sanitizedData).length === 0) return;

    const updated = { ...currentUser, ...sanitizedData };
    setCurrentUser(updated);
    try {
      await updateDoc(doc(db, 'users', updated.uid), sanitizedData);
    } catch (err) {
      console.warn('Could not update Firestore user doc:', err);
      // Rollback on failure
      setCurrentUser(currentUser);
    }
  };

  // --- Pre-Approved Visitors System ---
  const addPreApprovedVisitor = async (
    data: Omit<PreApprovedVisitor, 'id' | 'createdAt' | 'residentId' | 'residentName' | 'isActive'>
  ) => {
    const id = 'pre-' + Date.now();
    const newPreApproved: PreApprovedVisitor = {
      id,
      ...data,
      residentId: currentUser.uid,
      residentName: currentUser.name,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setPreApprovedVisitors((prev) => [newPreApproved, ...prev]);

    try {
      await setDoc(doc(db, 'preapproved_visitors', id), newPreApproved);
    } catch (err) {
      console.warn('Firestore pre-approved write notice:', err);
    }

    return newPreApproved;
  };

  const togglePreApprovedVisitor = async (id: string, isActive: boolean) => {
    setPreApprovedVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive } : v))
    );

    try {
      await updateDoc(doc(db, 'preapproved_visitors', id), { isActive });
    } catch (err) {
      console.warn('Firestore pre-approved update notice:', err);
    }
  };

  const deletePreApprovedVisitor = async (id: string) => {
    setPreApprovedVisitors((prev) => prev.filter((v) => v.id !== id));
    try {
      await deleteDoc(doc(db, 'preapproved_visitors', id));
    } catch (err) {
      console.warn('Firestore pre-approved delete notice:', err);
    }
  };

  // Expedited Entry: Used by Guard terminal when pre-approved visitor arrives
  const expeditePreApprovedVisitorEntry = async (
    preApproval: PreApprovedVisitor,
    gate: string
  ) => {
    if (!preApproval.isActive || new Date(preApproval.validUntil).getTime() < Date.now()) {
      throw new Error('Pre-approved pass is inactive or expired.');
    }
    const visitorId = 'vis-pre-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const entryTime = new Date().toISOString();

    const newEntry: VisitorEntry = {
      id: visitorId,
      visitorName: preApproval.visitorName,
      visitorType: preApproval.visitorType,
      flatNumber: preApproval.flatNumber,
      block: preApproval.block,
      phone: preApproval.phone,
      vehicleNumber: preApproval.vehicleNumber,
      purpose: preApproval.notes || `Pre-approved ${preApproval.visitorType} visit`,
      gate,
      entryTime,
      status: 'inside',
      residentApproval: 'approved',
      guardName: currentUser.name || 'Bahadur Thapa',
      isPreApproved: true,
      preApprovalId: preApproval.id,
      passcodeUsed: preApproval.passcode,
    };

    // Optimistically update visitors list
    setVisitors((prev) => [newEntry, ...prev]);

    // Send immediate high-priority notification to resident's flat
    const visitorNotif: AppNotification = {
      id: 'notif-vis-' + Date.now(),
      userId: preApproval.residentId,
      flatNumber: preApproval.flatNumber,
      title: `✨ Pre-Approved Entry: ${preApproval.visitorName}`,
      message: `${preApproval.visitorName} (${preApproval.visitorType}) cleared expedited gate entry at ${gate} using Passcode ${preApproval.passcode}.`,
      type: 'visitor',
      relatedId: visitorId,
      isRead: false,
      createdAt: entryTime,
    };
    setNotifications((prev) => [visitorNotif, ...prev]);

    try {
      await setDoc(doc(db, 'visitors', visitorId), newEntry);
      await setDoc(doc(db, 'notifications', visitorNotif.id), visitorNotif);
    } catch (err) {
      console.warn('Firestore expedited visitor entry notice:', err);
    }

    return newEntry;
  };

  // --- Resident Verification Flow ---
  const submitVerificationRequest = async (data: {
    block: string;
    flatNumber: string;
    residentType: 'Owner' | 'Tenant' | 'Family';
    documentType: 'Electricity Bill' | 'Rent Agreement' | 'Property Deed' | 'Utility Bill';
    proofDocumentUrl: string;
  }) => {
    const id = 'vr-' + Date.now();
    const newReq: VerificationRequest = {
      id,
      userId: currentUser.uid,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '+91 98000 00000',
      block: data.block,
      flatNumber: data.flatNumber,
      residentType: data.residentType,
      documentType: data.documentType,
      proofDocumentUrl: data.proofDocumentUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setVerificationRequests((prev) => [newReq, ...prev]);

    // Notify RWA Admin
    const adminNotif: AppNotification = {
      id: 'notif-vr-' + Date.now(),
      userId: 'ALL',
      title: 'New Resident Verification Submitted',
      message: `${currentUser.name} applied for Flat ${data.block}-${data.flatNumber} with ${data.documentType}. Review in Admin Queue.`,
      type: 'verification',
      relatedId: id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    try {
      await setDoc(doc(db, 'verification_requests', id), newReq);
      await setDoc(doc(db, 'users', currentUser.uid), {
        verificationStatus: 'pending',
        block: data.block,
        flatNumber: data.flatNumber,
      }, { merge: true });
      await setDoc(doc(db, 'notifications', adminNotif.id), adminNotif);
    } catch (err) {
      console.warn('Firestore verification request write notice:', err);
    }
  };

  const approveVerificationRequest = async (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const reviewedAt = new Date().toISOString();

    setVerificationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', reviewedAt, reviewedBy: currentUser.name }
          : r
      )
    );

    // Update target flat occupant list if not present
    setFlats((prev) =>
      prev.map((f) => {
        if (f.block === req.block && f.flatNumber === req.flatNumber) {
          if (!f.occupantNames.includes(req.name)) {
            return { ...f, occupantNames: [...f.occupantNames, req.name] };
          }
        }
        return f;
      })
    );

    // Send confirmation notification to resident
    const residentNotif: AppNotification = {
      id: 'notif-appr-' + Date.now(),
      userId: req.userId,
      flatNumber: req.flatNumber,
      title: 'Residency Verification Approved! 🎉',
      message: `Your residency application for Flat ${req.block}-${req.flatNumber} has been approved by the RWA Management. Full resident features are now unlocked.`,
      type: 'verification',
      relatedId: req.id,
      isRead: false,
      createdAt: reviewedAt,
    };
    setNotifications((prev) => [residentNotif, ...prev]);

    try {
      await updateDoc(doc(db, 'verification_requests', requestId), {
        status: 'approved',
        reviewedAt,
        reviewedBy: currentUser.name,
      });
      await setDoc(
        doc(db, 'users', req.userId),
        {
          verified: true,
          verificationStatus: 'approved',
          block: req.block,
          flatNumber: req.flatNumber,
        },
        { merge: true }
      );
      await setDoc(doc(db, 'notifications', residentNotif.id), residentNotif);
    } catch (err) {
      console.warn('Firestore approve verification notice:', err);
    }
  };

  const rejectVerificationRequest = async (requestId: string, reason: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const reviewedAt = new Date().toISOString();

    setVerificationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              reviewedAt,
              reviewedBy: currentUser.name,
              rejectionReason: reason,
            }
          : r
      )
    );

    // Send rejection notification to resident with feedback
    const rejectNotif: AppNotification = {
      id: 'notif-rej-' + Date.now(),
      userId: req.userId,
      title: 'Residency Verification Action Required',
      message: `Your verification for Flat ${req.block}-${req.flatNumber} was declined: "${reason}". Please review and re-submit valid documentation.`,
      type: 'verification',
      relatedId: req.id,
      isRead: false,
      createdAt: reviewedAt,
    };
    setNotifications((prev) => [rejectNotif, ...prev]);

    try {
      await updateDoc(doc(db, 'verification_requests', requestId), {
        status: 'rejected',
        reviewedAt,
        reviewedBy: currentUser.name,
        rejectionReason: reason,
      });
      await setDoc(
        doc(db, 'users', req.userId),
        {
          verified: false,
          verificationStatus: 'rejected',
          rejectionReason: reason,
        },
        { merge: true }
      );
      await setDoc(doc(db, 'notifications', rejectNotif.id), rejectNotif);
    } catch (err) {
      console.warn('Firestore reject verification notice:', err);
    }
  };

  // AI Classification service
  const classifyIssueWithAI = async (text: string, location?: string, category?: string) => {
    try {
      const res = await fetch('/api/classify-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, location, manualCategory: category }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          department: data.department as Department,
          issueType: data.issueType || 'General Issue',
          priority: data.priority as Priority,
          location: data.location || location || 'Colony Grounds',
          confidence: data.confidence || 0.9,
          summary: data.summary || text.slice(0, 80),
        };
      }
    } catch (e) {
      console.warn('AI classification fetch failed, utilizing client fallback:', e);
    }

    // Client fallback
    const lower = text.toLowerCase();
    const dept: Department = lower.includes('water') || lower.includes('leak') || lower.includes('pipe')
      ? 'Water'
      : lower.includes('light') || lower.includes('electric') || lower.includes('wire') || lower.includes('power')
      ? 'Electrical'
      : lower.includes('trash') || lower.includes('garbage') || lower.includes('waste')
      ? 'Sanitation'
      : lower.includes('guard') || lower.includes('cctv') || lower.includes('gate')
      ? 'Security'
      : 'Maintenance';

    const priorityVal: Priority = (lower.includes('urgent') || lower.includes('flood') || lower.includes('spark'))
      ? 'urgent'
      : 'high';

    return {
      department: dept,
      issueType: String(dept === 'Water' ? 'Leakage' : dept === 'Electrical' ? 'Streetlight' : 'General Maintenance'),
      priority: priorityVal,
      location: String(location || 'Colony Grounds'),
      confidence: 0.85,
      summary: `Automated routing for ${dept} department issue`,
    };
  };

  // Submit Issue
  const submitIssue = async (data: {
    title: string;
    description: string;
    category: string;
    department: Department;
    issueType: string;
    priority: Priority;
    block: string;
    flatNumber?: string;
    locationDetails: string;
    photoUrl?: string;
    aiConfidence?: number;
    aiSummary?: string;
  }) => {
    const issueId = 'iss-' + Math.floor(1000 + Math.random() * 9000);
    const newIssue: Issue = {
      id: issueId,
      ...data,
      status: 'Submitted',
      reporterId: currentUser.uid,
      reporterName: currentUser.name,
      reporterFlat: currentUser.flatNumber ? `${currentUser.block || ''}-${currentUser.flatNumber}` : undefined,
      timeline: [
        {
          id: 'tl-' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Issue Submitted',
          performedBy: `${currentUser.name} (${currentUser.role})`,
          details: 'Reported with details',
        },
        {
          id: 'tl-' + (Date.now() + 1),
          timestamp: new Date().toISOString(),
          action: 'AI Classified & Routed',
          performedBy: 'Gemini Operations Engine',
          details: `Classified as ${data.department} | Priority: ${data.priority.toUpperCase()}`,
        },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIssues((prev) => [newIssue, ...prev]);

    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      userId: currentUser.uid,
      flatNumber: currentUser.flatNumber,
      title: `New ${data.department} Ticket: ${data.title}`,
      message: `${currentUser.name} reported: ${data.title} at ${data.locationDetails}`,
      type: 'issue_update',
      relatedId: issueId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'issues', issueId), newIssue);
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      console.warn('Saved locally (Firestore write notice):', err);
    }

    return newIssue;
  };

  const updateIssueStatus = async (issueId: string, newStatus: IssueStatus, comment?: string) => {
    const timestamp = new Date().toISOString();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const newTimeline = [
          ...(iss.timeline || []),
          {
            id: 'tl-' + Date.now(),
            timestamp,
            action: `Status updated to ${newStatus}`,
            performedBy: `${currentUser.name} (${currentUser.role})`,
            details: comment || `Changed status from ${iss.status} to ${newStatus}`,
          },
        ];
        return {
          ...iss,
          status: newStatus,
          timeline: newTimeline,
          updatedAt: timestamp,
        };
      })
    );

    const targetIssue = issues.find((i) => i.id === issueId);
    if (targetIssue) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        userId: targetIssue.reporterId,
        flatNumber: targetIssue.flatNumber,
        title: `Issue "${targetIssue.title.slice(0, 30)}..." updated`,
        message: `${currentUser.name} marked status as: ${newStatus}${comment ? ` - "${comment}"` : ''}`,
        type: 'issue_update',
        relatedId: issueId,
        isRead: false,
        createdAt: timestamp,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: newStatus,
        updatedAt: timestamp,
      });
    } catch (err) {
      console.warn('Firestore update status notice:', err);
    }
  };

  const assignIssueToWorker = async (
    issueId: string,
    workerUid: string,
    workerName: string,
    department?: Department
  ) => {
    const timestamp = new Date().toISOString();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          assignedTo: workerUid,
          assignedWorkerName: workerName,
          status: 'Assigned',
          department: department || iss.department,
          timeline: [
            ...(iss.timeline || []),
            {
              id: 'tl-' + Date.now(),
              timestamp,
              action: `Assigned to ${workerName}`,
              performedBy: `${currentUser.name} (${currentUser.role})`,
              details: `Ticket routed to ${workerName}`,
            },
          ],
          updatedAt: timestamp,
        };
      })
    );

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        assignedTo: workerUid,
        assignedWorkerName: workerName,
        status: 'Assigned',
        updatedAt: timestamp,
      });
    } catch (err) {
      console.warn('Firestore assign issue notice:', err);
    }
  };

  const addIssueComment = async (
    issueId: string,
    content: string,
    isInternal: boolean,
    photoUrl?: string
  ) => {
    const timestamp = new Date().toISOString();
    const commentObj = {
      id: 'c-' + Date.now(),
      issueId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      isInternal,
      photoUrl,
      createdAt: timestamp,
    };

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          comments: [...(iss.comments || []), commentObj],
          updatedAt: timestamp,
        };
      })
    );

    try {
      const issueRef = doc(db, 'issues', issueId);
      const curr = issues.find((i) => i.id === issueId);
      if (curr) {
        await updateDoc(issueRef, {
          comments: [...(curr.comments || []), commentObj],
          updatedAt: timestamp,
        });
      }
    } catch (err) {
      console.warn('Firestore comment update notice:', err);
    }
  };

  const resolveIssueWithProof = async (issueId: string, proofPhotoUrl?: string, notes?: string) => {
    const timestamp = new Date().toISOString();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          status: 'Resolved',
          proofPhotoUrl: proofPhotoUrl || iss.proofPhotoUrl,
          timeline: [
            ...(iss.timeline || []),
            {
              id: 'tl-' + Date.now(),
              timestamp,
              action: 'Work Completed & Marked Resolved',
              performedBy: `${currentUser.name} (${currentUser.role})`,
              details: notes || 'Resolution proof uploaded. Ready for resident review.',
            },
          ],
          updatedAt: timestamp,
        };
      })
    );

    const target = issues.find((i) => i.id === issueId);
    if (target) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        userId: target.reporterId,
        flatNumber: target.flatNumber,
        title: `Work Completed: "${target.title.slice(0, 30)}"`,
        message: `${currentUser.name} marked the issue as Resolved. Please review and provide feedback.`,
        type: 'issue_update',
        relatedId: issueId,
        isRead: false,
        createdAt: timestamp,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: 'Resolved',
        proofPhotoUrl: proofPhotoUrl || null,
        updatedAt: timestamp,
      });
    } catch (err) {
      console.warn('Firestore resolve issue notice:', err);
    }
  };

  // Register Visitor (Security Guard)
  const registerVisitor = async (
    data: Omit<VisitorEntry, 'id' | 'entryTime' | 'status' | 'residentApproval'>
  ) => {
    const visitorId = 'vis-' + Math.floor(100 + Math.random() * 900);
    const entryTime = new Date().toISOString();
    const newVisitor: VisitorEntry = {
      id: visitorId,
      ...data,
      entryTime,
      status: 'inside',
      residentApproval: 'pending',
    };

    setVisitors((prev) => [newVisitor, ...prev]);

    // Find resident matching flat when available
    const matchingResident = DEMO_PROFILES.find(
      (p) => p.role === 'resident' && p.block === data.block && p.flatNumber === data.flatNumber
    );
    const targetUserId = matchingResident?.uid || (currentUser.block === data.block && currentUser.flatNumber === data.flatNumber ? currentUser.uid : undefined);

    const visitorNotif: AppNotification = {
      id: 'notif-vis-' + Date.now(),
      userId: targetUserId,
      flatNumber: data.flatNumber,
      title: `Visitor at Colony Gate (${data.gate})`,
      message: `${data.visitorName} (${data.visitorType}) has arrived for Flat ${data.block}-${data.flatNumber}. Purpose: ${data.purpose || 'Visit'}`,
      type: 'visitor',
      relatedId: visitorId,
      isRead: false,
      createdAt: entryTime,
    };
    setNotifications((prev) => [visitorNotif, ...prev]);

    try {
      await setDoc(doc(db, 'visitors', visitorId), newVisitor);
      await setDoc(doc(db, 'notifications', visitorNotif.id), visitorNotif);
    } catch (err) {
      console.warn('Firestore visitor entry notice:', err);
    }

    return newVisitor;
  };

  const markVisitorExit = async (visitorId: string) => {
    const exitTime = new Date().toISOString();
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: 'exited', exitTime } : v))
    );

    try {
      await updateDoc(doc(db, 'visitors', visitorId), {
        status: 'exited',
        exitTime,
      });
    } catch (err) {
      console.warn('Firestore visitor exit notice:', err);
    }
  };

  const updateVisitorApproval = async (visitorId: string, approval: 'approved' | 'denied') => {
    const newStatus = approval === 'approved' ? 'inside' : 'exited';
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, residentApproval: approval, status: newStatus } : v))
    );

    const target = visitors.find((v) => v.id === visitorId);
    if (target) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        userId: 'ALL',
        flatNumber: target.flatNumber,
        title: `Visitor Entry ${approval.toUpperCase()}`,
        message: `Flat ${target.block}-${target.flatNumber} has ${approval} entry for ${target.visitorName}.`,
        type: 'visitor',
        relatedId: visitorId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    try {
      await updateDoc(doc(db, 'visitors', visitorId), {
        residentApproval: approval,
        status: newStatus,
      });
    } catch (err) {
      console.warn('Firestore visitor approval notice:', err);
    }
  };

  const publishAnnouncement = async (
    data: Omit<Announcement, 'id' | 'createdAt' | 'acknowledgedBy'>
  ) => {
    const id = 'ann-' + Date.now();
    const createdAt = new Date().toISOString();
    const newAnn: Announcement = {
      id,
      ...data,
      createdAt,
      acknowledgedBy: [],
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    const notif: AppNotification = {
      id: 'notif-ann-' + Date.now(),
      userId: 'ALL',
      title: data.priority === 'emergency' ? `🚨 EMERGENCY ALERT: ${data.title}` : `Notice: ${data.title}`,
      message: data.content.slice(0, 120) + '...',
      type: data.priority === 'emergency' ? 'emergency' : 'announcement',
      relatedId: id,
      isRead: false,
      createdAt,
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'announcements', id), newAnn);
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      console.warn('Firestore announcement publish notice:', err);
    }
  };

  const acknowledgeAnnouncement = async (announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id !== announcementId) return a;
        const acknowledged = a.acknowledgedBy || [];
        if (acknowledged.includes(currentUser.uid)) return a;
        return { ...a, acknowledgedBy: [...acknowledged, currentUser.uid] };
      })
    );

    try {
      const a = announcements.find((x) => x.id === announcementId);
      if (a) {
        const setList = Array.from(new Set([...(a.acknowledgedBy || []), currentUser.uid]));
        await updateDoc(doc(db, 'announcements', announcementId), {
          acknowledgedBy: setList,
        });
      }
    } catch (err) {
      console.warn('Firestore acknowledge notice:', err);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (err) {
      console.warn('Firestore delete announcement notice:', err);
    }
  };

  const createPost = async (data: {
    channel: CommunityPost['channel'];
    title?: string;
    content: string;
    imageUrl?: string;
    price?: string;
  }) => {
    const id = 'post-' + Date.now();
    const newPost: CommunityPost = {
      id,
      channel: data.channel,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      price: data.price,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorFlat: currentUser.flatNumber ? `${currentUser.block || ''}-${currentUser.flatNumber}` : 'Resident',
      likesCount: 0,
      commentsCount: 0,
      reactions: {},
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);

    try {
      await setDoc(doc(db, 'posts', id), newPost);
    } catch (err) {
      console.warn('Firestore post creation notice:', err);
    }
  };

  const addPostComment = async (postId: string, content: string) => {
    const commentObj = {
      id: 'pc-' + Date.now(),
      postId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorFlat: currentUser.flatNumber ? `${currentUser.block || ''}-${currentUser.flatNumber}` : 'Resident',
      content,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...(p.comments || []), commentObj],
        };
      })
    );

    try {
      const p = posts.find((x) => x.id === postId);
      if (p) {
        await updateDoc(doc(db, 'posts', postId), {
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...(p.comments || []), commentObj],
        });
      }
    } catch (err) {
      console.warn('Firestore post comment notice:', err);
    }
  };

  const reactToPost = async (postId: string, emoji: string) => {
    let newLikes = 0;
    let newReactions: Record<string, number> = {};

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...(p.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        newLikes = (p.likesCount || 0) + 1;
        newReactions = reactions;
        return {
          ...p,
          likesCount: newLikes,
          reactions: newReactions,
        };
      })
    );

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likesCount: newLikes,
        reactions: newReactions,
      });
    } catch (err) {
      console.warn('Firestore react to post notice:', err);
    }
  };

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      console.warn('Firestore post deletion notice:', err);
    }
  };

  const markNotificationRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (err) {
      console.warn('Firestore notification read update notice:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unread.map((n) =>
          updateDoc(doc(db, 'notifications', n.id), { isRead: true }).catch(() => {})
        )
      );
    } catch (err) {
      console.warn('Firestore mark all read notice:', err);
    }
  };

  const unreadNotifsCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (!n.flatNumber || n.flatNumber === currentUser.flatNumber) &&
      (!n.userId || n.userId === currentUser.uid)
  ).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        activeRole: currentUser.role,
        isAuthLoading,
        flats,
        issues,
        visitors,
        announcements,
        posts,
        notifications,
        preApprovedVisitors,
        verificationRequests,
        unreadNotifsCount,
        isFirebaseConnected,
        switchRolePersona,
        switchPersonaByUid,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        updateUserProfile,
        addPreApprovedVisitor,
        togglePreApprovedVisitor,
        deletePreApprovedVisitor,
        expeditePreApprovedVisitorEntry,
        submitVerificationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        submitIssue,
        updateIssueStatus,
        assignIssueToWorker,
        addIssueComment,
        resolveIssueWithProof,
        registerVisitor,
        markVisitorExit,
        updateVisitorApproval,
        publishAnnouncement,
        acknowledgeAnnouncement,
        deleteAnnouncement,
        createPost,
        addPostComment,
        reactToPost,
        deletePost,
        markNotificationRead,
        markAllNotificationsRead,
        classifyIssueWithAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
