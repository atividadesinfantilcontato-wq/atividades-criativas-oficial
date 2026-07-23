import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

async function runMigration() {
  console.log('=== STARTING CONTROLLED MIGRATION TO NEW FIRESTORE ===');
  console.log('Target Project: atividades-criativas-oficial');

  const fileData = fs.readFileSync('firestore_backup_migration.json', 'utf8');
  const backup = JSON.parse(fileData);

  const apiKey = process.env.NEW_FIREBASE_API_KEY || 'AIzaSy_placeholder';

  const newApp = initializeApp({
    apiKey: apiKey,
    projectId: 'atividades-criativas-oficial',
    authDomain: 'atividades-criativas-oficial.firebaseapp.com'
  }, 'MIGRATION_INSTANCE');

  const newDb = initializeFirestore(newApp, {});

  const collections = ['products', 'siteConfig', 'siteSections', 'reviews'];
  let totalWritten = 0;

  for (const colName of collections) {
    const docs = backup[colName] || [];
    console.log(`\nMigrating collection '${colName}' (${docs.length} docs)...`);

    for (const docItem of docs) {
      const { _doc_id, ...payload } = docItem;
      const docRef = doc(newDb, colName, _doc_id);
      await setDoc(docRef, payload);
      
      // Verify read-back
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.id === _doc_id) {
        console.log(`  ✓ Document [${colName}/${_doc_id}] successfully written and verified.`);
        totalWritten++;
      } else {
        throw new Error(`  ❌ Failed to verify document [${colName}/${_doc_id}] after write.`);
      }
    }
  }

  console.log(`\n=== MIGRATION COMPLETE ===`);
  console.log(`Total verified written documents: ${totalWritten} / 15`);
}

runMigration().catch(err => {
  console.error('\n❌ Migration Error:', err.message || err);
  process.exit(1);
});
