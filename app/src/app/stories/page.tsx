"use client";

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const STORIES = [
  {
    category: 'Sustainability',
    title: 'How we achieved carbon neutrality across our supply chain',
    excerpt: 'Three years of measurement, offsetting, and ultimately eliminating — the long journey to a genuinely clean production process.',
    date: 'May 2026',
    readTime: '6 min',
  },
  {
    category: 'Artisans',
    title: 'Meet the weavers of Dhaka: where every thread carries a name',
    excerpt: 'A profile of the twelve artisan families behind our hand-woven cotton programme, and why we publish their wages publicly.',
    date: 'April 2026',
    readTime: '4 min',
  },
  {
    category: 'Process',
    title: 'Natural dyes and the chemistry of colour without compromise',
    excerpt: 'Why synthetic dyes account for 20% of global water pollution — and what we use instead.',
    date: 'March 2026',
    readTime: '8 min',
  },
  {
    category: 'Design',
    title: 'Zero-waste pattern making: every centimetre of fabric counts',
    excerpt: 'Our design team explains how constraint becomes creativity when the brief is to generate zero cutting waste.',
    date: 'February 2026',
    readTime: '5 min',
  },
  {
    category: 'Impact',
    title: '2025 Impact Report: 1,400 living-wage jobs, 0 kg landfill waste',
    excerpt: 'The numbers behind a year of growth — and the targets we fell short of, honestly reported.',
    date: 'January 2026',
    readTime: '10 min',
  },
  {
    category: 'Community',
    title: 'The repair programme: extending garment life by an average of 4 years',
    excerpt: 'Free lifetime repairs for every Kazi garment. The economics, the practicalities, and the stories behind it.',
    date: 'December 2025',
    readTime: '5 min',
  },
];

export default function StoriesPage() {
  useSmoothScroll();
  return (
    <main className="min-h-screen bg-cream">
      <Navigation />

      {/* Hero */}
      <section className="pt-40 pb-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <p className="font-inter text-xs tracking-nav text-text-muted uppercase mb-4">Journal</p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-espresso mb-5">Stories</h1>
          <p className="font-inter text-text-muted text-base max-w-lg leading-relaxed">
            Behind every garment is a process, a person, and a choice. These are our stories.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6 border-b border-rule">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule">
            {/* Image panel */}
            <div className="bg-espresso min-h-[300px] md:min-h-[400px] flex items-end p-8">
              <div>
                <span className="inline-block font-inter text-[10px] tracking-nav text-cream/50 uppercase mb-3 border border-cream/20 px-2 py-0.5">
                  {STORIES[0].category}
                </span>
                <h2 className="font-cinzel text-2xl text-cream mb-3 leading-snug max-w-sm">
                  {STORIES[0].title}
                </h2>
                <p className="font-inter text-sm text-cream/60 leading-relaxed max-w-sm">
                  {STORIES[0].excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="font-inter text-xs text-cream/40">{STORIES[0].date}</span>
                  <span className="text-cream/20">·</span>
                  <span className="font-inter text-xs text-cream/40">{STORIES[0].readTime} read</span>
                </div>
              </div>
            </div>
            {/* Content panel */}
            <div className="bg-white p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block font-inter text-[10px] tracking-nav text-accent-warm uppercase mb-3 border border-accent-warm/30 px-2 py-0.5">
                  Editor&apos;s Pick
                </span>
                <p className="font-inter text-sm text-text-muted leading-relaxed">
                  A deep-dive into the supply chain transformation that took three years, required 14 supplier audits, and ultimately changed how we think about growth itself.
                </p>
              </div>
              <button className="mt-6 self-start font-inter text-xs tracking-button uppercase text-espresso border border-espresso px-5 py-2.5 hover:bg-espresso hover:text-cream transition-colors duration-200">
                Read Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-rule">
            {STORIES.slice(1).map((story, i) => (
              <div
                key={story.title}
                className={`p-8 bg-white border-b md:border-b-0 ${
                  i % 3 !== 2 ? 'md:border-r border-rule' : ''
                } ${i >= 3 ? 'border-t border-rule' : ''} hover:bg-cream/40 transition-colors duration-200 cursor-pointer group`}
              >
                <span className="inline-block font-inter text-[10px] tracking-nav text-accent-warm uppercase mb-4 border border-accent-warm/30 px-2 py-0.5">
                  {story.category}
                </span>
                <h3 className="font-cinzel text-base text-espresso mb-3 leading-snug group-hover:text-accent-warm transition-colors duration-200">
                  {story.title}
                </h3>
                <p className="font-inter text-xs text-text-muted leading-relaxed mb-5 line-clamp-3">
                  {story.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <span className="font-inter text-[10px] text-text-light">{story.date}</span>
                  <span className="text-rule">·</span>
                  <span className="font-inter text-[10px] text-text-light">{story.readTime} read</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6 border-t border-rule bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-cinzel text-xl text-espresso mb-2">Stay in the loop</h2>
            <p className="font-inter text-sm text-text-muted max-w-sm">
              New stories every month. No noise, only the work that matters.
            </p>
          </div>
          <form className="flex gap-0 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-64 px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors"
            />
            <button type="submit"
              className="bg-espresso text-cream font-inter text-xs tracking-button uppercase px-5 py-3 hover:bg-accent-warm transition-colors duration-200 border border-espresso hover:border-accent-warm shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
