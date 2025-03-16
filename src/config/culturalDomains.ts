/**
 * Configuration file defining Black cultural domains to track
 */

export interface KeywordCategory {
    name: string;
    keywords: string[];
    description: string;
  }
  
  export interface CulturalDomain {
    id: string;
    name: string;
    description: string;
    categories: KeywordCategory[];
    importance: number; // 1-10 scale for prioritization
  }
  
  export const culturalDomains: CulturalDomain[] = [
    {
      id: 'music',
      name: 'Music',
      description: 'Black musical traditions, genres, artists, and cultural impact',
      importance: 9,
      categories: [
        {
          name: 'Hip-Hop/Rap',
          keywords: ['hip-hop', 'rap', 'rapper', 'MC', 'beatboxing', 'sampling'],
          description: 'Hip-hop culture and rap music'
        },
        {
          name: 'Jazz',
          keywords: ['jazz', 'bebop', 'swing', 'improvisation', 'blues'],
          description: 'Jazz tradition and its evolution'
        },
        {
          name: 'R&B/Soul',
          keywords: ['r&b', 'rhythm and blues', 'soul', 'neo-soul', 'motown'],
          description: 'R&B and soul music traditions'
        },
        {
          name: 'Gospel',
          keywords: ['gospel', 'spiritual', 'church music', 'choir'],
          description: 'Religious and spiritual music traditions'
        }
      ]
    },
    {
      id: 'activism',
      name: 'Social Justice & Activism',
      description: 'Black liberation movements, civil rights, and social justice work',
      importance: 10,
      categories: [
        {
          name: 'Civil Rights',
          keywords: ['civil rights', 'voting rights', 'desegregation', 'equality'],
          description: 'Civil rights movement and ongoing work'
        },
        {
          name: 'Black Liberation',
          keywords: ['black power', 'liberation', 'self-determination', 'freedom'],
          description: 'Black liberation philosophies and movements'
        },
        {
          name: 'Contemporary Movements',
          keywords: ['black lives matter', 'BLM', 'say her name', 'police reform'],
          description: 'Modern social justice movements'
        }
      ]
    },
    {
      id: 'language',
      name: 'Language & Expression',
      description: 'Black vernacular, linguistic innovations, and communication styles',
      importance: 8,
      categories: [
        {
          name: 'AAVE',
          keywords: ['aave', 'ebonics', 'black english', 'vernacular'],
          description: 'African American Vernacular English'
        },
        {
          name: 'Slang & Terminology',
          keywords: ['slang', 'hood', 'culture', 'lingo', 'terminology'],
          description: 'Evolving slang and cultural terminology'
        }
      ]
    },
    {
      id: 'arts',
      name: 'Arts & Literature',
      description: 'Visual arts, literature, poetry, and creative expression',
      importance: 8,
      categories: [
        {
          name: 'Literature',
          keywords: ['literature', 'novel', 'poetry', 'author', 'writer'],
          description: 'Black literature and literary traditions'
        },
        {
          name: 'Visual Arts',
          keywords: ['art', 'painting', 'sculpture', 'exhibition', 'gallery'],
          description: 'Visual arts and artistic movements'
        }
      ]
    },
    {
      id: 'innovation',
      name: 'Innovation & Technology',
      description: 'Black contributions to technology, science, and innovation',
      importance: 7,
      categories: [
        {
          name: 'Tech Pioneers',
          keywords: ['technology', 'innovation', 'startup', 'entrepreneur', 'inventor'],
          description: 'Black innovators and technology pioneers'
        },
        {
          name: 'STEM',
          keywords: ['science', 'technology', 'engineering', 'mathematics', 'research'],
          description: 'Contributions to STEM fields'
        }
      ]
    }
  ];
  
  export default culturalDomains;