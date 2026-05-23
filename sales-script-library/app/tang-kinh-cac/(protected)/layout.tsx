import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/auth'

export default async function TangKinhCacLayout({ children }: { children: React.ReactNode }) {
  const session = getMemberSession()
  if (!session) {
    redirect('/tang-kinh-cac/login')
  }
  return (
    <>
      {/* Override global light body background immediately — prevents FOUC on dark reader */}
      <style dangerouslySetInnerHTML={{ __html: 'body{background:#091b30!important;background-image:none!important;color:#FEF7E6!important}' }} />
      {children}
    </>
  )
}
