'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Profile } from '@/types';
import PayDialog from '@/components/pay-dialog';

const examples = [
  { src: '/bear.png', alt: 'Bear text behind image example' },
  { src: '/cold.png', alt: 'Cold text behind image example' },
  { src: '/enjoy.png', alt: 'Enjoy text behind image example' },
  { src: '/go.png', alt: 'Go text behind image example' },
  { src: '/goats.png', alt: 'Goats text behind image example' },
  { src: '/life.png', alt: 'Life text behind image example' },
  { src: '/nature.png', alt: 'Nature text behind image example' },
  { src: '/pov.png', alt: 'POV text behind image example' },
  { src: '/pressure.png', alt: 'Pressure text behind image example' },
  { src: '/ride.png', alt: 'Ride text behind image example' },
  { src: '/sf.png', alt: 'SF text behind image example' },
  { src: '/snap.png', alt: 'Snap text behind image example' },
  { src: '/vie.png', alt: 'Vie text behind image example' },
  { src: '/wow.png', alt: 'Wow text behind image example' }
];

const ExamplesPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState<boolean>(false);
  const { user } = useUser();
  const { session } = useSessionContext();
  const supabaseClient = useSupabaseClient();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  const getCurrentUser = async (userId: string) => {
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getCurrentUser(user.id);
    }
  }, [user]);

  return (
    <div className='min-h-screen bg-background'>
      <Navbar
        user={user}
        currentUser={currentUser}
        onOpenPayDialog={() => setIsPayDialogOpen(true)}
      />

      {/* Examples Content */}
      <main className='max-w-6xl mx-auto px-6 py-8'>
        <div className='text-center mb-12'>
          <h1 className="text-4xl font-bold mb-4">
            Example Designs
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get inspired by these text-behind-image designs created with our tool.
          </p>
          <Link href="/app">
            <Button size="lg">
              Start Creating Your Own
            </Button>
          </Link>
        </div>

        {/* Examples Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {examples.map((example, index) => (
            <div
              key={index}
              className='group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer'
              onClick={() => setSelectedImage(example.src)}
            >
              <div className='aspect-square relative'>
                <Image
                  src={example.src}
                  alt={example.alt}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                />
              </div>
            </div>
          ))}
        </div>

        {/* Modal for full-size image */}
        {selectedImage && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'
            onClick={() => setSelectedImage(null)}
          >
            <div
              className='relative max-w-5xl max-h-[90vh] w-full mx-4'
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className='absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors'
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className='relative w-full h-full'>
                <Image
                  src={selectedImage}
                  alt="Full size example"
                  width={1200}
                  height={1200}
                  className='w-full h-auto max-h-[90vh] object-contain rounded-lg'
                />
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className='text-center mt-16 py-12 border-t'>
          <h2 className='text-2xl font-bold mb-4'>
            Ready to create your own?
          </h2>
          <p className='text-muted-foreground mb-6'>
            Upload your image and start designing in minutes.
          </p>
          <Link href="/app">
            <Button size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className='py-8 px-6 border-t'>
        <div className='max-w-6xl mx-auto text-center text-sm text-muted-foreground'>
          © 2025 Text Behind Image . {" "}
          <Link href="https://x.com/BigUnit_42" target="_blank" className="hover:underline">
            Big Unit
          </Link>
        </div>
      </footer>

      {/* Pay Dialog */}
      {user && currentUser && (
        <PayDialog
          userDetails={currentUser as any}
          userEmail={user.user_metadata.email}
          isOpen={isPayDialogOpen}
          onClose={() => setIsPayDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ExamplesPage;