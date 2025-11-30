import React, { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const SHOWCASE_INPUTS = [
  'alice@company.com',
  'developer-42',
  'octocat',
  'hello-world',
  'quantum-user',
  'fractal-fan',
];

const PALETTE_STYLES = ['random', 'fire', 'ocean', 'forest', 'sunset', 'neon', 'pastel', 'rainbow'];

// Animated logo that crossfades between random fracticons
function AnimatedLogo({ fracticons }: { fracticons: any }) {
  const [images, setImages] = useState<[string, string]>(['', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const generateRandomFracticon = useCallback(() => {
    if (!fracticons) return '';
    const randomInput = `logo-${Date.now()}-${Math.random()}`;
    const palette = PALETTE_STYLES[Math.floor(Math.random() * PALETTE_STYLES.length)];
    // Library now accepts strings directly - no need to hash first!
    return fracticons.generateFracticonDataURL(randomInput, { 
      circular: true, 
      size: 64,
      paletteStyle: palette 
    });
  }, [fracticons]);

  useEffect(() => {
    if (!fracticons) return;

    // Generate initial fracticons for both slots
    setImages([generateRandomFracticon(), generateRandomFracticon()]);

    // Set up interval to crossfade between fracticons
    const interval = setInterval(() => {
      // First, generate the new image for the slot that's currently hidden
      const currentActive = activeIndexRef.current;
      const hiddenSlot = currentActive === 0 ? 1 : 0;
      
      // Generate new fracticon
      const newUrl = generateRandomFracticon();
      
      // Update the hidden slot with the new image
      setImages(prev => {
        const updated: [string, string] = [...prev] as [string, string];
        updated[hiddenSlot] = newUrl;
        return updated;
      });
      
      // Wait a tiny bit for the image to load, then trigger the crossfade
      setTimeout(() => {
        // Update both ref and state
        activeIndexRef.current = hiddenSlot;
        setActiveIndex(hiddenSlot);
      }, 50);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [fracticons, generateRandomFracticon]);

  if (!images[0]) {
    return <span className={styles.logoPlaceholder}>🌀</span>;
  }

  return (
    <span className={styles.animatedLogo}>
      <img 
        src={images[0]} 
        alt="" 
        className={`${styles.logoImage} ${activeIndex === 0 ? styles.logoActive : ''}`}
      />
      <img 
        src={images[1]} 
        alt="" 
        className={`${styles.logoImage} ${activeIndex === 1 ? styles.logoActive : ''}`}
      />
    </span>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [avatars, setAvatars] = useState<string[]>([]);
  const [fracticons, setFracticons] = useState<any>(null);

  useEffect(() => {
    async function loadAndGenerate() {
      try {
        const lib = await import('fracticons');
        setFracticons(lib);
        
        // Library accepts strings directly - no need to hash first!
        const results = SHOWCASE_INPUTS.map((input) => 
          lib.generateFracticonDataURL(input, { circular: true, size: 128 })
        );
        setAvatars(results);
      } catch (e) {
        console.error('Failed to load fracticons:', e);
      }
    }
    loadAndGenerate();
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            <AnimatedLogo fracticons={fracticons} /> {siteConfig.title}
          </h1>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <p className={styles.description}>
            Generate unique, deterministic avatars powered by Julia set fractals. 
            Perfect for user profiles, placeholder images, or anywhere you need beautiful, 
            consistent visual identifiers.
          </p>
          <div className={styles.buttons}>
            <Link className={styles.primaryBtn} to="/docs/quickstart">
              Get Started →
            </Link>
            <Link className={styles.secondaryBtn} to="/demo">
              Live Demo
            </Link>
          </div>
        </div>
        
        <div className={styles.heroAvatars}>
          {avatars.length > 0 ? avatars.map((url, i) => (
            <img 
              key={i}
              src={url} 
              alt={`Sample avatar ${i + 1}`}
              className={styles.avatar}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          )) : (
            // Placeholder while loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.avatarPlaceholder} style={{ animationDelay: `${i * 0.1}s` }} />
            ))
          )}
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    emoji: '⚡',
    title: 'Lightning Fast',
    description: 'Generates 128px avatars in ~3ms. No external API calls, no network latency.',
  },
  {
    emoji: '🔒',
    title: 'Deterministic',
    description: 'Same input always produces the exact same avatar. Perfect for caching and consistency.',
  },
  {
    emoji: '🎨',
    title: '10 Color Palettes',
    description: 'Choose from fire, ocean, neon, pastel, and more. Or let it generate harmonious colors.',
  },
  {
    emoji: '📦',
    title: 'Zero Dependencies',
    description: 'Pure TypeScript with a custom PNG encoder. Works in Node.js, browsers, and edge runtimes.',
  },
  {
    emoji: '🖼️',
    title: 'Native PNG Output',
    description: 'Generates PNG images without Canvas API. Returns data URLs ready for img tags.',
  },
  {
    emoji: '🌀',
    title: 'Real Fractals',
    description: 'Based on Julia sets—mathematical fractals that create infinitely complex, unique patterns.',
  },
];

function Features() {
  return (
    <section className={styles.features}>
      <h2 className={styles.featuresTitle}>Why Fracticons?</h2>
      <div className={styles.featuresGrid}>
        {features.map((feature, i) => (
          <div key={i} className={styles.feature}>
            <span className={styles.featureEmoji}>{feature.emoji}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CodeExample() {
  return (
    <section className={styles.codeSection}>
      <h2>Simple to Use</h2>
      <p className={styles.codeSubtitle}>Just two lines of code to generate beautiful avatars</p>
      <div className={styles.codeBlock}>
        <pre>
          <code>{`import { generateFracticonDataURL } from 'fracticons';

// Generate avatar from any string (email, user ID, etc.)
const avatar = generateFracticonDataURL('user@example.com');

// Use directly in an <img> tag
document.getElementById('avatar').src = avatar;`}</code>
        </pre>
      </div>
      <div className={styles.installBlock}>
        <code>npm install fracticons</code>
      </div>
    </section>
  );
}

export default function Home(): React.ReactNode {
  return (
    <Layout
      title="Beautiful Fractal Avatars"
      description="Generate unique, deterministic fractal avatars from any string. Like Gravatar, but with beautiful Julia set fractals.">
      <HomepageHeader />
      <main>
        <Features />
        <CodeExample />
      </main>
    </Layout>
  );
}
