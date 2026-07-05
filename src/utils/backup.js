export const createImportBackup = (data) => {
  const backupKey = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const snapshot = {
    ...data,
    backupAt: new Date().toISOString(),
    backupType: 'pre-import',
  };

  try {
    localStorage.setItem(backupKey, JSON.stringify(snapshot));
    return backupKey;
  } catch (error) {
    console.error('Auto backup failed:', error);
    return null;
  }
};