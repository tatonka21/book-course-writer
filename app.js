// ============================================
//  AI Book & Course Writer - App Logic
//  Connects to Ollama via Cloudflare Tunnel
// ============================================

// Toggle API key visibility
function toggleKey() {
    const keyInput = document.getElementById('apiKey');
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
}

// Generate content
async function generateContent() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const contentType = document.getElementById('contentType').value;
    const model = document.getElementById('model').value;
    const title = document.getElementById('title').value.trim();
    const sections = parseInt(document.getElementById('sections').value);
    const length = parseInt(document.getElementById('length').value);
    const description = document.getElementById('description').value.trim();
    const tone = document.getElementById('tone').value;

    // Validation
    if (!apiUrl) {
        alert('Please enter your Ollama API URL');
        return;
    }
    if (!apiKey) {
        alert('Please enter your API key');
        return;
    }
    if (!title) {
        alert('Please enter a title/topic');
        return;
    }
    if (!description) {
        alert('Please enter a description of what you want to create');
        return;
    }

    // UI state
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const outputSection = document.getElementById('outputSection');
    const outputContent = document.getElementById('outputContent');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    btn.disabled = true;
    btnText.textContent = 'Generating...';
    btnSpinner.classList.remove('hidden');
    outputSection.classList.remove('hidden');
    outputContent.innerHTML = '';
    progressBar.classList.remove('hidden');
    progressFill.style.width = '0%';

    const contentTypeNames = {
        book: 'Book',
        course: 'Online Course',
        magazine: 'Magazine',
        ebook: 'eBook',
        workbook: 'Workbook'
    };

    const typeName = contentTypeNames[contentType] || 'Content';
    let fullContent = '';
    let currentSection = 0;

    // Generate each section
    for (let i = 1; i <= sections; i++) {
        currentSection = i;
        const progress = Math.round((i / sections) * 100);
        progressFill.style.width = progress + '%';
        progressText.textContent = `Section ${i} of ${sections} (${progress}%)`;

        const prompt = buildSectionPrompt(contentType, title, description, tone, i, sections, length, typeName, fullContent);

        try {
            const response = await callOllama(apiUrl, apiKey, model, prompt);
            
            if (response.error) {
                throw new Error(response.error);
            }

            // Format the section
            const sectionContent = formatSection(contentType, title, i, sections, response.text);
            fullContent += sectionContent + '\n\n';

            // Update output in real-time
            outputContent.innerHTML = renderMarkdown(fullContent);
            outputContent.scrollTop = outputContent.scrollHeight;

        } catch (err) {
            progressBar.classList.add('hidden');
            btn.disabled = false;
            btnText.textContent = '🚀 Generate Content';
            btnSpinner.classList.add('hidden');
            
            if (err.message.includes('401') || err.message.includes('403')) {
                outputContent.innerHTML = `<div class="error">❌ Authentication failed. Check your API key.</div>`;
            } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                outputContent.innerHTML = `<div class="error">❌ Cannot connect to Ollama. Check your API URL and make sure the tunnel is running.</div>`;
            } else {
                outputContent.innerHTML = `<div class="error">❌ Error: ${err.message}</div>`;
            }
            return;
        }
    }

    // Complete
    progressFill.style.width = '100%';
    progressText.textContent = '✅ Complete!';
    setTimeout(() => {
        progressBar.classList.add('hidden');
    }, 2000);

    btn.disabled = false;
    btnText.textContent = '🚀 Generate Content';
    btnSpinner.classList.add('hidden');
}

// Build prompt for each section
function buildSectionPrompt(contentType, title, description, tone, sectionNum, totalSections, wordsPerSection, typeName, previousContent) {
    const isFirst = sectionNum === 1;
    const isLast = sectionNum === totalSections;

    let prompt = `You are a professional ${contentType} writer. Write high-quality, original content.\n\n`;
    prompt += `Content Type: ${typeName}\n`;
    prompt += `Title: "${title}"\n`;
    prompt += `Target Tone: ${tone}\n`;
    prompt += `Description: ${description}\n\n`;

    if (isFirst) {
        prompt += `This is SECTION ${sectionNum} of ${totalSections}.\n`;
        prompt += `Write the INTRODUCTION / FIRST SECTION of this ${typeName.toLowerCase()}.\n`;
        prompt += `- Start with a compelling opening that hooks the reader\n`;
        prompt += `- Introduce the topic and explain what will be covered\n`;
        prompt += `- Set expectations for the ${typeName.toLowerCase()}\n`;
        prompt += `- Write approximately ${wordsPerSection} words\n`;
        prompt += `- Format with proper headings, paragraphs, and structure\n`;
        prompt += `- Use markdown formatting (## for section title, ### for subsections)\n`;
    } else if (isLast) {
        prompt += `This is the FINAL SECTION (${sectionNum} of ${totalSections}).\n`;
        prompt += `Write the CONCLUSION of this ${typeName.toLowerCase()}.\n`;
        prompt += `- Summarize the key points covered\n`;
        prompt += `- Provide final thoughts and takeaways\n`;
        prompt += `- Include a call to action or next steps for the reader\n`;
        prompt += `- Write approximately ${wordsPerSection} words\n`;
        prompt += `- Use markdown formatting\n`;
    } else {
        prompt += `This is SECTION ${sectionNum} of ${totalSections}.\n`;
        prompt += `Write a detailed section that continues from the previous content.\n`;
        prompt += `- Give this section a clear, descriptive title\n`;
        prompt += `- Cover the next logical topic in the sequence\n`;
        prompt += `- Include examples, explanations, and practical insights\n`;
        prompt += `- Write approximately ${wordsPerSection} words\n`;
        prompt += `- Use markdown formatting (## for section title, ### for subsections)\n`;
    }

    prompt += `\nIMPORTANT: Write ONLY the content for this section. Do not include meta-commentary.`;
    prompt += `\nWrite in a ${tone} tone throughout.`;
    prompt += `\nMake the content engaging, informative, and valuable to the reader.`;

    return prompt;
}

// Call Ollama API
async function callOllama(apiUrl, apiKey, model, prompt) {
    // Clean the URL
    const baseUrl = apiUrl.replace(/\/+$/, '');
    
    const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 2048
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { text: data.response || '' };
}

// Format section content
function formatSection(contentType, title, sectionNum, totalSections, text) {
    const typeNames = {
        book: 'Chapter',
        course: 'Module',
        magazine: 'Article',
        ebook: 'Chapter',
        workbook: 'Exercise'
    };
    const sectionLabel = typeNames[contentType] || 'Section';
    
    let formatted = '';
    
    // Add section header if not already present
    if (!text.trim().startsWith('#')) {
        formatted += `## ${sectionLabel} ${sectionNum}\n\n`;
    }
    
    formatted += text.trim();
    
    return formatted;
}

// Simple markdown renderer
function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p>')
        // Single newlines within paragraphs
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<pre')) {
        html = '<p>' + html + '</p>';
    }
    
    // Fix nested paragraph issues
    html = html.replace(/<\/p><p><h([1-3])>/g, '<h$1>');
    html = html.replace(/<\/h([1-3])><\/p><p>/g, '</h$1>');
    html = html.replace(/<\/p><p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p><p>/g, '</ul>');
    html = html.replace(/<\/p><p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p><p>/g, '</pre>');
    html = html.replace(/<\/p><p><hr>/g, '<hr>');
    html = html.replace(/<hr><\/p><p>/g, '<hr>');
    html = html.replace(/<br><\/p><p>/g, '</p><p>');
    
    return html;
}

// Copy content to clipboard
function copyContent() {
    const content = document.getElementById('outputContent');
    const text = content.textContent || content.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Content copied to clipboard!');
    }).catch(() => {
        // Fallback
        const range = document.createRange();
        range.selectNode(content);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        alert('✅ Content copied to clipboard!');
    });
}

// Download content as text file
function downloadContent() {
    const content = document.getElementById('outputContent');
    const text = content.textContent || content.innerText;
    const title = document.getElementById('title').value.trim() || 'generated-content';
    const contentType = document.getElementById('contentType').value;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${contentType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear content
function clearContent() {
    document.getElementById('outputContent').innerHTML = '';
    document.getElementById('outputSection').classList.add('hidden');
    document.getElementById('progressBar').classList.add('hidden');
}