'use client';
import React, { ReactNode } from 'react';
import { Home, UtensilsCrossed, User, BookOpen, Mic, BeakerIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: UtensilsCrossed, label: 'Log Meal', href: '/dashboard/log-meal' },
  { icon: BookOpen, label: 'Diary', href: '/dashboard/diary' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Mic, label: 'Voice Assistant (Beta)', href: '/dashboard/voice-assistant' }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <nav className="hidden md:block w-64 bg-white h-[calc(100vh-64px)] shadow-sm fixed top-16">
        {/* <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-500">Nosh</h1>
        </div> */}
        
        <div className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                  isActive ? 'text-blue-500 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">
                  {item.label}
                  {item.label.includes('Beta') && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                      Beta
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  isActive ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">
                  {item.label.includes('Beta') ? 'Beta' : item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 min-h-screen pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
// 'use client';
// import React, { ReactNode } from 'react';
// import { Home, UtensilsCrossed, User, BookOpen } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// const navItems = [
//   { icon: Home, label: 'Overview', href: '/dashboard' },
//   { icon: UtensilsCrossed, label: 'Log Meal', href: '/dashboard/log-meal' },
//   { icon: BookOpen, label: 'Diary', href: '/dashboard/diary' },
//   // { icon: ChartLine, label: 'Progress', href: '/dashboard/progress' },
//   // { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
//   { icon: User, label: 'Profile', href: '/dashboard/profile' }
// ];

// export default function DashboardLayout({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Desktop Sidebar */}
//       <nav className="hidden md:block w-64 bg-white h-[calc(100vh-64px)] shadow-sm fixed top-16">
//         <div className="p-4">
//           <h1 className="text-2xl font-bold text-blue-500">Nosh</h1>
//         </div>
        
//         <div className="mt-8">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href;
            
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
//                   isActive ? 'text-blue-500 bg-blue-50' : 'text-gray-600'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </div>
//       </nav>
//       {/* Mobile Bottom Navigation */}
//       <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
//         <div className="flex justify-around items-center h-16">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href;
            
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex flex-col items-center gap-1 px-3 py-2 ${
//                   isActive ? 'text-blue-500' : 'text-gray-600'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span className="text-xs font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </div>
//       </nav>
//       {/* Main Content */}
//       <main className="md:ml-64 pt-16 min-h-screen pb-20 md:pb-8">
//         <div className="max-w-6xl mx-auto p-4 md:p-8">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }
// 'use client';

// import React, { ReactNode } from 'react';
// import { Home, UtensilsCrossed, ChartLine, Settings, User } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// const navItems = [
//   { icon: Home, label: 'Overview', href: '/dashboard' },
//   { icon: UtensilsCrossed, label: 'Log Meal', href: '/dashboard/log-meal' },
//   { icon: ChartLine, label: 'Progress', href: '/dashboard/progress' },
//   { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
//   { icon: User, label: 'Profile', href: '/dashboard/profile' }
// ];

// export default function DashboardLayout({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
  
//   return (
//     <div className="min-h-screen bg-gray-50 pt-16">
//       <div className="flex">
//         <nav className="w-64 bg-white h-[calc(100vh-64px)] shadow-sm fixed top-16">
//           <div className="p-4">
//             <h1 className="text-2xl font-bold text-blue-500">Nosh</h1>
//           </div>
          
//           <div className="mt-8">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = pathname === item.href;
              
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
//                     isActive ? 'text-blue-500 bg-blue-50' : 'text-gray-600'
//                   }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   <span className="font-medium">{item.label}</span>
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>

//         <main className="ml-64 flex-1 p-8">
//           <div className="max-w-6xl mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }