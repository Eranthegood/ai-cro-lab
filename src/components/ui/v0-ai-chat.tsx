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
import { ProjectSelector } from "@/components/project/ProjectSelector";
import { SaveToVaultModal } from "@/components/project/SaveToVaultModal";
import { ProjectSidebar } from "@/components/project/ProjectSidebar";
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
    Archive,
    Database,
    Upload,
    Settings,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const { currentProject, projects, createProject, switchProject } = useProjects();
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

    const handleFileUpload = () => {
        toast({
            title: "File Upload",
            description: "File upload functionality will be implemented soon.",
        });
    };

    const handleDataUpload = () => {
        toast({
            title: "Data Upload", 
            description: "Data upload functionality will be implemented soon.",
        });
    };

    const handleConversationSelect = (conversation: any) => {
        // Load the conversation messages
        if (conversation.messages && Array.isArray(conversation.messages)) {
            setMessages(conversation.messages.map((msg: any, index: number) => ({
                id: `${conversation.id}-${index}`,
                role: msg.role || 'user',
                content: msg.content || '',
                timestamp: new Date(msg.timestamp || conversation.updated_at)
            })));
        }
        
        toast({
            title: "Conversation loaded",
            description: `Loaded conversation with ${conversation.messages?.length || 0} messages`,
        });
    };

    return (
        <div className="flex h-full w-full">
            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 max-w-4xl mx-auto p-4 min-w-0">

            {messages.length === 0 ? (
                <div className="flex flex-col items-center space-y-8 flex-1 justify-center">
                    <h1 className="text-4xl font-bold text-foreground mb-6">
                        What can I help you ship?
                    </h1>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={message.id} className={cn(
                            "flex gap-3 p-4 rounded-lg group",
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
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium text-sm">
                                        {message.role === 'user' ? 'You' : 'Claude'}
                                    </div>
                                    {message.role === 'assistant' && !isGlobalMode && currentProject && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <SaveToVaultModal 
                                                content={message.content}
                                                messageContext={{ 
                                                    timestamp: message.timestamp,
                                                    messageId: message.id,
                                                    conversationIndex: index
                                                }}
                                            >
                                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                                    <Archive className="w-3 h-3" />
                                                </Button>
                                            </SaveToVaultModal>
                                        </div>
                                    )}
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "px-2 py-1 rounded-lg text-sm transition-colors border border-dashed hover:bg-muted flex items-center justify-between gap-1 min-w-[100px]",
                                            isGlobalMode 
                                                ? "border-primary text-primary bg-primary/10" 
                                                : currentProject
                                                    ? "border-primary text-primary bg-primary/10"
                                                    : "border-border text-muted-foreground"
                                        )}
                                    >
                                        {isGlobalMode ? (
                                            <Globe className="w-4 h-4" />
                                        ) : currentProject ? (
                                            <FolderIcon className="w-4 h-4" />
                                        ) : (
                                            <PlusIcon className="w-4 h-4" />
                                        )}
                                        <span className="truncate">
                                            {isGlobalMode ? "Global" : currentProject?.name || "Create"}
                                        </span>
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Mode & Project</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem
                                        onClick={() => setIsGlobalMode(true)}
                                        className={isGlobalMode ? "bg-accent" : ""}
                                    >
                                        <Globe className="w-4 h-4 mr-2" />
                                        Global Mode
                                        {isGlobalMode && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                    
                                    {projects.map((project) => (
                                        <DropdownMenuItem
                                            key={project.id}
                                            onClick={() => {
                                                setIsGlobalMode(false);
                                                switchProject(project.id);
                                            }}
                                            className={!isGlobalMode && currentProject?.id === project.id ? "bg-accent" : ""}
                                        >
                                            <FolderIcon className="w-4 h-4 mr-2" />
                                            <span className="truncate">{project.name}</span>
                                            {!isGlobalMode && currentProject?.id === project.id && (
                                                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleCreateProject}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Create New Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
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

                {/* Upload Buttons */}
                <div className="flex flex-wrap gap-2 p-4 border-t">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast({ title: "Figma import", description: "Feature coming soon!" })}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" fill="#f24e1e"/>
                            <path d="M12 2h3.5A3.5 3.5 0 0 1 19 5.5 3.5 3.5 0 0 1 15.5 9H12V2z" fill="#ff7262"/>
                            <path d="M12 9h3.5A3.5 3.5 0 0 1 19 12.5 3.5 3.5 0 0 1 15.5 16H12V9z" fill="#1abcfe"/>
                            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" fill="#0acf83"/>
                            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5A3.5 3.5 0 0 1 8.5 23 3.5 3.5 0 0 1 5 19.5z" fill="#0acf83"/>
                        </svg>
                        Add Figma
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast({ title: "CSV import", description: "Feature coming soon!" })}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
                            <polyline points="14,2 14,8 20,8" fill="#cbd5e1"/>
                            <rect x="2" y="14" width="20" height="8" rx="2" fill="#22C55E"/>
                            <text x="12" y="19" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">CSV</text>
                        </svg>
                        Add CSV
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast({ title: "Document import", description: "Feature coming soon!" })}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
                            <polyline points="14,2 14,8 20,8" fill="#cbd5e1"/>
                            <rect x="2" y="14" width="20" height="8" rx="2" fill="#3B82F6"/>
                            <text x="12" y="19" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">DOCX</text>
                        </svg>
                        Add Document
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast({ title: "Text content import", description: "Feature coming soon!" })}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M4 2L10 22H7.5L2.5 6L4 2Z" fill="#1a1a1a"/>
                            <path d="M20 2L14 22H16.5L21.5 6L20 2Z" fill="#1a1a1a"/>
                            <path d="M9 12H15V10H9V12Z" fill="#1a1a1a"/>
                        </svg>
                        Add Contenu textuel
                    </Button>
                </div>

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
            
            {/* Project Sidebar - Only show when in project mode */}
            {!isGlobalMode && currentProject && (
                <ProjectSidebar 
                    projectId={currentProject.id}
                    onConversationSelect={handleConversationSelect}
                />
            )}
        </div>
    );
};