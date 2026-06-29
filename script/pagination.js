function setupBinaryParagraphNumbers() {
  // Remove any existing page indicator
  const existingIndicator = document.getElementById('page-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  // Clear any existing binary numbers first
  document.querySelectorAll('.binary-container').forEach(el => el.remove());

  // Get all paragraphs in the chapter content
  const paragraphs = document.querySelectorAll('.chapter-content p');
  
  // Function to convert decimal to 12-bit binary with "/" for 0 and "\" for 1
  function decimalToBinary(decimal) {
    let binary = decimal.toString(2).padStart(12, '0');
    return binary.replace(/0/g, '/').replace(/1/g, '\\');
  }
  
  // Process each paragraph
  paragraphs.forEach((paragraph, index) => {
    // Get the corresponding chapter row
    const chapterRow = paragraph.closest('.chapter-row');
    if (!chapterRow) return;
    
    // Create binary number element
    const binaryNumber = document.createElement('div');
    binaryNumber.className = 'binary-paragraph-number';
    binaryNumber.textContent = decimalToBinary(index + 1);
    
    // Create a container for the binary number that will be positioned
    const binaryContainer = document.createElement('div');
    binaryContainer.className = 'binary-container';
    binaryContainer.style.opacity = '0'; // Start hidden
    binaryContainer.appendChild(binaryNumber);
    
    // Add the binary container to the chapter row instead of chapter notes
    chapterRow.appendChild(binaryContainer);
    
    // Set initial position
    updateBinaryPosition(paragraph, binaryContainer);
    
    // Add a data attribute to link the paragraph and its binary number
    paragraph.dataset.binaryIndex = index;
    binaryContainer.dataset.binaryIndex = index;
    
    // Add hover event listeners
    paragraph.addEventListener('mouseenter', () => {
      binaryContainer.style.opacity = '1';
    });
    
    paragraph.addEventListener('mouseleave', () => {
      binaryContainer.style.opacity = '0';
    });
  });
}

// Function to update the position of a binary number container
function updateBinaryPosition(paragraph, binaryContainer) {
  const chapterRow = paragraph.closest('.chapter-row');
  if (!chapterRow) return;
  
  const paragraphRect = paragraph.getBoundingClientRect();
  const rowRect = chapterRow.getBoundingClientRect();
  
  // Calculate the top position relative to the chapter row
  // Add a small offset to align with the first line of text
  const topPosition = paragraphRect.top - rowRect.top + 3;
  
  // Set the top position only - left is handled by CSS
  binaryContainer.style.top = `${topPosition}px`;
}

// Update all binary positions on scroll
function updateAllBinaryPositions() {
  const paragraphs = document.querySelectorAll('.chapter-content p');
  
  paragraphs.forEach(paragraph => {
    const index = paragraph.dataset.binaryIndex;
    if (index !== undefined) {
      const binaryContainer = document.querySelector(`.binary-container[data-binary-index="${index}"]`);
      if (binaryContainer) {
        updateBinaryPosition(paragraph, binaryContainer);
      }
    }
  });
}

// Run on load and whenever the window is resized or scrolled
document.addEventListener('DOMContentLoaded', () => {
  setupBinaryParagraphNumbers();
  // Initial update after a short delay to ensure everything is rendered
  setTimeout(updateAllBinaryPositions, 100);
});
window.addEventListener('resize', () => {
  setupBinaryParagraphNumbers();
  // Update after a short delay to ensure everything is rendered
  setTimeout(updateAllBinaryPositions, 100);
});
window.addEventListener('scroll', updateAllBinaryPositions); 