import crypto from 'crypto';

export function formatMarkdown(text: string): string {
    // Replace escaped characters and format the text for markdown
    let formattedData = text;
  
    // Replace escaped new line characters with actual new lines
    formattedData = formattedData.replace(/\\n/g, '\n');
  
    // Replace escaped quotation marks
    formattedData = formattedData.replace(/\\"/g, '"');
  
    // Handle backslashes for code blocks (escaped twice in JSON)
    formattedData = formattedData.replace(/\\\\/g, '\\');
  
    return formattedData;
}

export function generateGitSha(input: string): string {
  // Create a SHA-1 hash
  const hash = crypto.createHash('sha1');
  
  // Update the hash with input (could be anything like file content, commit message, etc.)
  hash.update(input);
  
  // Finalize the hash and return it as a hex string
  return hash.digest('hex');
}
