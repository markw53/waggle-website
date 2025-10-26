import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../hooks/auth';
import { useTheme } from '../hooks/useTheme'; // Updated import

export default function Navbar() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="px-6 py-4 border-b border-border bg-white dark:bg-zinc-900 text-foreground flex justify-between items-center shadow-sm">
      <span className="text-xl font-bold text-[#573a20] dark:text-amber-200">
        Welcome to Waggle
      </span>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-[#573a20] dark:text-zinc-100 text-base font-medium bg-[#ffeedd] dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm hover:bg-[#f9deb3] dark:hover:bg-zinc-700 transition"
        >
          Home
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9">
              <AvatarImage
                src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=waggle"
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={5}
            className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-md w-56 z-50"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-md z-50"
                sideOffset={8}
              >
                <DropdownMenuItem 
                  onClick={() => setTheme('light')} 
                  className="cursor-pointer"
                >
                  ☀️ Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('dark')} 
                  className="cursor-pointer"
                >
                  🌙 Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('system')} 
                  className="cursor-pointer"
                >
                  💻 System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}