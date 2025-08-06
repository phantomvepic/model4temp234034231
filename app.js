// Enhanced Application data
const appData = {
    enhancedKeywords: {
        physics: [ /* ... same as before, truncated for clarity ... */ ],
        chemistry: [ /* ... same as before ... */ ],
        mathematics: [ /* ... same as before ... */ ]
    },
    commonStopwords: [
        "the","is","at","which","on","a","an","as","are","was","were","been","be","have","has","had","do","does","did","will","would","should","could","can","may","might","must","shall","to","of","in","for","with","by","from","about","into","through","during","before","after","above","below","up","down","out","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","just","now","also","but","or","and","if","because","while","until","since","unless","although","however","therefore","thus","hence","moreover","furthermore","nevertheless","nonetheless","meanwhile","otherwise","instead","besides","except","without","within","throughout","across","between","among","around","near","far","inside","outside","toward","away","along","against","upon","beneath","behind","ahead","beside","beyond"
    ],
    enhancedChapterIndicators: [
        "Chapter","Unit","Lesson","Section","Part","Module","Topic","Introduction to","Basics of","Fundamentals of","Advanced","Theory of","Applications of","Problems on","Numerical Problems","Concepts of","Principles of","Laws of","Properties of","Structure of","Mechanism of","Analysis of","Study of","Overview of","Elements of","Composition of","Behavior of","Dynamics of","Statics of","Kinetics of","Thermodynamics of","Electromagnetism","Optics","Modern Physics","Atomic Physics","Nuclear Physics","Solid State","Semiconductor","Communication","Dual Nature","Organic Chemistry","Inorganic Chemistry","Physical Chemistry","Chemical Bonding","Periodic Table","Coordination","Biomolecules","Polymers","Environmental Chemistry","Differential Calculus","Integral Calculus","Coordinate Geometry","Trigonometry","Statistics","Probability","Sequences","Series","Matrices","Determinants","Vectors","Three Dimensional","Mathematical Reasoning","Linear Programming"
    ],
    jeeSubjects: [
        "Physics","Chemistry","Mathematics","Organic Chemistry","Inorganic Chemistry",
        "Physical Chemistry","Mechanics","Thermodynamics","Electromagnetism","Optics",
        "Modern Physics","Algebra","Calculus","Coordinate Geometry","Trigonometry",
        "Statistics","Probability"
    ]
};

// Global
let currentFile = null;
let extractedData = {
    chapterName: '',
    subject: '',
    keywords: [],
    frameworks: [],
    text: '',
    pageCount: 0,
    wordCount: 0,
    chapterConfidence: 0,
    debugInfo: {}
};

// Init
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupPdfJs();
});

function setupPdfJs() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

function setupEventListeners() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pdf-input');
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('click', function(e) { e.stopPropagation(); });
}
function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); document.getElementById('upload-area').classList.add('dragover'); }
function handleDragLeave(e) { e.preventDefault(); e.stopPropagation(); document.getElementById('upload-area').classList.remove('dragover'); }
function handleDrop(e) {
    e.preventDefault(); e.stopPropagation(); document.getElementById('upload-area').classList.remove('dragover');
    const files = e.dataTransfer.files; if (files.length > 0) handleFile(files[0]);
}
function handleFileSelect(e) { const file = e.target.files[0]; if (file) handleFile(file); }
function handleFile(file) {
    if (!file.type.includes('pdf')) { showError('Please select a valid PDF file.'); return; }
    if (file.size > 50 * 1024 * 1024) { showError('File size must be less than 50MB.'); return; }
    currentFile = file; showFileInfo(file); processPDF(file);
}
function showFileInfo(file) {
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    let st = document.getElementById('upload-status');
    st.textContent = 'File uploaded successfully';
    st.className = 'status status--success';
    let inf = document.getElementById('file-info'); inf.style.display = 'block'; inf.classList.add('fade-in');
}
function formatFileSize(bytes) { if (bytes===0) return '0 Bytes'; const k=1024,sizes=['Bytes','KB','MB','GB'];const i=Math.floor(Math.log(bytes)/Math.log(k));return parseFloat((bytes/Math.pow(k,i)).toFixed(2))+' '+sizes[i]; }
function showError(message) {
    let st = document.getElementById('upload-status'), inf = document.getElementById('file-info');
    st.textContent = message; st.className = 'status status--error'; inf.style.display = 'block';
}

async function processPDF(file) {
    try {
        showProcessingModal(); await sleep(500);
        updateProcessingStep('step-1', 'processing');
        const pdfData = await extractPdfTextEnhanced(file);
        extractedData.text = pdfData.text;
        extractedData.pageCount = pdfData.pageCount;
        updateProcessingStep('step-1', 'completed');
        await sleep(800);
        updateProcessingStep('step-2', 'processing');
        const chapterData = extractChapterNameEnhanced(pdfData.text, pdfData.textBlocks);
        extractedData.chapterName = chapterData.name;
        extractedData.chapterConfidence = chapterData.confidence;
        extractedData.debugInfo = chapterData.debug;
        updateProcessingStep('step-2', 'completed');
        await sleep(800);
        updateProcessingStep('step-3', 'processing');
        const keywords = extractKeywordsEnhanced(pdfData.text);
        extractedData.keywords = keywords;
        updateProcessingStep('step-3', 'completed');
        await sleep(800);
        updateProcessingStep('step-4', 'processing');
        const subject = classifySubjectEnhanced(extractedData.chapterName, keywords);
        extractedData.subject = subject;
        updateProcessingStep('step-4', 'completed');
        await sleep(800);
        updateProcessingStep('step-5', 'processing');
        // REPLACEMENT: generate frameworks is now JEE Questions Search Simulation
        const frameworks = generateJeeSearchSimulations(extractedData.chapterName, subject, keywords);
        extractedData.frameworks = frameworks;
        updateProcessingStep('step-5', 'completed');
        await sleep(500);
        extractedData.wordCount = pdfData.text.split(/\s+/).filter(word => word.length > 0).length;
        hideProcessingModal(); displayResults();
    } catch (error) {
        console.error('Error processing PDF:',error); hideProcessingModal();
        showError('Failed to process PDF. Please try again.');
    }
}
// PDF extract
async function extractPdfTextEnhanced(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = async function(e) {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = ''; let textBlocks = [];
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    textContent.items.forEach((item,index) => {
                        const block = {
                            text: item.str, fontSize: item.height, fontName: item.fontName,
                            x: item.transform[4], y: item.transform[5], page: pageNum,
                            isBold: item.fontName && item.fontName.toLowerCase().includes('bold'),
                            isItalic: item.fontName && item.fontName.toLowerCase().includes('italic')
                        };
                        textBlocks.push(block); fullText += item.str + ' ';
                    });
                    fullText += '\n';
                }
                resolve({
                    text: fullText, textBlocks: textBlocks, pageCount: pdf.numPages
                });
            } catch (error) { reject(error);}
        };
        fileReader.onerror = () => reject(new Error('Failed to read file'));
        fileReader.readAsArrayBuffer(file);
    });
}

function extractChapterNameEnhanced(text, textBlocks) {
    const lines = text.split('\n').map(line=>line.trim()).filter(line=>line.length>0);
    const candidates=[];
    for(let i=0; i<Math.min(lines.length,20); i++) {
        const line=lines[i]; let score=0;
        for(const indicator of appData.enhancedChapterIndicators) {
            if(line.toLowerCase().includes(indicator.toLowerCase())) {
                score+=15;
                if(line.toLowerCase().startsWith(indicator.toLowerCase())) score+=10;
                break;
            }
        }
        if(score>0) candidates.push({ name: cleanChapterName(line), score: score, method:'indicator', line:i });
    }
    if(textBlocks&&textBlocks.length>0){
        const avgFont=textBlocks.reduce((sum,b)=>sum+b.fontSize,0)/textBlocks.length;
        const largeFont=avgFont*1.3;
        textBlocks.forEach((block,index)=>{
            if(block.fontSize>largeFont&& block.text.trim().length>5 && block.text.trim().length<100 && index<textBlocks.length*0.2){
                let score=8;if(block.isBold)score+=5;if(block.fontSize>avgFont*1.5)score+=5;
                candidates.push({name:cleanChapterName(block.text),score,method:'font-size',fontSize:block.fontSize,avgFontSize:avgFont})
            }
        })
    }
    lines.slice(0,15).forEach((line,index)=>{
        let score=0;
        if(/^(\d+\.?\s+|Chapter\s+\d+|Unit\s+[IVX]+)/i.test(line)){score+=10;}
        if(line.toUpperCase()===line && line.length>5 && line.length<60){score+=6;}
        if(line.length<50 && line.length>10 && index<10){score+=4;}
        if(score>0) candidates.push({name:cleanChapterName(line),score,method:'pattern',line:index});
    });
    candidates.forEach(candidate=>{
        const nameLower=candidate.name.toLowerCase();
        for(const subject of appData.jeeSubjects){
            if(nameLower.includes(subject.toLowerCase())){
                candidate.score+=8;candidate.subjectMatch=subject;
            }
        }
    });
    candidates.sort((a,b)=>b.score-a.score);
    if(candidates.length>0){
        const best=candidates[0];
        const confidence=Math.min(100,Math.max(0,(best.score/25)*100));
        return {name:best.name,confidence:Math.round(confidence),debug:{candidates:candidates.slice(0,5),method:best.method,totalCandidates:candidates.length}};
    }
    return { name:"Chapter Analysis",confidence:0,debug: {candidates:[],method:'fallback',totalCandidates:0}};
}
function cleanChapterName(name) {
    let cleaned = name.replace(/^\d+\.?\s*/,'').replace(/page\s*\d+/gi,'').replace(/^\s*-\s*/,'').replace(/\s*-\s*$/,'').replace(/^\s*\|\s*/,'').replace(/\s*\|\s*$/,'').replace(/\s+/g,' ').trim();
    cleaned = cleaned.split(' ').map(word=> word.charAt(0).toUpperCase()+word.slice(1).toLowerCase()).join(' ');
    return cleaned||name;
}
function extractKeywordsEnhanced(text) {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' '), phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length>2 && words[i+1] && words[i+1].length>2) phrases.push(words[i]+' '+words[i+1]);
        if (words[i+2] && words[i].length>2 && words[i+1].length>2 && words[i+2].length>2)
            phrases.push(words[i]+' '+words[i+1]+' '+words[i+2]);
    }
    const wordCount = {}, phraseCount = {};
    words.forEach(word=> {if (word.length>2 && !appData.commonStopwords.includes(word)) wordCount[word]=(wordCount[word]||0)+1;});
    phrases.forEach(phrase=>{
        if(!phrase.split(' ').some(w=>appData.commonStopwords.includes(w)))
            phraseCount[phrase]=(phraseCount[phrase]||0)+1;
    });
    let subjectKeywords=[];Object.values(appData.enhancedKeywords).forEach(x=>{subjectKeywords=subjectKeywords.concat(x);});
    const allKeywords = [];
    Object.entries(wordCount).filter(([word,count])=>count>=2)
        .forEach(([word,count])=>{
            let score=count;
            if(subjectKeywords.includes(word))score+=10;
            if(word.length>6 || /^[a-z]+tion$|^[a-z]+sion$|^[a-z]+ment$/.test(word))score+=3;
            allKeywords.push({word,score,type:'single'});
        });
    Object.entries(phraseCount).filter(([phrase,count])=>count>=2)
        .forEach(([phrase,count])=>{
            let score=count+2;
            if(subjectKeywords.some(kw=>phrase.includes(kw)))score+=8;
            allKeywords.push({word:phrase,score,type:'phrase'});
        });
    allKeywords.sort((a,b)=>b.score-a.score);
    return allKeywords.slice(0,50).map(item=>item.word).filter(word=>{
        const commonAcademic=['example','problem','solution','given','find','calculate','show','prove','hence','therefore','thus','since','because','however','moreover','furthermore','figure','table','diagram'];
        return !commonAcademic.includes(word)&&word.length>=3&&word.length<=30&&!/^\d+$/.test(word);
    });
}
function classifySubjectEnhanced(chapterName, keywords) {
    const subjectScores = {}; appData.jeeSubjects.forEach(subject=>{subjectScores[subject.toLowerCase()]=0;});
    const chapterLower = chapterName.toLowerCase();
    appData.jeeSubjects.forEach(subject=>{
        if(chapterLower.includes(subject.toLowerCase()))subjectScores[subject.toLowerCase()]+=20;
    });
    Object.entries(appData.enhancedKeywords).forEach(([subject,subjectKeywords])=>{
        keywords.forEach(keyword=>{
            if(subjectKeywords.includes(keyword))subjectScores[subject]+=5;
            if(keyword.includes(' ') && subjectKeywords.some(sk=>keyword.includes(sk)||sk.includes(keyword)))
                subjectScores[subject]+=3;
        });
    });
    const maxScore = Math.max(...Object.values(subjectScores)); if(maxScore<5)return 'General';
    const bestSubject = Object.entries(subjectScores).find(([subject,score])=>score===maxScore);
    return bestSubject?bestSubject[0].charAt(0).toUpperCase()+bestSubject[0].slice(1):'General';
}

// >>>>> THIS IS NOW THE "FRAMEWORK" GENERATOR <<<<<
function generateJeeSearchSimulations(chapterName, subject, keywords) {
    // Use input if user provides
    const userChapterName = document.getElementById('chapter-input').value.trim();
    const finalChapterName = userChapterName || chapterName;
    // Base queries
    const baseQueries = [
        `"${finalChapterName}" JEE Main previous year questions`,
        `"${finalChapterName}" JEE Advanced previous year questions`,
        `"${finalChapterName}" JEE Main PYQ solutions`,
        `"${finalChapterName}" JEE Advanced PYQ solutions`,
        `${subject} "${finalChapterName}" IIT JEE questions`,
        `JEE ${subject.toLowerCase()} "${finalChapterName}" practice questions`,
        `"${finalChapterName}" NEET previous year questions`,
        `"${finalChapterName}" NEET PYQ solutions`,
        `JEE ${subject} numerical problems "${finalChapterName}"`,
        `"${finalChapterName}" concept questions JEE preparation`,
        `"${finalChapterName}" theory questions JEE Main`,
        `"${finalChapterName}" objective questions JEE Advanced`,
        `JEE ${subject.toLowerCase()} "${finalChapterName}" mock test questions`,
        `"${finalChapterName}" important questions for JEE`,
        `"${finalChapterName}" chapter wise questions JEE`
    ];
    // Keyword-based queries
    const keywordQueries = [];
    const topKeywords = keywords.slice(0, 10);
    topKeywords.forEach(keyword=>{
        keywordQueries.push(`JEE ${subject.toLowerCase()} ${keyword} questions`);
        keywordQueries.push(`"${keyword}" previous year questions JEE`);
        keywordQueries.push(`${keyword} problems JEE Main Advanced`);
    });
    // Topic variations
    const topicQueries=[
        `"${finalChapterName}" multiple choice questions JEE`,
        `"${finalChapterName}" assertion reason questions JEE`,
        `"${finalChapterName}" numerical answer type questions`,
        `"${finalChapterName}" comprehension based questions JEE`,
        `"${finalChapterName}" match the following questions JEE`,
        `"${finalChapterName}" formula based questions JEE`,
        `"${finalChapterName}" application based questions JEE`,
        `"${finalChapterName}" conceptual questions JEE preparation`,
        `"${finalChapterName}" problem solving questions JEE`,
        `"${finalChapterName}" calculation based questions JEE`
    ];
    const difficultyQueries=[
        `"${finalChapterName}" easy level questions JEE`,
        `"${finalChapterName}" moderate level questions JEE`,
        `"${finalChapterName}" difficult questions JEE Advanced`,
        `"${finalChapterName}" basic concepts questions JEE`,
        `"${finalChapterName}" advanced level problems JEE`
    ];
    const examQueries=[
        `"${finalChapterName}" single correct answer questions JEE`,
        `"${finalChapterName}" multiple correct answers JEE`,
        `"${finalChapterName}" integer type questions JEE`,
        `"${finalChapterName}" matrix match questions JEE Advanced`,
        `"${finalChapterName}" passage based questions JEE`
    ];
    let allQueries=[
        ...baseQueries,
        ...keywordQueries.slice(0,15),
        ...topicQueries,
        ...difficultyQueries,
        ...examQueries
    ];
    return [...new Set(allQueries)].slice(0,50);
}

// ------------------ UI display code remains the same -----------------
function displayResults() {
    document.getElementById('analysis-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('analysis-section').classList.add('fade-in');
    document.getElementById('results-section').classList.add('slide-up');
    const chapterDisplay = `${extractedData.chapterName} (${extractedData.chapterConfidence}% confidence)`;
    document.getElementById('chapter-name-content').textContent = chapterDisplay;
    document.getElementById('subject-content').textContent = extractedData.subject;
    document.getElementById('pages-count').textContent = extractedData.pageCount;
    document.getElementById('words-count').textContent = extractedData.wordCount.toLocaleString();
    document.getElementById('keywords-count').textContent = extractedData.keywords.length;
    // The "Frameworks" section = search simulations
    displayKeywords();
    displayFrameworks();
    displaySearchResults();
}
function displayKeywords() {
    const keywordsCode = document.getElementById('keywords-code');
    const formattedKeywords = extractedData.keywords.map(k => `'${k}'`).join(', ');
    keywordsCode.textContent = `[${formattedKeywords}]`;
}
function displayFrameworks() {
    const frameworksCode = document.getElementById('frameworks-code');
    const formattedFrameworks = extractedData.frameworks.map(f => `'${f}'`).join(',\n    ');
    frameworksCode.textContent = `[\n    ${formattedFrameworks}\n]`;
}
function displaySearchResults() {
    const searchQueries = document.getElementById('search-queries');
    const sampleQuestions = document.getElementById('sample-questions');
    // Just show frameworks, as these are now the queries
    const queries = extractedData.frameworks.slice(0, 7);
    searchQueries.innerHTML = queries.map(query => `<div class="search-query">${query}</div>`).join('');
    const displayFrameworks = extractedData.frameworks.slice(7,15);
    const questionTypes=['Search Query','PYQ Search','Practice Questions','Concept Questions','Numerical Problems','Theory Questions','Mock Test'];
    sampleQuestions.innerHTML = displayFrameworks.map((framework,index)=>
        `<div class="question-item"><div class="question-pattern">${framework}</div><div class="question-type">${questionTypes[index % questionTypes.length]} • ${extractedData.subject}</div></div>`
    ).join('');
}
function showProcessingModal() {
    const modal = document.getElementById('processing-modal');
    modal.classList.remove('hidden');
    for (let i = 1; i <= 5; i++) { const step = document.getElementById(`step-${i}`); step.classList.remove('processing', 'completed'); }
}
function hideProcessingModal() {
    const modal = document.getElementById('processing-modal');
    modal.classList.add('hidden');
}
function updateProcessingStep(stepId, status) {
    const step = document.getElementById(stepId); step.classList.remove('processing','completed'); step.classList.add(status);
}
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const button = element.parentElement.querySelector('.copy-btn');
        if (button) {
            const originalButtonText = button.textContent;
            button.textContent = 'Copied!'; button.classList.add('status--success');
            setTimeout(()=>{button.textContent=originalButtonText;button.classList.remove('status--success');},2000);
        }
    }).catch(()=>{ const textArea=document.createElement('textarea'); textArea.value=text; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea);});
}
function downloadResults() {
    const results = {
        chapterName: extractedData.chapterName,
        chapterConfidence: extractedData.chapterConfidence,
        subject: extractedData.subject,
        keywords: extractedData.keywords,
        jeeQuestionsSearchQueries: extractedData.frameworks,
        userInputChapter: document.getElementById('chapter-input').value.trim(),
        statistics: {
            pages: extractedData.pageCount,
            words: extractedData.wordCount,
            keywordCount: extractedData.keywords.length,
            searchQueriesCount: extractedData.frameworks.length
        },
        debugInfo: extractedData.debugInfo,
        generatedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `jee-enhanced-analysis-${extractedData.chapterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
function resetApp() {
    currentFile = null;
    extractedData = { chapterName:'',subject:'',keywords:[],frameworks:[],text:'',pageCount:0,wordCount:0,chapterConfidence:0,debugInfo:{} };
    document.getElementById('analysis-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('pdf-input').value = '';
    document.getElementById('chapter-input').value = '';
    document.getElementById('upload-area').classList.remove('dragover');
}
function sleep(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }
window.addEventListener('error',function(e){console.error('Application error:',e.error);hideProcessingModal();showError('An unexpected error occurred. Please try again.');});
document.addEventListener('dragenter', e => {if(!e.target.closest('#upload-area'))e.preventDefault();});
document.addEventListener('dragover', e => {if(!e.target.closest('#upload-area'))e.preventDefault();});
document.addEventListener('dragleave', e => {if(!e.target.closest('#upload-area'))e.preventDefault();});
document.addEventListener('drop', e => {if(!e.target.closest('#upload-area'))e.preventDefault();});
