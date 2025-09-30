import React from "react";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AppBar from "@/components/AppBar";

const faqs = [
  {
    question: "How do I check in as a visitor?",
    answer:
      "To check in, go to the main kiosk or front desk, enter your details, and follow the on-screen instructions."
  },
  {
    question: "Do I need an appointment to visit?",
    answer:
      "Some locations require appointments. Please check with the organization or your host before visiting."
  },
  {
    question: "Can I pre-register my visit?",
    answer:
      "Yes, if your host has sent you a pre-registration link, you can fill in your information ahead of time."
  },
  {
    question: "What should I bring for my visit?",
    answer:
      "Typically, a valid photo ID is required. Your host will inform you if anything else is needed."
  }
];

export default function HelpCenter() {
  return (
    <div> 
        <AppBar />
         <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-gray-900 tracking-tight">
        Visitor Help Center
      </h1>

      <div className="relative mb-12 max-w-xl mx-auto">
        <Input
          type="text"
          placeholder="Search visitor help topics..."
          className="pl-12 pr-4 py-3 rounded-full shadow-lg border border-gray-200"
        />
        <Search className="absolute top-3 left-4 w-5 h-5 text-gray-500" />
      </div>

      <Accordion type="single" collapsible className="space-y-5">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <Card className="rounded-3xl border border-gray-100 shadow-md transition hover:shadow-lg">
              <CardContent className="p-6">
                <summary className="cursor-pointer font-semibold text-xl text-gray-800">
                  {faq.question}
                </summary>
                <div className="mt-3 text-gray-600 text-base leading-relaxed">
                  {faq.answer}
                </div>
              </CardContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-10 shadow-inner">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Still need help?</h2>
        <p className="text-base text-gray-600 mb-6">
          Reach out to the front desk or your host for immediate assistance.
        </p>
        <Button className="rounded-full px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 transition">
          Contact Support
        </Button>
      </div>
    </div>
    </div>
   
  );
}
