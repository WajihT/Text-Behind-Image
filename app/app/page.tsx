// app/app/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import { Profile } from '@/types';
import Authenticate from '@/components/authenticate';
import TextCustomizer from '@/components/editor/text-customizer';
import Navbar from '@/components/navbar';

import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';
import PayDialog from '@/components/pay-dialog';
import AppAds from '@/components/editor/app-ads';

const Page = () => {
    const { user } = useUser();
    const { session } = useSessionContext();
    const supabaseClient = useSupabaseClient();
    const [currentUser, setCurrentUser] = useState<Profile>()

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState<boolean>(false); 
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getCurrentUser = async (userId: string) => {
        try {
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)

            if (error) {
                throw error;
            }

            if (profile) {
                setCurrentUser(profile[0]);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleUploadImage = () => {
        if (currentUser && (currentUser.images_generated < 2 || currentUser.paid)) {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        } else {
            alert("You have reached the limit of free generations.");
            setIsPayDialogOpen(true);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);

            if (currentUser) {
                await supabaseClient
                    .from('profiles')
                    .update({ images_generated: currentUser.images_generated + 1 })
                    .eq('id', currentUser.id) 
                    .select();
            }
            
        } catch (error) {
            console.error(error);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            rotation: 0,
            tiltX: 0,
            tiltY: 0,
            letterSpacing: 0
        }]);
    };

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        setTextSets(prev => prev.map(set => 
            set.id === id ? { ...set, [attribute]: value } : set
        ));
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const saveCompositeImage = () => {
        if (!canvasRef.current || !isImageSetupDone) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
    
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
            textSets.forEach(textSet => {
                ctx.save();
                
                // Set up text properties
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.letterSpacing = `${textSet.letterSpacing}px`;
    
                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;
    
                // Move to position first
                ctx.translate(x, y);
                
                // Apply 3D transforms
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
    
                // Use a simpler transform that maintains the visual tilt
                ctx.transform(
                    Math.cos(tiltYRad),          // Horizontal scaling
                    Math.sin(0),          // Vertical skewing
                    -Math.sin(0),         // Horizontal skewing
                    Math.cos(tiltXRad),          // Vertical scaling
                    0,                           // Horizontal translation
                    0                            // Vertical translation
                );
    
                // Apply rotation last
                ctx.rotate((textSet.rotation * Math.PI) / 180);
    
                if (textSet.letterSpacing === 0) {
                    // Use standard text rendering if no letter spacing
                    ctx.fillText(textSet.text, 0, 0);
                } else {
                    // Manual letter spacing implementation
                    const chars = textSet.text.split('');
                    let currentX = 0;
                    // Calculate total width to center properly
                    const totalWidth = chars.reduce((width, char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        return width + charWidth + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                    }, 0);
                    

                
                    // Start position (centered)
                    currentX = -totalWidth / 2;
                    
                    // Draw each character with spacing
                    chars.forEach((char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        ctx.fillText(char, currentX + charWidth / 2, 0);
                        currentX += charWidth + textSet.letterSpacing;
                    });
                }
                ctx.restore();
            });
    
            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';
    
        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'text-behind-image.png';
            link.href = dataUrl;
            link.click();
        }
    };

    useEffect(() => {
      if (user?.id) {
        getCurrentUser(user.id)
      }
    }, [user])
    
    // Show loading state while checking authentication (only when session is undefined, not null)
    if (!user && session === undefined) {
        return (
            <div className='min-h-screen bg-background'>
                <Navbar />
                <div className='flex items-center justify-center min-h-[calc(100vh-80px)]'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                        <ReloadIcon className='animate-spin h-4 w-4' />
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state when user is authenticated but profile is loading
    if (user && session && !currentUser) {
        return (
            <div className='min-h-screen bg-background'>
                <Navbar />
                <div className='flex items-center justify-center min-h-[calc(100vh-80px)]'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                        <ReloadIcon className='animate-spin h-4 w-4' />
                        Setting up your workspace...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            {user && session && currentUser ? (
                <div className='min-h-screen bg-background'>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".jpg, .jpeg, .png"
                    />
                    <Navbar
                        user={user}
                        currentUser={currentUser}
                        onSaveImage={saveCompositeImage}
                        selectedImage={selectedImage}
                        onOpenPayDialog={() => setIsPayDialogOpen(true)}
                        showCreateControls={true}
                    /> 
                    <div className='max-w-6xl mx-auto px-6 py-8'>
                        {selectedImage ? (
                            <div className='grid lg:grid-cols-2 gap-8'>
                                {/* Preview Section */}
                                <div className="space-y-4">
                                    <div className='flex items-center justify-between'>
                                        <h2 className="text-xl font-semibold">Preview</h2>
                                        <div className='flex items-center gap-2 sm:hidden'>
                                            <Button onClick={saveCompositeImage} size="sm" variant="outline">
                                                Download
                                            </Button>
                                            {!currentUser.paid && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => setIsPayDialogOpen(true)}
                                                >
                                                    Upgrade
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                                    <div className="relative w-full h-[500px] border rounded-lg overflow-hidden bg-muted/20">
                                        {isImageSetupDone ? (
                                            <Image
                                                src={selectedImage}
                                                alt="Uploaded"
                                                layout="fill"
                                                objectFit="contain"
                                                objectPosition="center"
                                            />
                                        ) : (
                                            <div className='flex items-center justify-center w-full h-full gap-2 text-muted-foreground'>
                                                <ReloadIcon className='animate-spin h-4 w-4' />
                                                Processing image...
                                            </div>
                                        )}

                                        {isImageSetupDone && textSets.map(textSet => (
                                            <div
                                                key={textSet.id}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${50 - textSet.top}%`,
                                                    left: `${textSet.left + 50}%`,
                                                    transform: `
                                                        translate(-50%, -50%)
                                                        rotate(${textSet.rotation}deg)
                                                        perspective(1000px)
                                                        rotateX(${textSet.tiltX}deg)
                                                        rotateY(${textSet.tiltY}deg)
                                                    `,
                                                    color: textSet.color,
                                                    textAlign: 'center',
                                                    fontSize: `${textSet.fontSize}px`,
                                                    fontWeight: textSet.fontWeight,
                                                    fontFamily: textSet.fontFamily,
                                                    opacity: textSet.opacity,
                                                    letterSpacing: `${textSet.letterSpacing}px`,
                                                    transformStyle: 'preserve-3d'
                                                }}
                                            >
                                                {textSet.text}
                                            </div>
                                        ))}

                                        {removedBgImageUrl && (
                                            <Image
                                                src={removedBgImageUrl}
                                                alt="Removed bg"
                                                layout="fill"
                                                objectFit="contain"
                                                objectPosition="center"
                                                className="absolute top-0 left-0 w-full h-full"
                                            />
                                        )}
                                    </div>

                                    {!currentUser.paid && (
                                        <div className="mt-4">
                                            <AppAds />
                                        </div>
                                    )}
                                </div>

                                {/* Controls Section */}
                                <div className="space-y-4">
                                    <div className='flex items-center justify-between'>
                                        <h2 className="text-xl font-semibold">Text Controls</h2>
                                        <Button onClick={addNewTextSet} size="sm">
                                            <PlusIcon className='mr-2 h-4 w-4'/>
                                            Add Text
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-4">
                                            {textSets.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>No text added yet.</p>
                                                    <p className="text-sm">Click "Add Text" to get started.</p>
                                                </div>
                                            ) : (
                                                <Accordion type="single" collapsible className="w-full">
                                                    {textSets.map(textSet => (
                                                        <TextCustomizer
                                                            key={textSet.id}
                                                            textSet={textSet}
                                                            handleAttributeChange={handleAttributeChange}
                                                            removeTextSet={removeTextSet}
                                                            duplicateTextSet={duplicateTextSet}
                                                            userId={currentUser.id}
                                                        />
                                                    ))}
                                                </Accordion>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-20 text-center'>
                                <div className="max-w-md space-y-4">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold">Upload an image to get started</h2>
                                    <p className="text-muted-foreground">
                                        Choose an image and start creating your text-behind-image design.
                                    </p>
                                    <Button onClick={handleUploadImage} size="lg" className="mt-4">
                                        Choose Image
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div> 
                    <PayDialog userDetails={currentUser as any} userEmail={user.user_metadata.email} isOpen={isPayDialogOpen} onClose={() => setIsPayDialogOpen(false)} /> 
                </div>
            ) : (
                <div className='min-h-screen bg-background'>
                    <Navbar />
                    <div className='flex items-center justify-center min-h-[calc(100vh-80px)]'>
                        <Authenticate />
                    </div>
                </div>
            )}
        </>
    );
}

export default Page;