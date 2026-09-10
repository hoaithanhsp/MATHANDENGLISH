/**
 * Auth Service — Quản lý đăng nhập/đăng ký Firebase Auth
 * 1 Giáo viên + 8 Học sinh
 * 
 * Luồng đăng nhập:
 * 1. User nhập email + password
 * 2. Thử signIn → nếu lỗi user-not-found → tự động signUp
 * 3. Sau khi đăng nhập → lưu profile vào Realtime Database
 * 4. Xác định role từ email pattern
 */

import { User } from 'firebase/auth';
import { fbSignIn, fbSignUp, fbSignOut, fbOnAuthChanged, fbSet, fbGet, fbUpdateProfile } from '../lib/firebase';
import { Profile, UserRole } from '../types';

// ============================================================
// PREDEFINED ACCOUNTS (1 GV + 9 HS ĐỘI TUYỂN HẢI PHÒNG)
// ============================================================
export interface AccountInfo {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export const PREDEFINED_ACCOUNTS: AccountInfo[] = [
  // === GIÁO VIÊN ===
  {
    email: 'giaovien@hpmath.edu.vn',
    password: 'GV@hpmath2026',
    displayName: 'Trần Hoài Thanh (THPT Khúc Thừa Dụ, TP.Hải Phòng)',
    role: 'teacher',
  },
  // === 9 HỌC SINH ĐỘI TUYỂN ===
  {
    email: 'hs01@hpmath.edu.vn',
    password: 'HS01@hpmath',
    displayName: 'Phạm Quang Huy',
    role: 'student',
  },
  {
    email: 'hs02@hpmath.edu.vn',
    password: 'HS02@hpmath',
    displayName: 'Nguyễn Văn Minh',
    role: 'student',
  },
  {
    email: 'hs03@hpmath.edu.vn',
    password: 'HS03@hpmath',
    displayName: 'Nguyễn Văn Tuấn Anh',
    role: 'student',
  },
  {
    email: 'hs04@hpmath.edu.vn',
    password: 'HS04@hpmath',
    displayName: 'Vũ Hoàng Duy',
    role: 'student',
  },
  {
    email: 'hs05@hpmath.edu.vn',
    password: 'HS05@hpmath',
    displayName: 'Lê Thị Huyền',
    role: 'student',
  },
  {
    email: 'hs06@hpmath.edu.vn',
    password: 'HS06@hpmath',
    displayName: 'Bùi Tố Uyên',
    role: 'student',
  },
  {
    email: 'hs07@hpmath.edu.vn',
    password: 'HS07@hpmath',
    displayName: 'Trần Thị Anh Thư',
    role: 'student',
  },
  {
    email: 'hs08@hpmath.edu.vn',
    password: 'HS08@hpmath',
    displayName: 'Vũ Mạnh Cường',
    role: 'student',
  },
  {
    email: 'hs09@hpmath.edu.vn',
    password: 'HS09@hpmath',
    displayName: 'Vũ Ngọc Thịnh',
    role: 'student',
  },
];

// ============================================================
// ROLE DETECTION
// ============================================================

/** Xác định role từ email */
export const getRoleFromEmail = (email: string): UserRole => {
  if (email.startsWith('giaovien')) return 'teacher';
  return 'student';
};

/** Tìm account info từ email */
export const findAccountByEmail = (email: string): AccountInfo | undefined => {
  return PREDEFINED_ACCOUNTS.find((a) => a.email === email);
};

// ============================================================
// AUTH ACTIONS
// ============================================================

/** Đăng nhập — thử signIn, nếu chưa có tài khoản thì tự signUp */
export const loginWithEmailPassword = async (
  email: string,
  password: string,
): Promise<{ user: User; profile: Profile }> => {
  let user: User;

  try {
    // Thử đăng nhập
    user = await fbSignIn(email, password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Tài khoản chưa tồn tại → tự động tạo
      const accountInfo = findAccountByEmail(email);
      const displayName = accountInfo?.displayName || email.split('@')[0];
      user = await fbSignUp(email, password, displayName);
    } else {
      throw error;
    }
  }

  // Xây dựng profile
  const role = getRoleFromEmail(email);
  const accountInfo = findAccountByEmail(email);
  const targetName = accountInfo?.displayName || user.displayName || email.split('@')[0];

  // Nếu user đã có trước nhưng displayName chưa cập nhật theo danh sách mới
  if (accountInfo?.displayName && user.displayName !== accountInfo.displayName) {
    try {
      await fbUpdateProfile(user, { displayName: accountInfo.displayName });
    } catch {
      // ignore
    }
  }
  
  const profile: Profile = {
    id: user.uid,
    email: email,
    role,
    full_name: targetName,
    created_at: new Date().toISOString(),
  };

  // Lưu profile vào Realtime Database
  await fbSet(`profiles/${user.uid}`, profile);

  return { user, profile };
};

/** Đăng xuất */
export const logout = async (): Promise<void> => {
  await fbSignOut();
};

/** Lấy profile từ database theo UID */
export const getProfileFromDb = async (uid: string): Promise<Profile | null> => {
  return await fbGet<Profile>(`profiles/${uid}`);
};

/** Lắng nghe thay đổi auth state */
export const onAuthChanged = (callback: (user: User | null) => void): (() => void) => {
  return fbOnAuthChanged(callback);
};
