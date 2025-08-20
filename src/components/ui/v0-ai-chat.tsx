"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    Globe,
    FolderIcon,
    BotIcon,
    UserIcon,
} from "lucide-react";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [isGlobalMode, setIsGlobalMode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentProject, projects, createProject } = useProjects();
    const { user } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!user || !currentWorkspace) {
            toast({
                variant: "destructive",
                title: "Authentication required",
                description: "Please make sure you're logged in and have a workspace selected.",
            });
            return;
        }

        if (!isGlobalMode && !currentProject) {
            toast({
                variant: "destructive",
                title: "Project required",
                description: "Please select a project or switch to global mode.",
            });
            return;
        }

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('knowledge-vault-chat', {
                body: {
                    message: content,
                    workspaceId: currentWorkspace.id,
                    projectId: isGlobalMode ? null : currentProject?.id,
                    userId: user.id,
                },
            });

            if (error) throw error;

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.response || "I apologize, but I couldn't generate a response. Please try again.",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast({
                variant: "destructive",
                title: "Message failed",
                description: error.message || "Failed to send message. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim() || isLoading) return;
        
        const messageContent = value.trim();
        setValue("");
        adjustHeight(true);
        
        await sendMessage(messageContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCreateProject = async () => {
        try {
            await createProject("New Project", "Created from AI Chat");
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const toggleMode = () => {
        setIsGlobalMode(!isGlobalMode);
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto p-4 h-full">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center space-y-8 flex-1 justify-center">
                    <h1 className="text-4xl font-bold text-foreground">
                        What can I help you ship?
                    </h1>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn(
                            "flex gap-3 p-4 rounded-lg",
                            message.role === 'user' 
                                ? "bg-primary/5 ml-8" 
                                : "bg-muted/50 mr-8"
                        )}>
                            <div className="flex-shrink-0">
                                {message.role === 'user' ? (
                                    <UserIcon className="w-6 h-6 text-primary" />
                                ) : (
                                    <BotIcon className="w-6 h-6 text-primary" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm mb-1">
                                    {message.role === 'user' ? 'You' : 'Claude'}
                                </div>
                                <div className="text-sm text-foreground whitespace-pre-wrap">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 p-4 rounded-lg bg-muted/50 mr-8">
                            <div className="flex-shrink-0">
                                <BotIcon className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm mb-1">Claude</div>
                                <div className="text-sm text-muted-foreground">
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <div className="space-y-4">
                <div className="relative bg-card rounded-xl border border-border">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            placeholder={
                                isGlobalMode 
                                    ? "Ask me anything..." 
                                    : currentProject 
                                        ? `Ask about ${currentProject.name}...`
                                        : "Create a project to start chatting..."
                            }
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-foreground text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-muted-foreground placeholder:text-sm",
                                "min-h-[60px]",
                                isLoading && "opacity-50"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-foreground" />
                                <span className="text-xs text-muted-foreground hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleMode}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-sm transition-colors border border-dashed hover:bg-muted flex items-center justify-between gap-1",
                                    isGlobalMode 
                                        ? "border-primary text-primary bg-primary/10" 
                                        : "border-border text-muted-foreground"
                                )}
                            >
                                {isGlobalMode ? (
                                    <Globe className="w-4 h-4" />
                                ) : (
                                    <FolderIcon className="w-4 h-4" />
                                )}
                                {isGlobalMode ? "Global" : "Project"}
                            </button>
                            
                            {!isGlobalMode && !currentProject && (
                                <button
                                    type="button"
                                    onClick={handleCreateProject}
                                    className="px-2 py-1 rounded-lg text-sm text-muted-foreground transition-colors border border-dashed border-border hover:border-primary hover:bg-muted flex items-center justify-between gap-1"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Create Project
                                </button>
                            )}
                            
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={!value.trim() || (!isGlobalMode && !currentProject) || isLoading}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border flex items-center justify-between gap-1",
                                    value.trim() && (isGlobalMode || currentProject) && !isLoading
                                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                                        : "text-muted-foreground border-border bg-muted cursor-not-allowed"
                                )}
                            >
                                <ArrowUpIcon className={cn("w-4 h-4", isLoading && "animate-spin")} />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {messages.length === 0 && (
                    <div className="flex items-center justify-center gap-3">
                        <ActionButton
                            icon={<Figma className="w-4 h-4" />}
                            label="Import from Figma"
                        />
                        <ActionButton
                            icon={<FileUp className="w-4 h-4" />}
                            label="Upload a Project"
                        />
                    </div>
                )}
                
                {!isGlobalMode && (
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {currentProject 
                                ? `Working in project: ${currentProject.name}`
                                : "No project selected. Create or select a project to continue."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}