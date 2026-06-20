import { redirect } from 'next/navigation'

// Legacy duplicate of the file manager. The canonical, fully-wired experience
// lives at /files (seeded from MOCK_FILES, Peak navy theme). Redirect there so
// there is a single source of truth for files.
export default function LegacyStorageFilesPage() {
  redirect('/files')
}
