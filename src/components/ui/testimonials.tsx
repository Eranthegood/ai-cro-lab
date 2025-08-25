export default function TestimonialSection() {
    return (
        <section>
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
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
        </section>
    )
}