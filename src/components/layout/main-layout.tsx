'use client';
import { useState, type ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Flower,
  LayoutDashboard,
  Smile,
  User,
  Wind,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

const studentNavItems = [
  { href: '/', label: 'Check-in', icon: Smile },
  { href: '/cool-down', label: 'Cool Down', icon: Wind },
];

const teacherNavItems = [
  { href: '/dashboard/teacher', label: 'Teacher Dashboard', icon: LayoutDashboard },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isTeacherView, setIsTeacherView] = useState(false);

  const navItems = isTeacherView ? teacherNavItems : studentNavItems;

  const roleSwitcher = (
    <div className="flex items-center space-x-2 p-2">
      <Users className="w-5 h-5"/>
      <Label htmlFor="role-switch" className="flex-grow group-data-[collapsible=icon]:hidden">Teacher View</Label>
      <Switch
        id="role-switch"
        checked={isTeacherView}
        onCheckedChange={setIsTeacherView}
        className="group-data-[collapsible=icon]:hidden"
      />
    </div>
  )

  const sidebarContent = (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
            <Flower className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-xl font-bold group-data-[collapsible=icon]:hidden">🌱 PSL Mind Sprout</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  size="lg"
                  isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                  tooltip={item.label}
                  asChild
                >
                  <span>
                    <item.icon className="w-6 h-6" />
                    <span className='group-data-[collapsible=icon]:hidden text-base'>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {roleSwitcher}
      </SidebarFooter>
    </>
  );

  return (
    <SidebarProvider>
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Flower className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-xl font-bold">🌱 PSL Mind Sprout</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <SidebarTrigger />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px] bg-card">
              <Sidebar collapsible="offcanvas">{sidebarContent}</Sidebar>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex">
            <Sidebar collapsible="icon" className="hidden md:block">
                {sidebarContent}
            </Sidebar>
            <SidebarInset className='w-full'>
                <div className="flex-1 p-4 md:p-8">{children}</div>
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
