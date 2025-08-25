import { motion } from "framer-motion";

export default function TestimonialSection() {
    return (
        <section>
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="relative">
                        {/* Velocity Testing Bar Background */}
                        <div className="absolute right-4 top-0 -z-10 opacity-15">
                            <div className="h-32 w-24 rounded-lg bg-muted/20 p-2 flex flex-col">
                                <div className="mb-1 text-xs font-medium text-muted-foreground/60 text-center">Velocity</div>
                                <div className="flex-1 relative">
                                    {/* Mini chart background */}
                                    <div className="w-full h-20 rounded-sm bg-muted/30 overflow-hidden relative">
                                        {/* Curved velocity line */}
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 60" preserveAspectRatio="none">
                                            <motion.path
                                                d="M 5,50 Q 20,45 30,40 T 50,25 T 75,8"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 0.8 }}
                                                transition={{ 
                                                    duration: 3, 
                                                    delay: 0.5,
                                                    ease: "easeOut" 
                                                }}
                                                viewport={{ once: true }}
                                            />
                                            {/* Gradient fill under curve */}
                                            <motion.path
                                                d="M 5,50 Q 20,45 30,40 T 50,25 T 75,8 L 75,60 L 5,60 Z"
                                                fill="url(#velocityGradient)"
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 0.3 }}
                                                transition={{ 
                                                    duration: 3, 
                                                    delay: 1,
                                                    ease: "easeOut" 
                                                }}
                                                viewport={{ once: true }}
                                            />
                                            <defs>
                                                <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
                                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-1 flex flex-col justify-between text-xs text-muted-foreground/50 text-center">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 3.5, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        className="text-[10px]"
                                    >
                                        4x
                                    </motion.span>
                                    <span className="text-[10px]">Before</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Testimonial Content */}
                        <blockquote className="before:bg-primary relative max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
                            <p className="text-foreground text-lg">Test velocity is your competitive advantage. While competitors debate, you discover.</p>
                            <footer className="mt-4 flex items-center gap-2">
                                <cite>Brian Balfour</cite>
                                <span
                                    aria-hidden
                                    className="bg-foreground/15 size-1 rounded-full"></span>
                                <span className="text-muted-foreground">ex-VP Growth HubSpot</span>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    )
}