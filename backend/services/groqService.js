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
      const prompt = this.buildCoursePrompt(pdfContent, courseDetails);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert course designer. Create structured, engaging educational content with multimedia integration. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192", // Fast and reliable model
        temperature: 0.7,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      // console.log('Groq API Response:', response);
      
      return this.parseGroqResponse(response);
    } catch (error) {
      console.error('Groq API Error:', error);
      return this.createFallbackContent(courseDetails);
    }
  }

  buildCoursePrompt(pdfContent, courseDetails) {
    const { title, description, category, language, estimatedTime } = courseDetails;
    const sectionsCount = Math.ceil((estimatedTime || 60) / 20);
    
    return `
Create a comprehensive course structure from this PDF content:

COURSE INFO:
- Title: ${title || 'Untitled Course'}
- Category: ${category || 'General'}
- Duration: ${estimatedTime || 60} minutes
- Language: ${language || 'English'}
- Sections needed: ${sectionsCount}

PDF CONTENT:
${pdfContent.substring(0, 8000)}

REQUIREMENTS:
1. Create exactly ${sectionsCount} sections (20 minutes each)
2. Each section should have 2-3 topics (5-7 minutes per topic)
3. Extract key concepts from the PDF content
4. Create engaging HTML content for each topic
5. Include relevant video search terms
6. Add image keywords for visuals
7. Create quiz questions for learning assessment

RESPOND WITH VALID JSON ONLY (no markdown, no extra text):

{
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title from PDF Content",
      "type": "section",
      "estimatedTime": 20,
      "children": [
        {
          "id": "topic-1-1",
          "title": "Topic Title from PDF",
          "type": "topic",
          "estimatedTime": 7,
          "content": "<h3>Topic Title</h3><p>Detailed content from PDF in HTML format with proper structure...</p><ul><li>Key point 1</li><li>Key point 2</li></ul>",
          "videoUrls": ["topic search term 1", "topic search term 2"],
          "imageUrls": ["image keyword 1", "image keyword 2"],
          "mermaid": "graph TD; A[Concept1] --> B[Concept2]; B --> C[Result];",
          "quiz": {
            "questions": [
              {
                "question": "Based on the content, what is...?",
                "type": "mcq",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0,
                "explanation": "Explanation based on PDF content"
              }
            ],
            "difficulty": "basic"
          }
        }
      ]
    }
  ]
}
`;
  }

  parseGroqResponse(response) {
    try {
      // Clean the response
      let cleanResponse = response.trim();
      
      // Remove any markdown formatting
      cleanResponse = cleanResponse.replace(/```json\n?/gi, '').replace(/```\n?/gi, '');
      
      // Find JSON boundaries
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonContent = cleanResponse.substring(jsonStart, jsonEnd);
        // console.log('Extracted JSON:', jsonContent.substring(0, 500) + '...');
        
        const parsed = JSON.parse(jsonContent);
        const sections = parsed.sections || [];
        
        if (sections.length === 0) {
          console.log('No sections found, using fallback');
          return this.createFallbackContent();
        }
        
        // Validate and enhance the structure
        return this.validateAndEnhanceContent(sections);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing Groq response:', error);
      console.log('Using fallback content generation');
      return this.createFallbackContent();
    }
  }

  validateAndEnhanceContent(sections) {
    return sections.map((section, sectionIndex) => ({
      id: section.id || `section-${sectionIndex + 1}`,
      title: section.title || `Section ${sectionIndex + 1}`,
      type: section.type || 'section',
      estimatedTime: section.estimatedTime || 20,
      children: (section.children || []).map((topic, topicIndex) => ({
        id: topic.id || `topic-${sectionIndex + 1}-${topicIndex + 1}`,
        title: topic.title || `Topic ${topicIndex + 1}`,
        type: topic.type || 'topic',
        estimatedTime: topic.estimatedTime || 7,
        content: topic.content || `<h3>${topic.title}</h3><p>Content for this topic.</p>`,
        videoUrls: this.enhanceVideoUrls(topic.videoUrls || [], topic.title),
        imageUrls: this.enhanceImageUrls(topic.imageUrls || [], topic.title),
        mermaid: topic.mermaid || '',
        quiz: {
          questions: topic.quiz?.questions || [],
          difficulty: topic.quiz?.difficulty || 'basic'
        }
      }))
    }));
  }

  enhanceVideoUrls(searchTerms, topicTitle) {
    if (!searchTerms || searchTerms.length === 0) {
      const keywords = this.extractKeywords(topicTitle);
      searchTerms = [keywords + ' tutorial', keywords + ' explained'];
    }
    
    return searchTerms.slice(0, 2).map(term => 
      `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`
    );
  }

  enhanceImageUrls(imageKeywords, topicTitle) {
    if (!imageKeywords || imageKeywords.length === 0) {
      const keywords = this.extractKeywords(topicTitle);
      imageKeywords = [keywords, 'education ' + keywords];
    }
    
    return imageKeywords.slice(0, 2).map(keyword => 
      `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`
    );
  }

  extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    return words.slice(0, 3).join(' ');
  }

  createFallbackContent(courseDetails = {}) {
    const title = courseDetails?.title || 'Course Introduction';
    const estimatedTime = courseDetails?.estimatedTime || 60;
    const sectionsCount = Math.ceil(estimatedTime / 20);
    
    return Array.from({ length: sectionsCount }, (_, i) => ({
      id: `section-${i + 1}`,
      title: `Section ${i + 1}: ${title} - Part ${i + 1}`,
      type: 'section',
      estimatedTime: Math.ceil(estimatedTime / sectionsCount),
      children: [
        {
          id: `topic-${i + 1}-1`,
          title: `Introduction to Topic ${i + 1}`,
          type: 'topic',
          estimatedTime: 10,
          content: `<h3>Introduction to Topic ${i + 1}</h3><p>This section covers the fundamental concepts that you'll learn in this part of the course.</p><p>Key learning objectives:</p><ul><li>Understand the core concepts</li><li>Apply the knowledge practically</li><li>Build confidence in the subject</li></ul>`,
          videoUrls: [
            'https://www.youtube.com/results?search_query=introduction+tutorial',
            'https://www.youtube.com/results?search_query=basics+explained'
          ],
          imageUrls: [
            'https://source.unsplash.com/800x600/?education,learning',
            'https://source.unsplash.com/800x600/?study,books'
          ],
          mermaid: 'graph TD; A[Start] --> B[Learn]; B --> C[Practice]; C --> D[Master];',
          quiz: {
            questions: [
              {
                question: "What is the main focus of this topic?",
                type: "mcq",
                options: [
                  "Learning fundamental concepts",
                  "Advanced techniques only",
                  "Just memorizing facts",
                  "Skipping the basics"
                ],
                correctAnswer: 0,
                explanation: "This topic focuses on building a strong foundation with fundamental concepts."
              }
            ],
            difficulty: 'basic'
          }
        },
        {
          id: `topic-${i + 1}-2`,
          title: `Practical Applications ${i + 1}`,
          type: 'topic',
          estimatedTime: 10,
          content: `<h3>Practical Applications</h3><p>Now let's explore how to apply what you've learned in real-world scenarios.</p><p>This section includes:</p><ul><li>Hands-on examples</li><li>Step-by-step guidance</li><li>Common use cases</li></ul>`,
          videoUrls: [
            'https://www.youtube.com/results?search_query=practical+examples+tutorial',
            'https://www.youtube.com/results?search_query=hands+on+learning'
          ],
          imageUrls: [
            'https://source.unsplash.com/800x600/?practice,application',
            'https://source.unsplash.com/800x600/?hands+on,learning'
          ],
          mermaid: 'graph TD; A[Theory] --> B[Practice]; B --> C[Application]; C --> D[Mastery];',
          quiz: {
            questions: [
              {
                question: "What is the best way to master new concepts?",
                type: "mcq",
                options: [
                  "Practice and application",
                  "Just reading theory",
                  "Memorizing definitions",
                  "Avoiding challenges"
                ],
                correctAnswer: 0,
                explanation: "Practice and real-world application are key to mastering new concepts."
              }
            ],
            difficulty: 'intermediate'
          }
        }
      ]
    }));
  }
}

module.exports = GroqCourseGenerator;