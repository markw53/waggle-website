import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/auth';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        // First try to get photo from Firebase Auth
        if (user.photoURL) {
          setUserPhotoURL(user.photoURL);
          return;
        }

        // If not in Auth, check Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.photoURL) {
            setUserPhotoURL(userData.photoURL);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <nav className="px-6 py-4 border-b border-border bg-white dark:bg-zinc-900 text-foreground flex justify-between items-center shadow-sm">
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-bold text-[#573a20] dark:text-amber-200">
          Welcome to Waggle
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-[#573a20] dark:text-zinc-100 text-base font-medium bg-[#ffeedd] dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm hover:bg-[#f9deb3] dark:hover:bg-zinc-700 transition"
        >
          Home
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9 ring-2 ring-[#8c5628] dark:ring-amber-600 hover:ring-[#6d4320] dark:hover:ring-amber-500 transition-all">
              {userPhotoURL ? (
                <AvatarImage
                  src={userPhotoURL}
                  alt={user?.displayName || user?.email || 'User'}
                />
              ) : (
                <AvatarFallback className="bg-linear-to-br from-[#8c5628] to-[#6d4320] dark:from-amber-600 dark:to-amber-700 text-white font-semibold">
                  {user?.displayName?.charAt(0).toUpperCase() || 
                   user?.email?.charAt(0).toUpperCase() || 
                   'U'}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={5}
            className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-md w-56 z-50"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'My Account'}
                </p>
                <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
            
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/dogs" className="cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Dogs
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/add-dog" className="cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Dog
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/matches" className="cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                My Matches
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </div>
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

            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />

            <DropdownMenuItem 
              onClick={logout} 
              className="cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}