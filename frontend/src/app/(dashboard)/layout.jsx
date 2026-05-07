import Navbar from '@/components/layout/Navbar';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}