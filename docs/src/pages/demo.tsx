import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import styles from './demo.module.css';

// We'll use a CDN version or inline the library for the demo
// For now, we'll use the Web Crypto API to hash and inline fractal generation

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Sample inputs for the gallery
const SAMPLE_INPUTS = [
  'alice@example.com',
  'bob@example.com', 
  'charlie@example.com',
  'github:octocat',
  'hello-world',
  'fracticons-demo',
];

type PaletteStyle = 'random' | 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'pastel' | 'monochrome' | 'grayscale' | 'rainbow';

interface DemoOptions {
  circular: boolean;
  paletteStyle: PaletteStyle;
  size: number;
}

export default function Demo(): JSX.Element {
  const [input, setInput] = useState('');
  const [avatars, setAvatars] = useState<{input: string; hash: string; url: string}[]>([]);
  const [heroAvatar, setHeroAvatar] = useState<string>('');
  const [options, setOptions] = useState<DemoOptions>({
    circular: true,
    paletteStyle: 'random',
    size: 128,
  });
  const [fracticons, setFracticons] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load the library
  useEffect(() => {
    async function loadLibrary() {
      try {
        // Try to load from the built library (adjust path as needed)
        const lib = await import('fracticons');
        setFracticons(lib);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load fracticons:', e);
        setLoading(false);
      }
    }
    loadLibrary();
  }, []);

  // Generate gallery avatars
  useEffect(() => {
    if (!fracticons) return;
    
    async function generateGallery() {
      const results = await Promise.all(
        SAMPLE_INPUTS.map(async (input) => {
          const hash = await sha256(input);
          const url = fracticons.generateFracticonDataURL(hash, {
            circular: options.circular,
            paletteStyle: options.paletteStyle,
            size: options.size,
          });
          return { input, hash, url };
        })
      );
      setAvatars(results);
    }
    generateGallery();
  }, [fracticons, options]);

  // Generate hero avatar
  useEffect(() => {
    if (!fracticons) return;
    
    async function generateHero() {
      const hash = await sha256(input || 'fracticons');
      const url = fracticons.generateFracticonDataURL(hash, {
        circular: options.circular,
        paletteStyle: options.paletteStyle,
        size: 256,
      });
      setHeroAvatar(url);
    }
    generateHero();
  }, [fracticons, input, options]);

  const randomize = useCallback(async () => {
    if (!fracticons) return;
    
    const results = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const randomInput = `random-${Date.now()}-${i}-${Math.random()}`;
        const hash = await sha256(randomInput);
        const url = fracticons.generateFracticonDataURL(hash, {
          circular: options.circular,
          paletteStyle: options.paletteStyle,
          size: options.size,
        });
        return { input: `random-${i + 1}`, hash, url };
      })
    );
    setAvatars(results);
  }, [fracticons, options]);

  if (loading) {
    return (
      <Layout title="Demo" description="Try Fracticons live">
        <div className={styles.container}>
          <div className={styles.loading}>Loading Fracticons...</div>
        </div>
      </Layout>
    );
  }

  if (!fracticons) {
    return (
      <Layout title="Demo" description="Try Fracticons live">
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Library not loaded</h2>
            <p>The Fracticons library couldn't be loaded. Make sure it's built and installed.</p>
            <code>npm install fracticons</code>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Demo" description="Try Fracticons live">
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>🌀 Interactive Demo</h1>
          <p>Type anything below to see your unique fractal avatar</p>
          
          <div className={styles.heroContent}>
            <div className={styles.heroAvatar}>
              {heroAvatar && (
                <img 
                  src={heroAvatar} 
                  alt="Your avatar" 
                  className={options.circular ? styles.circular : ''}
                />
              )}
            </div>
            
            <div className={styles.heroInput}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your email, username, or any text..."
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.control}>
            <label>Shape</label>
            <select 
              value={options.circular ? 'circular' : 'square'}
              onChange={(e) => setOptions({...options, circular: e.target.value === 'circular'})}
            >
              <option value="circular">Circular</option>
              <option value="square">Square</option>
            </select>
          </div>
          
          <div className={styles.control}>
            <label>Palette</label>
            <select 
              value={options.paletteStyle}
              onChange={(e) => setOptions({...options, paletteStyle: e.target.value as PaletteStyle})}
            >
              <option value="random">🎨 Random</option>
              <option value="fire">🔥 Fire</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="forest">🌲 Forest</option>
              <option value="sunset">🌅 Sunset</option>
              <option value="neon">💡 Neon</option>
              <option value="pastel">🎀 Pastel</option>
              <option value="monochrome">⬛ Mono</option>
              <option value="grayscale">🔲 Gray</option>
              <option value="rainbow">🌈 Rainbow</option>
            </select>
          </div>
          
          <button onClick={randomize} className={styles.randomizeBtn}>
            🎲 Randomize
          </button>
        </div>

        <div className={styles.gallery}>
          {avatars.map(({ input, url }) => (
            <div key={input} className={styles.card}>
              <img 
                src={url} 
                alt={input}
                className={options.circular ? styles.circular : ''}
              />
              <span className={styles.label}>{input}</span>
            </div>
          ))}
        </div>

        <div className={styles.codeExample}>
          <h3>📋 Copy this code</h3>
          <pre>
            <code>{`import { generateFracticonDataURL } from 'fracticons';

const avatar = generateFracticonDataURL('${input || 'user@example.com'}', {
  circular: ${options.circular},
  paletteStyle: '${options.paletteStyle}',
});

// Use in an <img> tag
document.getElementById('avatar').src = avatar;`}</code>
          </pre>
        </div>
      </div>
    </Layout>
  );
}
