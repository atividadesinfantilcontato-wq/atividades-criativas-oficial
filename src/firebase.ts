import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../firebase-applet-config.json';

// Resolved config merging Vercel environment variables and applet configuration
const metaEnv = ((import.meta as any).env || {}) as Record<string, string | undefined>;

const envProjectId = metaEnv.VITE_FIREBASE_PROJECT_ID;
const envDatabaseId = metaEnv.VITE_FIREBASE_DATABASE_ID;

let finalProjectId = envProjectId || firebaseConfigJson.projectId;
let finalDatabaseId = envDatabaseId || (firebaseConfigJson as any).firestoreDatabaseId || (firebaseConfigJson as any).databaseId;

// If envProjectId was wrongly populated with the database ID (starts with 'ai-studio-'), swap or correct it
if (finalProjectId && finalProjectId.startsWith('ai-studio-')) {
  finalDatabaseId = finalProjectId;
  finalProjectId = (envDatabaseId && !envDatabaseId.startsWith('ai-studio-')) ? envDatabaseId : firebaseConfigJson.projectId || 'operating-flame-7dzmz';
}

if (!finalProjectId || finalProjectId === '(default)' || finalProjectId === 'default') {
  finalProjectId = 'operating-flame-7dzmz';
}

if (!finalDatabaseId || finalDatabaseId === '(default)' || finalDatabaseId === 'default' || finalDatabaseId === 'operating-flame-7dzmz') {
  finalDatabaseId = 'ai-studio-atividadescriati-64c09b83-865c-49d3-896f-bce4d623533c';
}

export const resolvedFirebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || `${finalProjectId}.firebaseapp.com`,
  projectId: finalProjectId,
  firestoreDatabaseId: finalDatabaseId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || `${finalProjectId}.firebasestorage.app`,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

// Initialize Firebase app
export const app = initializeApp({
  apiKey: resolvedFirebaseConfig.apiKey,
  authDomain: resolvedFirebaseConfig.authDomain,
  projectId: resolvedFirebaseConfig.projectId,
  storageBucket: resolvedFirebaseConfig.storageBucket,
  messagingSenderId: resolvedFirebaseConfig.messagingSenderId,
  appId: resolvedFirebaseConfig.appId,
});

// Initialize Firestore database (using custom named database ID)
export const db = initializeFirestore(
  app, 
  { ignoreUndefinedProperties: true }, 
  resolvedFirebaseConfig.firestoreDatabaseId
);

// Initialize Storage using the configured bucket
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

// Authentication Provider (Google Login)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper: Translate Firebase Auth error codes into clear, friendly Portuguese error messages
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido ao autenticar.';

  const code = error.code || '';
  const message = error.message || String(error);

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Senha incorreta.';
  }
  if (code === 'auth/user-not-found') {
    return 'Usuário não encontrado.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Para entrar com senha, é necessário ativar E-mail/Senha no Firebase Authentication usando uma conta proprietária do projeto.';
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized domain')) {
    return 'Para usar login com Google no domínio publicado, o domínio precisa ser autorizado no Firebase Authentication por uma conta proprietária.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup bloqueado. Redirecionando para login do Google...';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'A janela de login com o Google foi fechada antes de concluir.';
  }
  if (code === 'auth/invalid-email') {
    return 'E-mail com formato inválido.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas sem sucesso. Tente novamente em alguns instantes.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Falha na conexão de rede com o servidor de autenticação do Firebase.';
  }

  return message || 'Erro ao autenticar no Firebase Auth.';
}

// Standard Google login with popup and automatic redirect fallback
export async function loginWithGoogle(): Promise<{ user: User | null; redirectTriggered: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, redirectTriggered: false };
  } catch (error: any) {
    console.warn('Google Sign-In with popup failed or blocked:', error);
    const code = error?.code || '';
    const message = error?.message || '';

    // If popup is blocked, closed, or unsupported in iframe/environment, trigger redirect fallback
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/cancelled-popup-request' ||
      message.includes('popup')
    ) {
      console.log('Initiating Google Sign-In via redirect fallback...');
      await signInWithRedirect(auth, googleProvider);
      return { user: null, redirectTriggered: true };
    }
    throw error;
  }
}

// Check redirect result on page reload
export async function checkGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error handling Google redirect result:', error);
    throw error;
  }
}

// Login via Email and Password
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

export interface AdminValidationDetails {
  uid: string;
  email: string;
  path: string;
  docFound: boolean;
  active: boolean | null;
  role: string | null;
  docEmail: string | null;
  databaseId: string;
  rawError?: string;
}

export interface AdminValidationResult {
  isAdmin: boolean;
  reason?: string;
  details: AdminValidationDetails;
}

// Validate if user is authorized as Administrator
export async function validateAdminUser(user: User | null): Promise<AdminValidationResult> {
  const databaseId = resolvedFirebaseConfig.firestoreDatabaseId || 'default';

  if (!user) {
    return {
      isAdmin: false,
      reason: 'Nenhum usuário autenticado no Firebase Auth.',
      details: {
        uid: 'Nenhum',
        email: 'Nenhum',
        path: 'admins/Nenhum',
        docFound: false,
        active: null,
        role: null,
        docEmail: null,
        databaseId
      }
    };
  }

  const userUid = user.uid;
  const userEmail = (user.email || 'Sem e-mail').trim();
  const path = `admins/${userUid}`;
  const officialAdminEmail = 'atividadesinfantilcontato@gmail.com';
  const isOfficialEmail = userEmail.toLowerCase() === officialAdminEmail;

  try {
    // 1. Direct lookup in admins/{userUid}
    const adminDocRef = doc(db, 'admins', userUid);
    const adminSnap = await getDoc(adminDocRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data();
      const docActive = data.active === true;
      const docRole = data.role || null;
      const docEmail = data.email || null;

      if (!docActive) {
        return {
          isAdmin: false,
          reason: `Documento ${path} encontrado, mas active não está true.`,
          details: {
            uid: userUid,
            email: userEmail,
            path,
            docFound: true,
            active: false,
            role: docRole,
            docEmail,
            databaseId
          }
        };
      }

      if (docRole !== 'admin') {
        return {
          isAdmin: false,
          reason: `Documento ${path} encontrado, mas role não é admin.`,
          details: {
            uid: userUid,
            email: userEmail,
            path,
            docFound: true,
            active: true,
            role: docRole,
            docEmail,
            databaseId
          }
        };
      }

      return {
        isAdmin: true,
        details: {
          uid: userUid,
          email: userEmail,
          path,
          docFound: true,
          active: true,
          role: 'admin',
          docEmail: docEmail || userEmail,
          databaseId
        }
      };
    }

    // 2. If userUid is not pTQWbjLMsjQnXK6HaPTQfwJBybU2, check admins/pTQWbjLMsjQnXK6HaPTQfwJBybU2 as well
    if (userUid !== 'pTQWbjLMsjQnXK6HaPTQfwJBybU2') {
      try {
        const expectedDocRef = doc(db, 'admins', 'pTQWbjLMsjQnXK6HaPTQfwJBybU2');
        const expectedSnap = await getDoc(expectedDocRef);

        if (expectedSnap.exists()) {
          const expData = expectedSnap.data();
          const expActive = expData.active === true;
          const expRole = expData.role || null;
          const expEmail = expData.email || null;

          if (expActive && expRole === 'admin' && (isOfficialEmail || (expEmail && expEmail.toLowerCase() === userEmail.toLowerCase()))) {
            // Document found at expected UID and active!
            try {
              await setDoc(adminDocRef, {
                email: officialAdminEmail,
                role: 'admin',
                active: true,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (syncErr) {
              console.warn('Sync admin UID notice:', syncErr);
            }

            return {
              isAdmin: true,
              details: {
                uid: userUid,
                email: userEmail,
                path: `admins/pTQWbjLMsjQnXK6HaPTQfwJBybU2 (vinculado a ${path})`,
                docFound: true,
                active: true,
                role: 'admin',
                docEmail: expEmail || officialAdminEmail,
                databaseId
              }
            };
          }
        }
      } catch (checkExpectedErr) {
        console.warn('Notice checking fallback admin document:', checkExpectedErr);
      }
    }

    // 3. Auto-bootstrap if official email and missing
    if (isOfficialEmail) {
      try {
        await setDoc(adminDocRef, {
          email: officialAdminEmail,
          role: 'admin',
          active: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        return {
          isAdmin: true,
          details: {
            uid: userUid,
            email: userEmail,
            path,
            docFound: true,
            active: true,
            role: 'admin',
            docEmail: officialAdminEmail,
            databaseId
          }
        };
      } catch (bootstrapErr) {
        console.warn('Bootstrap notice:', bootstrapErr);
        return {
          isAdmin: true,
          details: {
            uid: userUid,
            email: userEmail,
            path,
            docFound: true,
            active: true,
            role: 'admin',
            docEmail: officialAdminEmail,
            databaseId
          }
        };
      }
    }

    // 4. Document not found
    return {
      isAdmin: false,
      reason: userUid !== 'pTQWbjLMsjQnXK6HaPTQfwJBybU2' 
        ? `UID autenticado (${userUid}) diferente do UID admin esperado ou documento ${path} não encontrado.`
        : `Documento ${path} não encontrado.`,
      details: {
        uid: userUid,
        email: userEmail,
        path,
        docFound: false,
        active: null,
        role: null,
        docEmail: null,
        databaseId
      }
    };

  } catch (err: any) {
    console.error('Error validating admin user in Firestore:', err);

    if (isOfficialEmail) {
      return {
        isAdmin: true,
        reason: 'Validado com e-mail de administrador.',
        details: {
          uid: userUid,
          email: userEmail,
          path,
          docFound: true,
          active: true,
          role: 'admin',
          docEmail: officialAdminEmail,
          databaseId,
          rawError: err?.message || String(err)
        }
      };
    }

    return {
      isAdmin: false,
      reason: `Login autenticado, mas admin não validado no Firestore: ${err?.message || err}`,
      details: {
        uid: userUid,
        email: userEmail,
        path,
        docFound: false,
        active: null,
        role: null,
        docEmail: null,
        databaseId,
        rawError: err?.message || String(err)
      }
    };
  }
}

// Logout
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// --------------------------------------------------
// Custom Error Handling as per Skill Instructions
// --------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection (as per Validation Instructions)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}

testConnection();

