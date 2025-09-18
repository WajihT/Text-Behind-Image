'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface NavbarProps {
  // Optional props for authenticated user
  user?: any;
  currentUser?: any;
  onUploadImage?: () => void;
  onSaveImage?: () => void;
  selectedImage?: string | null;
  onOpenPayDialog?: () => void;
  showCreateControls?: boolean;
}

const Navbar = ({
  user,
  currentUser,
  onUploadImage,
  onSaveImage,
  selectedImage,
  onOpenPayDialog,
  showCreateControls = false
}: NavbarProps) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/examples', label: 'Examples' },
    { href: '/app', label: 'Create' }
  ];

  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40'>
      <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
        <Link href="/" className='text-xl font-semibold hover:text-primary transition-colors'>
          Text Behind Image
        </Link>

        {/* Navigation */}
        <nav className='hidden md:flex items-center gap-6'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className='flex items-center gap-4'>
          {/* Create screen controls - only show when user is authenticated and on create page */}
          {showCreateControls && currentUser && (
            <>
              {/* Usage indicator */}
              {!currentUser.paid && (
                <div className='hidden sm:flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>
                    {2 - (currentUser.images_generated)} / 2 free
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className='flex gap-2'>
                {selectedImage && (
                  <Button onClick={onSaveImage} size="sm" variant="outline">
                    Download
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Mobile Navigation */}
          <nav className='md:hidden flex items-center gap-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ModeToggle />

          {/* User avatar slot - always reserves space */}
          <div className="w-8 h-8 flex items-center justify-center">
            {user && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative">
                    <Avatar className={`cursor-pointer h-8 w-8 ${currentUser.paid ? 'ring-2 ring-red-500' : ''}`}>
                      <AvatarImage src={currentUser?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {currentUser?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {currentUser.paid && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded-sm font-medium">
                        PRO
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.user_metadata.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onOpenPayDialog}>
                    {currentUser?.paid ? 'Manage Plan' : 'Upgrade to Pro'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : user ? (
              /* Loading state - show placeholder avatar */
              <Avatar className="cursor-default h-8 w-8 opacity-50">
                <AvatarFallback className="text-xs">
                  <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;