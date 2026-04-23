"use client";

import { useState } from "react";
import { BookOpen, Mic, MessageSquare, CreditCard, FileText, ShoppingBag, Lock, Download, ChevronDown, ChevronUp, Zap, Star } from "lucide-react";

const FREE_RESOURCES = [
  {
    id: "pitch",
    icon: Mic,
    title: "Door-to-Door Pitch Script",
    tag: "FREE",
    tagColor: "bg-green-100 text-green-700",
    desc: "Word-for-word script to get clients at the door. Includes rejection handling comebacks.",
    content: `
**THE 3-STEP DOOR APPROACH**

**Step 1: The Hook (5 seconds)**
"Hey! My name is [Your Name] — I run [Your Business] and I'm in the neighborhood today."

**Step 2: The Value Offer (15 seconds)**
"I noticed your [car/driveway/deck] and I do [service] — I can get that done for you today/this week for just $[price]."

**Step 3: The Close (5 seconds)**
"I've got one opening this [day] — want me to lock that in for you?"

---

**REJECTION HANDLING:**

"I already have someone."
→ "Totally understand! Just so you have a backup — when's the last time they came out?"

"I'm not interested."
→ "No worries at all! Can I leave a card in case you ever need a reliable option?"

"Too expensive."
→ "I hear you. I can do a basic [service] for $[lower price] to start. Want to try it once?"

"Call me later."
→ "Absolutely! What's the best number? I'll text you so you have mine."

---

**PRO TIPS:**
- Knock between 10am–7pm
- Wear a clean branded shirt
- Bring business cards always
- Log every conversation in ServiceOS
    `,
  },
  {
    id: "automation",
    icon: MessageSquare,
    title: "Text Reminder Templates",
    tag: "FREE",
    tagColor: "bg-green-100 text-green-700",
    desc: "Copy-paste text templates to follow up with leads and remind customers of upcoming service.",
    content: `
**TEXT MESSAGE TEMPLATES**

**Appointment Reminder (send 24hrs before):**
"Hi [Name]! Just a reminder that your [service] is scheduled for tomorrow at [time]. Reply CONFIRM to lock it in or RESCHEDULE if needed. — [Your Name]"

**Follow-Up #1 (3 days after first contact):**
"Hey [Name]! It's [Your Name] from [Business]. Just checking back in — still interested in getting your [car/driveway] done? I have a spot open this week!"

**Follow-Up #2 (1 week later):**
"Hey [Name]! Last check-in — I want to make sure I get you taken care of before my schedule fills up. Just $[price] to get started. Want to grab a spot?"

**After Service Thank You:**
"Hey [Name], hope you're loving the results! If you know anyone who could use [service], I'd really appreciate a referral. You'd both get a discount. — [Your Name]"

**Payment Reminder:**
"Hi [Name], just a quick reminder — your balance of $[amount] is outstanding from your [date] service. You can pay via [Venmo/Cash App/Zelle: @handle]. Thanks!"

---

**AUTOMATION TIP:** Copy each template into your notes app and save with [Name] as a placeholder. Replace before sending.
    `,
  },
];

const PAID_RESOURCES = [
  {
    id: "payment",
    icon: CreditCard,
    title: "Payment Processing Guide",
    tag: "PAID — $9",
    tagColor: "bg-indigo-100 text-indigo-700",
    desc: "How to set up Venmo Business, Cash App Business, Stripe, and Wave. Includes invoice templates.",
  },
  {
    id: "bizplan",
    icon: FileText,
    title: "Business Plan Mad-Libs Template",
    tag: "PAID — $19",
    tagColor: "bg-purple-100 text-purple-700",
    desc: "Fill-in-the-blank business plan for car washing, detailing, or powerwashing. Includes pricing tiers and financial projections.",
  },
  {
    id: "gear",
    icon: ShoppingBag,
    title: "Beginner Gear Starter Kits",
    tag: "AFFILIATE",
    tagColor: "bg-amber-100 text-amber-700",
    desc: "Curated Amazon lists for car washing, detailing, and powerwashing. What to buy first on a $200 budget.",
  },
  {
    id: "ghl",
    icon: Zap,
    title: "GoHighLevel for Service Businesses",
    tag: "PAID — $49",
    tagColor: "bg-red-100 text-red-700",
    desc: "Full course on using GHL to automate follow-ups, review requests, and client onboarding for your service business.",
  },
];

const GUIDES = [
  {
    title: "3-Step Framework to Get Your First Client",
    steps: [
      { num: 1, free: true, title: "Tap Your Network", desc: "Text 20 people in your phone TODAY. The script: 'Hey [Name]! I just started a [service] biz. I'd love to do your [car/house] for $[price] to get a review. Interested?'" },
      { num: 2, free: false, title: "Door-to-Door in Your Neighborhood", desc: "After your network, hit 50 doors near you. Your first sale will always come from the people closest to you geographically." },
      { num: 3, free: false, title: "Facebook & Nextdoor Ads", desc: "Once you have 3-5 reviews, run a $5/day Facebook ad to your zip code. This is where you scale from 10 to 50+ clients." },
    ],
  },
];

export default function TemplatesPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState<string | null>(null);

  function toggleResource(id: string) {
    setOpenId(prev => prev === id ? null : id);
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources & Templates</h1>
        <p className="text-sm text-gray-500 mt-0.5">Everything you need to start, grow, and scale your service business</p>
      </div>

      {/* 3-step guide */}
      {GUIDES.map(guide => (
        <div key={guide.title} className="card border-indigo-200">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">{guide.title}</h2>
          </div>
          <div className="space-y-4">
            {guide.steps.map(step => (
              <div key={step.num} className={`flex gap-4 p-4 rounded-xl ${step.free ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step.free ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                  {step.free ? step.num : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">Step {step.num}: {step.title}</p>
                    {step.free
                      ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">FREE</span>
                      : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">LOCKED</span>}
                  </div>
                  <p className={`text-xs mt-1 ${step.free ? "text-gray-600" : "text-gray-400 blur-[1px] select-none"}`}>{step.desc}</p>
                  {!step.free && (
                    <button className="mt-2 text-xs text-indigo-600 font-medium hover:underline">Unlock for $9 →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Free Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold text-gray-900">Free Resources</h2>
          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Always Free</span>
        </div>
        <div className="space-y-3">
          {FREE_RESOURCES.map(resource => {
            const Icon = resource.icon;
            const isOpen = openId === resource.id;
            return (
              <div key={resource.id} className="card border-green-200">
                <button className="w-full text-left" onClick={() => toggleResource(resource.id)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg shrink-0">
                      <Icon className="w-4 h-4 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{resource.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${resource.tagColor}`}>{resource.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{resource.desc}</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {resource.content.trim()}
                      </pre>
                    </div>
                    <button className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium">
                      <Download className="w-3 h-3" />
                      Copy to clipboard
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paid Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold text-gray-900">Paid Resources</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Bundle & Save</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAID_RESOURCES.map(resource => {
            const Icon = resource.icon;
            return (
              <div key={resource.id} className="card hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{resource.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${resource.tagColor}`}>{resource.tag}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{resource.desc}</p>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  Unlock This Resource
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affiliate gear section */}
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-gray-900">Starter Gear Kits by Niche</h2>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full ml-auto">Affiliate Links</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { niche: "Car Washing", budget: "$150–$200", items: ["Foam cannon", "Pressure washer", "Microfiber towels", "Car soap (pH neutral)", "Wheel brush"] },
            { niche: "Car Detailing", budget: "$200–$350", items: ["Orbital polisher", "Compound + polish", "Clay bars", "Interior detailer", "Vacuum (wet/dry)"] },
            { niche: "Powerwashing", budget: "$300–$500", items: ["Electric pressure washer 2000+ PSI", "25ft hose", "Surface cleaner attachment", "Downstream injector", "Safety glasses"] },
          ].map(({ niche, budget, items }) => (
            <div key={niche} className="bg-white rounded-xl border border-amber-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">{niche}</h3>
                <span className="text-xs text-amber-600 font-semibold">{budget}</span>
              </div>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-amber-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-3 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors">
                View on Amazon →
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-amber-600 mt-3 text-center">*Affiliate links help support this platform. Prices are approximate.</p>
      </div>

      {/* Freemium CTA at bottom */}
      <div className="card bg-gray-900 text-white border-none text-center py-10">
        <div className="flex justify-center mb-3">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Ready to scale to 50+ clients?</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">You&apos;ve got the CRM. Now get the full playbook — pitch script, rejection handling course, payment setup, AND business plan template.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors">
            Get the Bundle — $39
          </button>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors">
            See What&apos;s Included
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-4">30-day money back guarantee · Instant access · No fluff</p>
      </div>
    </div>
  );
}
