import { motion } from "framer-motion";

export default function TestimonialSection() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
        >
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="relative">
                        {/* Velocity Testing Bar Background */}
                        <motion.div 
                            className="absolute inset-0 -z-10 opacity-30"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 0.3, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div className="h-full w-full rounded-lg bg-muted/40 p-6 flex flex-col">
                                <motion.div 
                                    className="absolute top-4 right-4 text-xs font-medium text-muted-foreground/80"
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    Testing Velocity
                                </motion.div>
                                <div className="flex-1 relative mt-8">
                                    {/* Full-width velocity chart */}
                                    <div className="w-full h-24 rounded-sm bg-muted/30 overflow-hidden relative">
                                        {/* Curved velocity line spanning full width */}
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                                            <motion.path
                                                d="M 20,70 Q 80,65 120,60 Q 160,55 200,45 Q 240,35 280,25 Q 320,15 380,8"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                transition={{ 
                                                    duration: 3, 
                                                    delay: 0.5,
                                                    ease: "easeOut" 
                                                }}
                                                viewport={{ once: true }}
                                            />
                                            {/* Gradient fill under curve */}
                                            <motion.path
                                                d="M 20,70 Q 80,65 120,60 Q 160,55 200,45 Q 240,35 280,25 Q 320,15 380,8 L 380,80 L 20,80 Z"
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
                                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs text-muted-foreground/50">
                                    <span>Before</span>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 3.5, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        className="font-medium"
                                    >
                                        4x Faster
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Testimonial Content */}
                        <motion.blockquote 
                            className="before:bg-primary relative max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <motion.p 
                                className="text-foreground text-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
                                viewport={{ once: true }}
                            >
                                Test velocity is your competitive advantage. While competitors debate, you discover.
                            </motion.p>
                            <motion.footer 
                                className="mt-4 flex items-center gap-2"
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
                                viewport={{ once: true }}
                            >
                                <motion.cite
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 1.8 }}
                                    viewport={{ once: true }}
                                >
                                    Brian Balfour
                                </motion.cite>
                                <span
                                    aria-hidden
                                    className="bg-foreground/15 size-1 rounded-full"></span>
                                <motion.span 
                                    className="text-muted-foreground"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 2.0 }}
                                    viewport={{ once: true }}
                                >
                                    ex-VP Growth HubSpot
                                </motion.span>
                            </motion.footer>
                        </motion.blockquote>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}