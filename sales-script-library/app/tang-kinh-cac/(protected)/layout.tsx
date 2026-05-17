import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/auth'

export default async function TangKinhCacLayout({ children }: { children: React.ReactNode }) {
  const session = getMemberSession()
  if (!session) {
    redirect('/tang-kinh-cac/login')
  }
  return <>{children}</>
}
