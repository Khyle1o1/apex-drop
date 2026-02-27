import { ReactNode, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart3,
  Boxes,
  Info,
  LayoutDashboard,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useOrderStore } from '@/lib/order-store';
import { useSettingsStore } from '@/lib/settings-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory / Variants', icon: Boxes },
  { to: '/admin/promotions', label: 'Promotions', icon: Sparkles },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings2 },
];

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const orders = useOrderStore((s) => s.orders);
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending_payment').length,
    [orders],
  );
  const { systemBanner } = useSettingsStore();
  const [showBanner, setShowBanner] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.fullName ?? 'Campus Store Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <SidebarProvider className="bg-background">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-heading font-black text-xs">CS</span>
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-heading font-extrabold text-sm tracking-tight truncate">Campus Store</div>
              <div className="text-[10px] text-sidebar-foreground/70">Admin Console</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <NavLink to={item.to} className="block">
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            size="sm"
                            className="relative justify-start data-[active=true]:bg-sidebar-accent/90 data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground"
                          >
                            <span className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-transparent data-[active=true]:bg-sidebar-accent-foreground" />
                            <Icon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                            {item.to === '/admin/orders' && pendingCount > 0 && (
                              <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                                {pendingCount}
                              </SidebarMenuBadge>
                            )}
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 border border-sidebar-border/60 shrink-0">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
                  {initials || 'CS'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">
                  {user?.fullName ?? 'Campus Store Admin'}
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/70">
                  {user?.idNumber ?? 'ADMIN-0001'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-full border border-sidebar-border/70 bg-sidebar px-2.5 py-1 text-[11px] font-semibold text-sidebar-foreground hover:border-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              Logout
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* Sticky header */}
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur-sm">
          <div className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 md:px-6 md:py-3">
            {/* Left: trigger + title */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SidebarTrigger className="shrink-0" />
              <div className="min-w-0">
                {title && (
                  <h1 className="truncate font-heading text-lg font-extrabold tracking-tight text-foreground sm:text-xl md:text-2xl lg:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="hidden truncate text-xs text-muted-foreground sm:block md:text-sm">
                    {subtitle}
                  </p>
                )}
                {systemBanner && showBanner && (
                  <div className="mt-1 hidden items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[11px] text-primary sm:inline-flex">
                    <Info className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{systemBanner}</span>
                    <button
                      type="button"
                      className="ml-1 shrink-0 text-[10px] text-primary/70 hover:text-primary"
                      onClick={() => setShowBanner(false)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: admin profile dropdown */}
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 text-left text-xs shadow-sm transition-colors hover:bg-muted sm:px-3"
                  >
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                      <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                        {initials || 'CS'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden min-w-0 flex-col md:flex">
                      <span className="truncate text-[12px] font-semibold leading-tight">
                        {user?.fullName ?? 'Campus Store Admin'}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground leading-tight">
                        ID: {user?.idNumber ?? 'ADMIN-0001'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Admin</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    Admin Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
          <div className="w-full min-w-0 space-y-5 md:space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
