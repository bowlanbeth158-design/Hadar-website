export type FaqItem = {
  question: string;
  answer: string;
};

export function parseFaq(markdown: string): FaqItem[] {
  const blocks = markdown.split(/^## /m).filter(Boolean);
  return blocks.map((block) => {
    const [firstLine = '', ...rest] = block.split('\n');
    return {
      question: firstLine.trim(),
      answer: rest.join('\n').trim(),
    };
  });
}
