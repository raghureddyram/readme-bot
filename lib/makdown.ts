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