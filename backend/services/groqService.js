const Groq = require('groq-sdk');

class GroqCourseGenerator {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateCourseStructure(pdfContent, courseDetails) {
    console.log(`Processing PDF with ${pdfContent.length} characters`);
    
    try {
      // Always use comprehensive processing for proper scaling
      return await this.processComprehensivePdf(pdfContent, courseDetails);
    } catch (error) {
      console.error('Groq API Error:', error);
      return this.createFallbackContent(courseDetails);
    }
  }

  async processComprehensivePdf(pdfContent, courseDetails) {
    const { estimatedTime } = courseDetails;
    
    // FIXED: Proper calculation for sections and topics
    const sectionsCount = Math.max(4, Math.ceil((estimatedTime || 60) / 10)); // 10 minutes per section minimum
    const topicsPerSection = 4; // Always 4 topics per section for rich content
    const totalTopics = sectionsCount * topicsPerSection;
    
    console.log(`Course: ${estimatedTime} minutes → ${sectionsCount} sections → ${totalTopics} topics total`);
    
    // Split PDF into chunks for processing
    const chunks = this.chunkPdfContent(pdfContent, 4000); // Smaller chunks for better processing
    console.log(`Split PDF into ${chunks.length} chunks for ${sectionsCount} sections`);
    
    const sections = [];
    
    // Process each section with relevant content chunks
    for (let i = 0; i < sectionsCount; i++) {
      console.log(`Generating section ${i + 1}/${sectionsCount} with ${topicsPerSection} topics`);
      
      // Get relevant chunks for this section - distribute chunks evenly
      const startChunk = Math.floor((i * chunks.length) / sectionsCount);
      const endChunk = Math.floor(((i + 1) * chunks.length) / sectionsCount);
      const sectionContent = chunks.slice(startChunk, Math.max(startChunk + 1, endChunk)).join('\n\n');
      
      const sectionPrompt = this.buildSectionPrompt(sectionContent, courseDetails, i + 1, sectionsCount, topicsPerSection);
      
      try {
        const completion = await this.groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert course designer. Create detailed educational content with exactly the requested number of topics. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: sectionPrompt
            }
          ],
          model: "llama3-8b-8192",
          temperature: 0.7,
          max_tokens: 3000 // Increased for more content
        });

        const response = completion.choices[0]?.message?.content;
        const sectionData = this.parseSectionResponse(response, i + 1);
        
        if (sectionData && sectionData.children && sectionData.children.length >= topicsPerSection) {
          sections.push(sectionData);
        } else {
          // Ensure we always get the right number of topics
          console.log(`Section ${i + 1} didn't generate enough topics, using enhanced fallback`);
          sections.push(this.createEnhancedFallbackSection(i + 1, courseDetails, sectionContent, topicsPerSection));
        }
        
        // Small delay to avoid rate limiting
        await this.delay(800);
      } catch (error) {
        console.error(`Error generating section ${i + 1}:`, error);
        sections.push(this.createEnhancedFallbackSection(i + 1, courseDetails, sectionContent, topicsPerSection));
      }
    }
    
    return this.enhanceWithMultimedia(sections);
  }

  chunkPdfContent(content, chunkSize = 4000) {
    const chunks = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let currentChunk = '';
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += '. ' + sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    // Ensure we have enough chunks
    while (chunks.length < 8) {
      chunks.push(...chunks);
    }
    
    return chunks.slice(0, 20); // Max 20 chunks for processing
  }

  buildSectionPrompt(content, courseDetails, sectionNumber, totalSections, topicsPerSection) {
    const { title, category, estimatedTime } = courseDetails;
    const sectionTime = Math.ceil((estimatedTime || 60) / totalSections);
    const topicTime = Math.ceil(sectionTime / topicsPerSection);
    
    return `
Create a detailed section for an educational course based on this content:

SECTION INFO:
- Section ${sectionNumber} of ${totalSections}
- Course: ${title || 'Educational Course'}
- Category: ${category || 'General'}
- Section Duration: ${sectionTime} minutes
- MUST CREATE EXACTLY ${topicsPerSection} TOPICS
- Each topic: ${topicTime} minutes

CONTENT TO ANALYZE:
${content}

CRITICAL: You MUST create exactly ${topicsPerSection} topics. Extract different concepts from the content for each topic.

RESPOND WITH VALID JSON ONLY - NO MARKDOWN:

{
  "id": "section-${sectionNumber}",
  "title": "Section ${sectionNumber}: [Descriptive Title from Content]",
  "type": "section",
  "estimatedTime": ${sectionTime},
  "children": [
    {
      "id": "topic-${sectionNumber}-1",
      "title": "Topic 1: [Concept from Content]",
      "type": "topic",
      "estimatedTime": ${topicTime},
      "content": "<h3>Topic Title</h3><p>Detailed explanation from the content...</p><ul><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul><p>More detailed explanations with examples...</p><h4>Key Takeaways:</h4><ul><li>Important concept 1</li><li>Important concept 2</li></ul>",
      "videoUrls": ["${category || 'education'} tutorial", "${category || 'learning'} explained"],
      "imageUrls": ["${category || 'education'} concept", "${category || 'learning'} diagram"],
      "mermaid": "graph TD; A[Start] --> B[Concept]; B --> C[Application]; C --> D[Result];",
      "quiz": {
        "questions": [
          {
            "question": "What is the main concept discussed in this topic?",
            "type": "mcq",
            "options": ["Option A based on content", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Detailed explanation based on the content"
          }
        ],
        "difficulty": "basic"
      }
    },
    {
      "id": "topic-${sectionNumber}-2",
      "title": "Topic 2: [Another Concept from Content]",
      "type": "topic",
      "estimatedTime": ${topicTime},
      "content": "<h3>Second Topic</h3><p>Different aspect from the content...</p><ul><li>New key point 1</li><li>New key point 2</li></ul>",
      "videoUrls": ["${category || 'education'} fundamentals", "${category || 'learning'} basics"],
      "imageUrls": ["${category || 'education'} examples", "${category || 'study'} methods"],
      "mermaid": "graph TD; A[Input] --> B[Process]; B --> C[Output];",
      "quiz": {
        "questions": [
          {
            "question": "What is covered in this second topic?",
            "type": "mcq",
            "options": ["Second concept", "First concept repeat", "Unrelated topic", "None of above"],
            "correctAnswer": 0,
            "explanation": "This topic covers the second main concept from the content"
          }
        ],
        "difficulty": "basic"
      }
    },
    {
      "id": "topic-${sectionNumber}-3",
      "title": "Topic 3: [Third Concept from Content]",
      "type": "topic",
      "estimatedTime": ${topicTime},
      "content": "<h3>Third Topic</h3><p>Advanced concepts from the content...</p><ul><li>Advanced point 1</li><li>Advanced point 2</li></ul>",
      "videoUrls": ["${category || 'education'} advanced", "${category || 'learning'} deep dive"],
      "imageUrls": ["${category || 'education'} advanced", "${category || 'research'} methods"],
      "mermaid": "graph TD; A[Theory] --> B[Practice]; B --> C[Mastery];",
      "quiz": {
        "questions": [
          {
            "question": "What advanced concept is discussed here?",
            "type": "mcq",
            "options": ["Advanced application", "Basic concept", "Introduction only", "Summary"],
            "correctAnswer": 0,
            "explanation": "This topic focuses on advanced applications of the concepts"
          }
        ],
        "difficulty": "intermediate"
      }
    },
    {
      "id": "topic-${sectionNumber}-4",
      "title": "Topic 4: [Fourth Concept/Application from Content]",
      "type": "topic",
      "estimatedTime": ${topicTime},
      "content": "<h3>Fourth Topic</h3><p>Practical applications from the content...</p><ul><li>Application 1</li><li>Application 2</li></ul>",
      "videoUrls": ["${category || 'education'} applications", "${category || 'learning'} practice"],
      "imageUrls": ["${category || 'education'} practical", "${category || 'implementation'} guide"],
      "mermaid": "graph TD; A[Knowledge] --> B[Application]; B --> C[Success];",
      "quiz": {
        "questions": [
          {
            "question": "How can you apply these concepts practically?",
            "type": "mcq",
            "options": ["Through hands-on practice", "Only theory study", "Memorization", "Ignore applications"],
            "correctAnswer": 0,
            "explanation": "Practical application through hands-on practice is the best approach"
          }
        ],
        "difficulty": "intermediate"
      }
    }
  ]
}
`;
  }

  createEnhancedFallbackSection(sectionNumber, courseDetails, content, topicsPerSection) {
    const { title, category, estimatedTime } = courseDetails;
    const totalSections = Math.max(4, Math.ceil((estimatedTime || 60) / 10));
    const sectionTime = Math.ceil((estimatedTime || 60) / totalSections);
    const topicTime = Math.ceil(sectionTime / topicsPerSection);
    
    // Extract different parts of content for different topics
    const contentParts = content.split('\n').filter(part => part.trim().length > 50);
    
    const topics = [];
    for (let i = 0; i < topicsPerSection; i++) {
      const topicContent = contentParts[i % contentParts.length] || `Content for topic ${i + 1}`;
      const topicKeywords = this.extractKeywords(topicContent);
      
      topics.push({
        id: `topic-${sectionNumber}-${i + 1}`,
        title: `${topicKeywords || `Topic ${i + 1}`} - Section ${sectionNumber}`,
        type: 'topic',
        estimatedTime: topicTime,
        content: `<h3>${topicKeywords || `Topic ${i + 1}`}</h3><p>Based on the content: ${topicContent.substring(0, 300)}...</p><ul><li>Key concept ${i + 1}</li><li>Important detail ${i + 1}</li><li>Practical application ${i + 1}</li></ul><p>This topic explores the essential aspects of the subject matter and provides practical insights for better understanding.</p>`,
        videoUrls: this.enhanceVideoUrls([], `${category || 'education'} topic ${i + 1}`),
        imageUrls: this.enhanceImageUrls([], `${category || 'education'} concept ${i + 1}`),
        mermaid: this.generateDefaultMermaid(`Topic ${i + 1} ${topicKeywords}`),
        quiz: {
          questions: [
            {
              question: `What is the main focus of topic ${i + 1} in section ${sectionNumber}?`,
              type: "mcq",
              options: [
                `Understanding ${topicKeywords || 'the concept'}`,
                "Unrelated information",
                "Previous section content",
                "Next section preview"
              ],
              correctAnswer: 0,
              explanation: `Topic ${i + 1} focuses on understanding ${topicKeywords || 'the key concepts'} presented in this section.`
            }
          ],
          difficulty: i < 2 ? 'basic' : 'intermediate'
        }
      });
    }

    return {
      id: `section-${sectionNumber}`,
      title: `Section ${sectionNumber}: ${title || 'Course Content'} - Part ${sectionNumber}`,
      type: 'section',
      estimatedTime: sectionTime,
      children: topics
    };
  }

  parseSectionResponse(response, sectionNumber) {
    try {
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\n?/gi, '').replace(/```\n?/gi, '');
      cleanResponse = cleanResponse.replace(/```\n?/gi, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonContent = cleanResponse.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonContent);
        
        // Validate and ensure we have enough topics
        if (parsed && parsed.id && parsed.title && parsed.children && parsed.children.length >= 3) {
          console.log(`Section ${sectionNumber} parsed successfully with ${parsed.children.length} topics`);
          return parsed;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error parsing section ${sectionNumber} response:`, error);
      return null;
    }
  }

  parseGroqResponse(response) {
    try {
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\n?/gi, '').replace(/```\n?/gi, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonContent = cleanResponse.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonContent);
        const sections = parsed.sections || [];
        
        if (sections.length === 0) {
          console.log('No sections found, using fallback');
          return this.createFallbackContent();
        }
        
        return this.enhanceWithMultimedia(sections);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing Groq response:', error);
      console.log('Using fallback content generation');
      return this.createFallbackContent();
    }
  }

  enhanceWithMultimedia(sections) {
    return sections.map((section, sectionIndex) => ({
      ...section,
      id: section.id || `section-${sectionIndex + 1}`,
      title: section.title || `Section ${sectionIndex + 1}`,
      type: section.type || 'section',
      estimatedTime: section.estimatedTime || 10,
      children: (section.children || []).map((topic, topicIndex) => ({
        ...topic,
        id: topic.id || `topic-${sectionIndex + 1}-${topicIndex + 1}`,
        title: topic.title || `Topic ${topicIndex + 1}`,
        type: topic.type || 'topic',
        estimatedTime: topic.estimatedTime || 5,
        content: topic.content || `<h3>${topic.title}</h3><p>Content for this topic.</p>`,
        videoUrls: this.enhanceVideoUrls(topic.videoUrls || [], topic.title),
        imageUrls: this.enhanceImageUrls(topic.imageUrls || [], topic.title),
        mermaid: topic.mermaid || this.generateDefaultMermaid(topic.title),
        quiz: {
          questions: topic.quiz?.questions || this.generateDefaultQuiz(topic.title),
          difficulty: topic.quiz?.difficulty || 'basic'
        }
      }))
    }));
  }

  enhanceVideoUrls(searchTerms, topicTitle) {
    // Real educational YouTube videos
    const educationalVideos = [
      'https://youtu.be/pDX4NR4eY3A?feature=shared',
      'https://youtu.be/DM2lAomoDrg?feature=shared',
      'https://youtu.be/rZxETdO_KUQ?feature=shared',
      'https://youtu.be/mf_PbWPo7VM?feature=shared',
      'https://youtu.be/jxENwUU9j7w?feature=shared'
    ];
    
    // Return 1 random educational videos
    const shuffled = educationalVideos.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 1);
  }

  enhanceImageUrls(imageKeywords, topicTitle) {
  // Extract relevant keywords from the topic title
  const keywords = this.extractTopicKeywords(topicTitle);
  
  // Use Unsplash Source API with topic-specific keywords
  const baseUrl = 'https://source.unsplash.com/800x600/?';
  
  // Create multiple variations with different keywords
  const imageUrls = [
    `${baseUrl}${keywords.primary}`,
    `${baseUrl}${keywords.secondary}`,
  ];
  
  return imageUrls;
}

extractTopicKeywords(topicTitle) {
  // Remove common words and extract meaningful keywords
  const commonWords = ['topic', 'section', 'introduction', 'part', 'chapter', 'lesson'];
  const words = topicTitle.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  // Create primary and secondary keyword combinations
  const primary = words.slice(0, 2).join('+') || 'education';
  const secondary = words.length > 2 ? words.slice(1, 3).join('+') : words.join('+') + '+learning';
  
  return {
    primary,
    secondary: secondary || 'study+guide'
  };
}

  generateDefaultMermaid(topicTitle) {
    const keywords = this.extractKeywords(topicTitle);
    const words = keywords.split(' ').filter(w => w.length > 3);
    
    if (words.length >= 3) {
      return `graph TD; A[${words[0]}] --> B[${words[1]}]; B --> C[${words[2]}]; C --> D[Application];`;
    } else if (words.length >= 2) {
      return `graph TD; A[${words[0]}] --> B[${words[1]}]; B --> C[Implementation]; C --> D[Success];`;
    } else {
      return `graph TD; A[Start] --> B[Learn]; B --> C[Practice]; C --> D[Master]; D --> E[Apply];`;
    }
  }

  generateDefaultQuiz(topicTitle) {
    return [
      {
        question: `What is the main concept discussed in "${topicTitle}"?`,
        type: "mcq",
        options: [
          "The primary learning objective",
          "A secondary concept",
          "An unrelated topic",
          "A prerequisite skill"
        ],
        correctAnswer: 0,
        explanation: `The main concept focuses on the core learning objective of ${topicTitle}.`
      }
    ];
  }

  extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    return words.slice(0, 3).join(' ') || 'education learning';
  }

  createFallbackContent(courseDetails = {}) {
    const title = courseDetails?.title || 'Course Introduction';
    const estimatedTime = courseDetails?.estimatedTime || 60;
    const sectionsCount = Math.max(4, Math.ceil(estimatedTime / 10)); // FIXED: More sections for longer courses
    
    console.log(`Creating fallback: ${estimatedTime} minutes → ${sectionsCount} sections`);
    
    return Array.from({ length: sectionsCount }, (_, i) => 
      this.createEnhancedFallbackSection(i + 1, courseDetails, "Sample educational content for comprehensive learning.", 4)
    );
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = GroqCourseGenerator;