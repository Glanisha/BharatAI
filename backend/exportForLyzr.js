const mongoose = require('mongoose');
const Course = require('./models/Course');
const fs = require('fs');
require('dotenv').config();

const exportData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const courses = await Course.find({}).lean();
    
    // Format for Lyzr
    const lyzrData = courses.map(course => {
      const topics = [];
      const extractTopics = (nodes) => {
        for (const node of nodes || []) {
          if (node.type === 'topic') {
            topics.push({
              title: node.title,
              content: node.content
            });
          }
          if (node.children) extractTopics(node.children);
        }
      };
      extractTopics(course.contentTree);
      
      return {
        course_id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        language: course.language,
        topics: topics,
        full_content: topics.map(t => `${t.title}: ${t.content}`).join('\n\n')
      };
    });
    
    // Save as JSON
    fs.writeFileSync('./bharatai_courses.json', JSON.stringify(lyzrData, null, 2));
    
    // Save as text for Knowledge Base
    const textContent = lyzrData.map(course => 
      `Course: ${course.title}\nDescription: ${course.description}\nCategory: ${course.category}\n\nContent:\n${course.full_content}\n\n---\n\n`
    ).join('');
    
    fs.writeFileSync('./bharatai_knowledge.txt', textContent);
    
    console.log('✅ Data exported successfully!');
    console.log('Files created:');
    console.log('- bharatai_courses.json (for API)');
    console.log('- bharatai_knowledge.txt (for Knowledge Base upload)');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Export failed:', error);
  }
};

exportData();