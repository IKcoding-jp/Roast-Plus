import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from 'firebase/storage';
import app from './firebase';

// Storageインスタンスを遅延初期化
let storage: FirebaseStorage | null = null;

function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(app);
  }
  return storage;
}

/**
 * 欠点豆の画像をFirebase Storageにアップロード
 * @param userId ユーザーID（空文字列の場合はマスターデータ）
 * @param defectBeanId 欠点豆ID
 * @param file 画像ファイル
 * @returns ダウンロードURL
 */
export async function uploadDefectBeanImage(
  userId: string,
  defectBeanId: string,
  file: File
): Promise<string> {
  try {
    const storageInstance = getStorageInstance();
    
    // マスターデータの場合は別のパスを使用
    const storagePath = userId
      ? `defect-beans/${userId}/${defectBeanId}/${Date.now()}_${file.name}`
      : `defect-beans-master/${defectBeanId}/${Date.now()}_${file.name}`;
    
    const storageRef = ref(storageInstance, storagePath);
    
    // ファイルをアップロード
    await uploadBytes(storageRef, file);
    
    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Failed to upload defect bean image:', error);
    throw error;
  }
}

/**
 * 欠点豆の画像をFirebase Storageから削除
 * @param imageUrl 削除する画像のURL
 */
export async function deleteDefectBeanImage(imageUrl: string): Promise<void> {
  try {
    const storageInstance = getStorageInstance();
    
    // URLからStorage参照を取得
    // URL形式: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token={token}
    // または: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media
    const url = new URL(imageUrl);
    
    // パス部分を抽出（/o/ の後の部分）
    // クエリパラメータの有無に関わらず動作するように改善
    const pathMatch = url.pathname.match(/\/o\/(.+)$/);
    
    if (!pathMatch || !pathMatch[1]) {
      throw new Error(`Invalid image URL format: ${imageUrl}`);
    }
    
    // URLデコード（%2F -> / など）
    const decodedPath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storageInstance, decodedPath);
    
    // 画像を削除
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Failed to delete defect bean image:', error);
    throw error;
  }
}

