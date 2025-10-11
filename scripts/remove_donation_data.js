const admin = require('firebase-admin');

// Firebase Admin SDKの初期化
// 環境変数からサービスアカウントキーを取得
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // プロジェクトIDを環境変数から取得、または直接指定
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
});

const db = admin.firestore();

async function removeDonationData() {
  console.log('寄付データの削除を開始します...');
  
  try {
    // すべてのユーザーの寄付データを取得
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('ユーザーデータが見つかりませんでした。');
      return;
    }
    
    console.log(`${usersSnapshot.size}人のユーザーが見つかりました。`);
    
    const batch = db.batch();
    let deleteCount = 0;
    
    // 各ユーザーの寄付データを削除
    for (const userDoc of usersSnapshot.docs) {
      const donationDocRef = db
        .collection('users')
        .doc(userDoc.id)
        .collection('settings')
        .doc('donation');
      
      // ドキュメントが存在するかチェック
      const donationDoc = await donationDocRef.get();
      if (donationDoc.exists) {
        batch.delete(donationDocRef);
        deleteCount++;
        console.log(`ユーザー ${userDoc.id} の寄付データを削除対象に追加しました。`);
      }
    }
    
    if (deleteCount > 0) {
      // バッチで削除を実行
      await batch.commit();
      console.log(`${deleteCount}件の寄付データを削除しました。`);
    } else {
      console.log('削除対象の寄付データは見つかりませんでした。');
    }
    
    console.log('寄付データの削除が完了しました。');
    
  } catch (error) {
    console.error('寄付データの削除中にエラーが発生しました:', error);
    throw error;
  }
}

// スクリプト実行
removeDonationData()
  .then(() => {
    console.log('マイグレーションが正常に完了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('マイグレーション中にエラーが発生しました:', error);
    process.exit(1);
  });
