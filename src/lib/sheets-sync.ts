'use client';

/**
 * @fileOverview 自动同步签到数据到 Google Sheets 并触发邮件通知。
 */

import { syncCheckinToSheets } from './sheets-sync-server';

export async function syncToGoogleSheets(data: any, aiReport?: string) {
  try {
    const result = await syncCheckinToSheets(data, aiReport);
    if (result.success) {
      console.log('✅ Sync successful via server action.');
      return true;
    } else {
      console.error('❌ Sync failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
    return false;
  }
}
