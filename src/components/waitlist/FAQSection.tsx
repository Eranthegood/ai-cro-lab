import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQSectionProps {
  className?: string;
}

const FAQSection = ({ className = "" }: FAQSectionProps) => {
  const faqs = [
    {
      question: "How does automated AB testing actually work?",
      answer: "Our platform connects to your existing analytics tools (Contentsquare, Google Analytics, etc.), automatically identifies conversion bottlenecks, generates data-backed hypotheses, and creates ready-to-deploy test variations. You go from insight to live test in under 10 minutes instead of 2-3 weeks."
    },
    {
      question: "What tools does this integrate with?",
      answer: "We integrate with major analytics platforms (Contentsquare, Hotjar, Google Analytics), AB testing tools (Optimizely, VWO, Google Optimize), and development workflows (GitHub, Figma). Our goal is to work with your existing stack, not replace it."
    },
    {
      question: "Is this suitable for technical and non-technical teams?",
      answer: "Absolutely. The platform is designed for product managers, growth marketers, and CRO specialists who want to move faster without depending on dev resources for every test. Technical teams benefit from automated code generation and seamless deployment workflows."
    },
    {
      question: "What makes this different from existing AB testing tools?",
      answer: "Most tools focus on running tests. We focus on the entire workflow: from data analysis → hypothesis generation → test creation → deployment → results analysis. We're the missing link between your insights and your experiments."
    },
    {
      question: "When will the beta be available?",
      answer: "We're launching the private beta in Q1 2024 with the first 500 users. Beta participants get lifetime access to premium features, priority support, and the ability to shape our roadmap based on their feedback."
    },
    {
      question: "What happens to my data?",
      answer: "Your data remains yours. We're SOC 2 compliant and GDPR ready. We only access the data you explicitly connect, and we never share insights between companies. Your competitive advantage stays competitive."
    }
  ];

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about automated AB testing
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-4">
            <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;