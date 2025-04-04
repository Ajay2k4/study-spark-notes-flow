import { useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, CreditCard, Headphones, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Notes',
      url: '/notes',
      icon: BookOpen,
    },
    {
      title: 'Doubt Assistant',
      url: '/doubts',
      icon: HelpCircle,
    },
    {
      title: 'Flashcards',
      url: '/flashcards',
      icon: CreditCard,
    },
    {
      title: 'Podcast',
      url: '/podcast',
      icon: Headphones,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-spark-600 text-white p-2 rounded-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">StudySpark</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => navigate(item.url)}>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
