import { motion } from "framer-motion";

export default function TestimonialSection() {
    return (
        <section>
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="relative">
                        {/* Velocity Testing Bar Background */}
                        <div className="absolute inset-0 -z-10 opacity-10">
                            <div className="h-full w-full rounded-lg bg-muted/20 p-4">
                                <div className="mb-2 text-xs font-medium text-muted-foreground/60">Testing Velocity</div>
                                <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                                        initial={{ width: "0%" }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ 
                                            duration: 3, 
                                            delay: 0.5,
                                            ease: "easeOut" 
                                        }}
                                        viewport={{ once: true }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between text-xs text-muted-foreground/50">
                                    <span>Before</span>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 3.5, duration: 0.5 }}
                                        viewport={{ once: true }}
                                    >
                                        4x Faster
                                    </motion.span>
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