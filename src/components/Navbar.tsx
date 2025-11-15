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
import { useAuth } from '@/context';
import { useTheme } from '@/hooks/useTheme';
import { useMessaging } from '@/hooks/useMessaging';
import { useBreedingCalendar } from '@/hooks/useBreedingCalendar';
import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { ROUTES } from '@/config/routes';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { conversations } = useMessaging();
  const { upcomingCyclesCount } = useBreedingCalendar();
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const unreadCount = useMemo(() => {
    if (!user || !conversations) return 0;
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount?.[user.uid] || 0);
    }, 0);
  }, [conversations, user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserPhotoURL(null);
        return;
      }

      try {
        if (user.photoURL) {
          setUserPhotoURL(user.photoURL);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.photoURL) {
            setUserPhotoURL(userData.photoURL);
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching user profile:', error.message);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    console.log('👤 User ID:', user?.uid);
    console.log('🔍 Is Admin:', isAdmin);
    console.log('⏳ Admin Loading:', adminLoading);
  }, [user, isAdmin, adminLoading]);

  return (
    <nav className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-white dark:bg-zinc-900 text-foreground shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-[#573a20] dark:text-amber-200">
            Waggle
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to={ROUTES.DASHBOARD}
            className="hidden sm:block text-[#573a20] dark:text-zinc-100 text-base font-medium bg-[#ffeedd] dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm hover:bg-[#f9deb3] dark:hover:bg-zinc-700 transition"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <Avatar className="h-9 w-9 ring-2 ring-[#8c5628] dark:ring-amber-600 hover:ring-[#6d4320] dark:hover:ring-amber-500 transition-all">
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={5}
              className="hidden sm:block bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-md w-56 z-50"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'My Account'}
                  </p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
              
              <DropdownMenuItem asChild>
                <Link to={ROUTES.GETTING_STARTED} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Getting Started
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.PROFILE} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.MY_DOGS} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Dogs
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.DOGS} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Dogs
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.BREEDS} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Browse Breeds
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.ADD_DOG} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Dog
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.BREEDING_CALENDAR} className="cursor-pointer flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Breeding Calendar
                  </div>
                  {upcomingCyclesCount > 0 && (
                    <span 
                      className="ml-auto px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full"
                      title={`${upcomingCyclesCount} cycle${upcomingCyclesCount > 1 ? 's' : ''} starting in next 7 days`}
                    >
                      {upcomingCyclesCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.DOGS_MAP} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map View
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.MATCHES} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  My Matches
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.MESSAGES} className="cursor-pointer flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </div>
                  {unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={ROUTES.ANALYTICS} className="cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN_DASHBOARD} className="cursor-pointer flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      🔒 Admin Panel
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

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
      </div>

            {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-4 pb-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="flex flex-col space-y-2">
            <Link
              to={ROUTES.GETTING_STARTED}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Getting Started
            </Link>

            <Link
              to={ROUTES.PROFILE}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>

            <Link
              to={ROUTES.MY_DOGS}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Dogs
            </Link>

            <Link
              to={ROUTES.DOGS}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Dogs
            </Link>

            <Link
              to={ROUTES.BREEDS}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Breeds
            </Link>

            <Link
              to={ROUTES.ADD_DOG}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Dog
            </Link>

            <Link
              to={ROUTES.BREEDING_CALENDAR}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Breeding Calendar
              </div>
              {upcomingCyclesCount > 0 && (
                <span 
                  className="ml-auto px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full"
                  title={`${upcomingCyclesCount} cycle${upcomingCyclesCount > 1 ? 's' : ''} starting in next 7 days`}
                >
                  {upcomingCyclesCount}
                </span>
              )}
            </Link>

            <Link
              to={ROUTES.MATCHES}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              My Matches
            </Link>

            <Link
              to={ROUTES.MESSAGES}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={ROUTES.ANALYTICS}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
                <Link
                  to={ROUTES.ADMIN_DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  🔒 Admin Panel
                </Link>
              </>
            )}

            <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>

            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Theme</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                    theme === 'light'
                      ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                    theme === 'dark'
                      ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🌙 Dark
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('system');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                    theme === 'system'
                      ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  💻 Auto
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>

            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

