import HeaderComponent from '#/components/header/header';
import SidebarComponent from '#/components/sidebar/sidebar';
import ToastsComponent from '#/components/toasts/toasts';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-auto min-h-full w-full flex-col  bg-gray-50 pt-20 dark:bg-slate-950 md:pt-0'>
      <ToastsComponent />

      <div className='mx-auto flex h-auto min-h-full w-full max-w-[100rem] gap-8 p-4 xl:gap-8'>
        <HeaderComponent />
        <SidebarComponent />
        <main className='relative flex h-auto min-h-full w-full flex-col md:pt-12'>
          {children}
        </main>
      </div>
    </div>
  );
}
