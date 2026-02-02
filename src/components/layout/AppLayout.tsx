import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  UserCircle,
  Layers,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Factory,
  FolderKanban,
  ChevronDown,
  Database,
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Estrutura de navegação reorganizada em 3 áreas
const navSections = [
  {
    title: 'Cadastros',
    icon: Database,
    items: [
      { path: '/clients', label: 'Clientes', icon: Users },
      { path: '/contracts', label: 'Contratos', icon: FileText },
      { path: '/positions', label: 'Vagas', icon: Briefcase },
      { path: '/professionals', label: 'Profissionais', icon: UserCircle },
      { path: '/stacks', label: 'Stacks', icon: Layers },
      { path: '/stack-categories', label: 'Categorias de Stack', icon: Layers },
      { path: '/general-seniorities', label: 'Senioridade Geral', icon: Layers },
    ],
  },
  {
    title: 'Alocação',
    icon: Briefcase,
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/teams', label: 'Times', icon: Users },
    ],
  },
  {
    title: 'Fábrica de Software',
    icon: Factory,
    items: [
      { path: '/factory', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/factory/projects', label: 'Projetos', icon: FolderKanban },
    ],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Cadastros': true,
    'Alocação': true,
    'Fábrica de Software': true,
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isPathActive = (path: string) => location.pathname === path;
  const isSectionActive = (items: typeof navSections[0]['items']) => 
    items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Talent Allocation Hub
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            Premiersoft
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navSections.map((section) => (
            <Collapsible
              key={section.title}
              open={openSections[section.title]}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-2 rounded-lg transition-colors',
                    isSectionActive(section.items)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span className="font-semibold text-sm">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      openSections[section.title] ? 'rotate-180' : ''
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-2 mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = isPathActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex-1 text-sidebar-foreground/80 hover:bg-sidebar-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex-1 text-sidebar-foreground/80 hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">Talent Allocation Hub</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b shadow-lg max-h-[70vh] overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const isActive = isPathActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ml-4',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === 'dark' ? 'Claro' : 'Escuro'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:h-screen">
        <div className="lg:p-8 p-4 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
