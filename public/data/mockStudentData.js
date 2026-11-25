/**
 * Realistic mock student profile data for demonstration, automated initial loading,
 * and UI evaluation of the PathIQ Student Learning Dashboard.
 */

export function getMockStudentData(refDate = new Date()) {
  const y = refDate.getFullYear();
  const m = String(refDate.getMonth() + 1).padStart(2, '0');

  // Realistic spread of active study days in the current calendar month
  const studyDays = {};
  const activeDays = [3, 7, 10, 14, 17, 21, 24];
  for (const day of activeDays) {
    const dd = String(day).padStart(2, '0');
    studyDays[`${y}-${m}-${dd}`] = true;
  }

  return {
    stage: 'college',
    weeklyHours: '10',
    // Active milestones checked across multiple domains (Tech, Govt/Exam, Portfolio, Data)
    completedSteps: {
      'tech-zero-cost::step-1': true,
      'tech-zero-cost::step-2': true,
      'career-after-12th::step-1': true,
      'portfolio-building::step-1': true,
      'portfolio-building::step-2': true,
      'data-analyst-free::step-1': true
    },
    // Top-tier 100% free learning resources saved to My Plan
    savedResourceIds: [
      'res-freecodecamp',
      'res-nsp-india',
      'res-swayam-nptel',
      'res-mdn-web',
      'res-openstax'
    ],
    studyDays,
    lastQuery: 'How do I start in tech with zero paid courses?',
    qaCache: {
      'tech::How do I start in tech with zero paid courses?': {
        cachedAt: Date.now() - 3600000,
        answer: {
          directAnswer:
            'You can enter software development with 0 paid courses by mastering HTML, CSS, JavaScript, and Git through verified free platforms like freeCodeCamp and MDN, then building and publishing 3 real projects on GitHub.',
          steps: [
            {
              title: 'Semantic Web Basics',
              detail: 'Complete the free Responsive Web Design certification on freeCodeCamp (100% free).'
            },
            {
              title: 'JavaScript Logic & DOM',
              detail: 'Practice vanilla JS daily: build a calculator, quiz app, and study tracker.'
            },
            {
              title: 'Git & Portfolio Hosting',
              detail: 'Publish your code to GitHub and host live demos on GitHub Pages or Vercel.'
            }
          ],
          practiceAction:
            'Open freeCodeCamp today and complete the first 5 interactive HTML challenges (15 minutes).'
        }
      }
    }
  };
}
