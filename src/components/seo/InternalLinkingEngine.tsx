import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { generateSlug } from '../../lib/blogService';

interface InternalLinkingEngineProps {
  text: string;
  currentCategory: string;
  categories: string[];
}

export default function InternalLinkingEngine({ text, currentCategory, categories }: InternalLinkingEngineProps) {
  const content = useMemo(() => {
    if (!text) return null;

    // Filter out the current category, we don't want to link to ourselves
    // Sort by length descending so we match longer category names first
    const validCategories = categories
      .filter(c => c.toLowerCase() !== currentCategory.toLowerCase())
      .sort((a, b) => b.length - a.length);

    let currentText = text;
    let linksAdded = 0;
    const maxLinks = 2;
    
    // We will build an array of string segments and React nodes
    // but since replace with string -> string is easier for pure regex,
    // we'll use a tokenization approach to safely inject React <Link> elements.
    
    const tokens: React.ReactNode[] = [];
    let remainingText = text;

    for (const cat of validCategories) {
      if (linksAdded >= maxLinks) break;

      // Find the category in the text (case-insensitive, whole word if possible)
      // We escape the category name for regex
      const escapedCat = cat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedCat})\\b`, 'i');
      
      const match = regex.exec(remainingText);
      if (match) {
        const matchedText = match[1];
        const matchIndex = match.index;
        
        // Push the text before the match
        if (matchIndex > 0) {
          tokens.push(remainingText.substring(0, matchIndex));
        }
        
        // Push the link
        const slug = generateSlug(cat);
        tokens.push(
          <Link 
            key={`link-${slug}-${linksAdded}`} 
            to={`/category/${slug}`}
            className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-200 underline-offset-2 transition-colors"
            title={`Browse ${cat} products`}
          >
            {matchedText}
          </Link>
        );
        
        // Update remaining text
        remainingText = remainingText.substring(matchIndex + matchedText.length);
        linksAdded++;
      }
    }

    // Push whatever is left
    if (remainingText) {
      tokens.push(remainingText);
    }

    return tokens.length > 0 ? tokens : text;
  }, [text, currentCategory, categories]);

  return <>{content}</>;
}
