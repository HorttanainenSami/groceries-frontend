export function getSQLiteTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}
