import SideNav from '@/app/ui/dashboard/sidenav';
import ReasonCodeSelector from '@/app/ui/dashboard/reason-code-selector';
import SelectedReasonDisplay from '@/app/ui/dashboard/selected-reason-display';
import { ReasonCodeProvider } from '@/app/lib/hooks/use-reason-code';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReasonCodeProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="relative grow p-6 md:overflow-y-auto md:p-12">
          {/* Reason Code Selector at top right */}
          <div className="absolute top-4 right-4 z-10">
            <ReasonCodeSelector />
          </div>
          
          {/* Main content */}
          {children}
          
          {/* Selected Reason Display at bottom right */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <SelectedReasonDisplay />
          </div>
        </div>
      </div>
    </ReasonCodeProvider>
  );
}