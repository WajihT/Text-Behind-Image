'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Profile } from '@/types';
import PayDialog from '@/components/pay-dialog';

const page = () => {
    const { user } = useUser();
    const { session } = useSessionContext();
    const supabaseClient = useSupabaseClient();
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState<boolean>(false);

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

            {/* Hero Section */}
            <main className='flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto'>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Create stunning{" "}
                    <span className="text-primary">
                        text-behind-image
                    </span>
                    {" "}designs
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    A simple tool to create professional text-behind-image designs. Upload your image, add text, and download your creation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <Link href="/app">
                        <Button size="lg" className="px-8 py-3">
                            Start Creating
                        </Button>
                    </Link>
                    <Link href="/examples">
                        <Button variant="outline" size="lg" className="px-8 py-3">
                            View Examples
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Features Section */}
            <section className='py-20 px-6 bg-muted/30'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center mb-12'>
                        Simple. Fast. Professional.
                    </h2>

                    <div className='grid md:grid-cols-3 gap-8'>
                        <div className='text-center'>
                            <div className='h-12 w-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center'>
                                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Upload Image</h3>
                            <p className='text-muted-foreground'>Simply drag and drop or click to upload your image</p>
                        </div>

                        <div className='text-center'>
                            <div className='h-12 w-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center'>
                                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Add Text</h3>
                            <p className='text-muted-foreground'>Customize fonts, colors, and positioning with ease</p>
                        </div>

                        <div className='text-center'>
                            <div className='h-12 w-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center'>
                                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Download</h3>
                            <p className='text-muted-foreground'>Get your high-quality design ready to share</p>
                        </div>
                    </div>
                </div>
            </section>

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
}

export default page;