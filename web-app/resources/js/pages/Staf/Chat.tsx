import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ChatbotUI from '../Chat';
import { PageProps } from '@/types';

export default function Chat() {
    const { auth } = usePage<PageProps>().props;
    
    return (
        <AppLayout>
            <Head title="Chat Internal" />
            <div className="flex flex-col h-[calc(100vh-128px)]">
                <div className="flex-grow flex justify-center overflow-hidden rounded-lg bg-transparent">
                    <div className="w-full max-w-4xl h-full relative shadow-sm rounded-lg border overflow-hidden bg-background">
                        <ChatbotUI embedded={true} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
