import fs from 'fs';
import path from 'path';

const chunksDir = './scripts/data-chunks';
const outputFile = './scripts/seed-data.json';

const merge = () => {
  const files = fs.readdirSync(chunksDir).filter(f => f.startsWith('chunk-') && f.endsWith('.json')).sort((a, b) => {
    const numA = parseInt(a.split('-')[1].split('.')[0]);
    const numB = parseInt(b.split('-')[1].split('.')[0]);
    return numA - numB;
  });

  const allData: any[] = [];
  files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(chunksDir, file), 'utf-8'));
    content.forEach((topic: any) => {
      const existing = allData.find(t => t.topicSlug === topic.topicSlug);
      if (existing) {
        existing.questions.push(...topic.questions);
      } else {
        allData.push(topic);
      }
    });
  });

  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`Merged ${files.length} chunks into ${outputFile}`);
  console.log(`Total topics: ${allData.length}`);
};

merge();
