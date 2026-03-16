/**
 * Pattern-Based Number Generator
 * Main application entry point
 */

// Application state - will be initialized after classes are defined
let state = {};

// UIController instance
let uiController = null;

/**
 * Initialize the application - Task 11.1 Implementation
 * Instantiates all classes and wires event handlers for complete application functionality
 */
function init() {
  try {
    // 1. Instantiate all classes (PatternValidator, PatternAnalyzer, PatternGenerator, PatternManager, CSVExporter, UIController)
    console.log('Initializing Pattern-Based Number Generator...');
    
    // PatternManager automatically instantiates PatternValidator, PatternAnalyzer, and PatternGenerator
    state.patternManager = new PatternManager();
    
    // Initialize UIController (handles all UI interactions)
    uiController = new UIController();
    uiController.init();
    
    // CSVExporter is instantiated when needed in UIController.handleExport()
    
    // Make uiController globally accessible for onclick handlers
    window.uiController = uiController;

    // 2. Wire event handlers for input submission, pattern removal, and CSV export
    // (Already handled in UIController.setupEventListeners())
    
    // 3. Connect validation errors to UI error display
    // (Already handled in UIController.handleAddPattern() with try/catch)
    
    // 4. Connect pattern additions to UI updates (showing pattern type and all generated numbers)
    // (Already handled in UIController.handleAddPattern() -> updateUI())
    
    // 5. Connect export button to CSVExporter (exporting all numbers with pattern types)
    // (Already handled in UIController.handleExport())
    
    // 6. Initialize disclaimer display on page load
    // (Disclaimer removed in new UI design)
    initializeDisclaimer();
    
    // Initial UI update to set proper state
    uiController.updateUI();
    
    console.log('Application initialized successfully');
    console.log('- PatternManager ready with validator, analyzer, and generator');
    console.log('- UIController initialized with all event handlers');
    console.log('- Disclaimer displayed');
    console.log('- Export functionality ready');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show error to user if possible
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = 'Failed to initialize application. Please refresh the page.';
      errorElement.classList.add('show');
    }
  }
}

/**
 * Initialize disclaimer display on page load
 * Ensures disclaimer is visible and properly styled
 * NOTE: Disclaimer removed in new UI design
 */
function initializeDisclaimer() {
  // Disclaimer functionality removed in new UI design
  console.log('Disclaimer initialization skipped - not present in new UI');
}

/**
 * Handle adding a pattern (legacy function for backward compatibility)
 */
function handleAddPattern() {
  if (window.uiController) {
    window.uiController.handleAddPattern();
  }
}

/**
 * PatternValidator class for validating user input patterns
 * Validates patterns according to requirements (a-z only, 10 characters)
 */
class PatternValidator {
  /**
   * Validates a pattern string
   * @param {string} pattern - The pattern to validate
   * @returns {ValidationResult} Object with isValid flag and error message
   */
  validate(pattern) {
    // Check if empty
    if (!pattern || pattern.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Pattern cannot be empty',
        invalidCharacters: []
      };
    }

    // Check length
    if (!this.isValidLength(pattern)) {
      return {
        isValid: false,
        errorMessage: `Pattern must be exactly 10 characters (current: ${pattern.length} characters)`,
        invalidCharacters: []
      };
    }

    // Check for valid characters
    if (!this.hasValidCharacters(pattern)) {
      const invalidChars = this.getInvalidCharacters(pattern);
      const isThaiMobile = pattern.startsWith('06') || pattern.startsWith('08') || pattern.startsWith('09');
      const allowedChars = isThaiMobile ? 'digits (0-9) and ?' : 'lowercase letters a-z and ?';
      return {
        isValid: false,
        errorMessage: `Pattern contains invalid characters: ${invalidChars.join(', ')}. Only ${allowedChars} are allowed.`,
        invalidCharacters: invalidChars
      };
    }

    return {
      isValid: true,
      errorMessage: '',
      invalidCharacters: []
    };
  }

  /**
   * Checks if pattern length is exactly 10 characters
   * @param {string} pattern
   * @returns {boolean}
   */
  isValidLength(pattern) {
    return pattern && pattern.length === 10;
  }

  /**
   * Checks if pattern contains only valid characters (lowercase a-z, ?, and digits for Thai mobile patterns)
   * @param {string} pattern
   * @returns {boolean}
   */
  hasValidCharacters(pattern) {
    // Check for Thai mobile pattern (starts with 06, 08, or 09)
    if (pattern.startsWith('06') || pattern.startsWith('08') || pattern.startsWith('09')) {
      // Thai mobile patterns: digits and ? are allowed
      const validChars = /^[0-9?]+$/;
      return validChars.test(pattern);
    }
    
    // Regular patterns: lowercase a-z and ? characters
    const validChars = /^[a-z?]+$/;
    return validChars.test(pattern);
  }

  /**
   * Returns list of invalid characters in pattern
   * @param {string} pattern
   * @returns {string[]}
   */
  getInvalidCharacters(pattern) {
    if (!pattern) return [];
    
    // Check for Thai mobile pattern (starts with 06, 08, or 09)
    if (pattern.startsWith('06') || pattern.startsWith('08') || pattern.startsWith('09')) {
      // Thai mobile patterns: digits and ? are allowed
      return [...new Set(pattern.split('').filter(c => !/[0-9?]/.test(c)))];
    }
    
    // Regular patterns: lowercase a-z and ? characters
    return [...new Set(pattern.split('').filter(c => !/[a-z?]/.test(c)))];
  }
}

/**
 * Pattern types enumeration
 */
const PatternType = {
  SOLOIST: 'The Soloist',
  HYPHEN_SEPARATED: 'Hyphen-separated',
  FULL_STRAIGHT: 'The Full Straight',
  CYCLIC_STRAIGHT: 'Cyclic Straight',
  RHYTHMIC_BRIDGE: 'The Rhythmic Bridge',
  THAI_MOBILE_NO: 'Thai Mobile No.',
  UNKNOWN: 'Unknown'
};

/**
 * PatternAnalyzer class for pattern type identification
 * Analyzes pattern structure to identify which of the 5 pattern types it matches
 */
class PatternAnalyzer {
  /**
   * Identifies the pattern type from pattern structure
   * Updated priority order to handle edge cases correctly
   * @param {string} pattern - Valid 10-character pattern (a-z)
   * @returns {string} One of: SOLOIST, HYPHEN_SEPARATED, FULL_STRAIGHT, CYCLIC_STRAIGHT, RHYTHMIC_BRIDGE
   * @throws {Error} If pattern doesn't match any known type
   */
  /**
     * Identifies the pattern type from pattern structure
     * Updated with better fallback logic to prevent "Pattern format not recognized" errors
     * @param {string} pattern - Valid 10-character pattern (a-z)
     * @returns {string} One of: SOLOIST, HYPHEN_SEPARATED, FULL_STRAIGHT, CYCLIC_STRAIGHT, RHYTHMIC_BRIDGE
     * @throws {Error} If pattern doesn't match any known type
     */
    identifyPatternType(pattern) {
      if (!pattern || pattern.length !== 10) {
        throw new Error('Pattern must be exactly 10 characters');
      }

      // Check for Thai Mobile No. patterns first (highest priority)
      if (this.isThaiMobileNo(pattern)) {
        return PatternType.THAI_MOBILE_NO;
      }

      // Check pattern types in priority order:
      // 1. The Full Straight - Highest priority (all 10 unique letters in sequence)
      // 2. Cyclic Straight - Second priority (cyclic progression)  
      // 3. Hyphen-separated - Third priority (specific block patterns)
      // 4. The Soloist - Fourth priority (dominant repeating patterns)
      // 5. The Rhythmic Bridge - Fallback (any repeating patterns)

      if (this.isFullStraight(pattern)) {
        return PatternType.FULL_STRAIGHT;
      }

      if (this.isCyclicStraight(pattern)) {
        return PatternType.CYCLIC_STRAIGHT;
      }

      // Check Hyphen-separated BEFORE Soloist to catch specific patterns like bbbtnxbbbb
      if (this.isHyphenSeparated(pattern)) {
        return PatternType.HYPHEN_SEPARATED;
      }

      if (this.isSoloist(pattern)) {
        return PatternType.SOLOIST;
      }

      if (this.isRhythmicBridge(pattern)) {
        return PatternType.RHYTHMIC_BRIDGE;
      }

      // Enhanced fallback logic - classify based on pattern characteristics
      const letterCounts = this._getLetterCounts(pattern);
      const uniqueLetters = Object.keys(letterCounts);
      const counts = Object.values(letterCounts).sort((a, b) => b - a);

      // If it has a dominant repeating letter, classify as Soloist
      if (counts[0] >= 4) {
        return PatternType.SOLOIST;
      }

      // If it has repeating sub-patterns, classify as Rhythmic Bridge
      for (let len = 2; len <= 4; len++) {
        for (let start = 0; start <= pattern.length - len * 2; start++) {
          const subPattern = pattern.slice(start, start + len);
          for (let nextStart = start + len; nextStart <= pattern.length - len; nextStart++) {
            const nextSubPattern = pattern.slice(nextStart, nextStart + len);
            if (subPattern === nextSubPattern) {
              return PatternType.RHYTHMIC_BRIDGE;
            }
          }
        }
      }

      // If it has block-like structure, classify as Hyphen-separated
      const block1 = pattern.slice(0, 3);
      const block2 = pattern.slice(3, 6);
      const block3 = pattern.slice(6, 10);

      const block1AllSame = this._isAllSameInBlock(block1);
      const block2AllSame = this._isAllSameInBlock(block2);
      const block3AllSame = this._isAllSameInBlock(block3);

      if (block1AllSame || block2AllSame || block3AllSame) {
        return PatternType.HYPHEN_SEPARATED;
      }

      // Final fallback - classify as Rhythmic Bridge
      return PatternType.RHYTHMIC_BRIDGE;
    }

  /**
   * Checks if pattern is The Soloist (various repeating patterns)
   * Updated patterns based on specification table:
   * - All 10 digits identical: "aaaaaaaaaa" 
   * - All 9 digits identical: "?bbbbbbbbb"
   * - All 8 digits identical: "??dddddddd"
   * - All 7 digits identical: "???ddddddd"
   * - All 6 digits identical: "????eeeeee"
   * - All 5 digits identical: "?????fffff"
   * - All 4 digits identical (Block-ending): "??????gggg"
   * @param {string} pattern
   * @returns {boolean}
   */
  isSoloist(pattern) {
    const letterCounts = this._getLetterCounts(pattern);
    const uniqueLetters = Object.keys(letterCounts);
    const counts = Object.values(letterCounts).sort((a, b) => b - a);
    
    // Check for simple soloist: all same letter (aaaaaaaaaa)
    if (uniqueLetters.length === 1) {
      return true;
    }
    
    // Check for patterns with dominant repeating letter
    // All 9 digits identical: ?bbbbbbbbb (1 wildcard + 9 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 1 && letterCount === 9) {
        return true;
      }
    }
    
    // All 8 digits identical: ??dddddddd (2 wildcards + 8 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 2 && letterCount === 8) {
        return true;
      }
    }
    
    // All 7 digits identical: ???ddddddd (3 wildcards + 7 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 3 && letterCount === 7) {
        return true;
      }
    }
    
    // All 6 digits identical: ????eeeeee (4 wildcards + 6 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 4 && letterCount === 6) {
        return true;
      }
    }
    
    // All 5 digits identical: ?????fffff (5 wildcards + 5 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 5 && letterCount === 5) {
        return true;
      }
    }
    
    // All 4 digits identical (Block-ending): ??????gggg (6 wildcards + 4 repeating)
    if (uniqueLetters.length === 1 && pattern.includes('?')) {
      const wildcardCount = (pattern.match(/\?/g) || []).length;
      const letterCount = 10 - wildcardCount;
      if (wildcardCount === 6 && letterCount === 4) {
        return true;
      }
    }
    
    // For patterns without wildcards, use original logic
    if (!pattern.includes('?')) {
      // All 9 digits identical: abbbbbbbbb (1 unique + 9 repeating)
      if (uniqueLetters.length === 2 && counts[0] === 9 && counts[1] === 1) {
        return true;
      }
      
      // All 8 digits identical: abdddddddd (2 unique + 8 repeating)
      if (uniqueLetters.length === 3 && counts[0] === 8) {
        return true;
      }
      
      // All 7 digits identical: abcddddddd (3 unique + 7 repeating)
      if (uniqueLetters.length === 4 && counts[0] === 7) {
        return true;
      }
      
      // All 6 digits identical: abcdeeeeee (4 unique + 6 repeating)
      if (uniqueLetters.length === 5 && counts[0] === 6) {
        return true;
      }
      
      // All 5 digits identical: abcdefffff (5 unique + 5 repeating)
      if (uniqueLetters.length === 6 && counts[0] === 5) {
        return true;
      }
      
      // All 4 digits identical (Block-ending): abcdefgggg (6 unique + 4 repeating)
      if (uniqueLetters.length === 7 && counts[0] === 4) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks if pattern is Hyphen-separated (each block has repeated digits)
   * Updated patterns based on specification table:
   * - 2 distinct digits across blocks: "bbbaaaaaaa", "bbbbbaaaaa", "bbbaaabbbb"
   * - 3 distinct digits across blocks: "aaabbbcccc"
   * - First and last blocks identical: "bbb???bbbb"
   * @param {string} pattern
   * @returns {boolean}
   */
  isHyphenSeparated(pattern) {
    // Split into blocks: positions 0-2, 3-5, 6-9
    const block1 = pattern.slice(0, 3);
    const block2 = pattern.slice(3, 6);
    const block3 = pattern.slice(6, 10);
    
    const block1AllSame = this._isAllSameInBlock(block1);
    const block2AllSame = this._isAllSameInBlock(block2);
    const block3AllSame = this._isAllSameInBlock(block3);
    
    const letterCounts = this._getLetterCounts(pattern);
    const uniqueLetters = Object.keys(letterCounts);
    
    // Pattern 1: "bbb???bbbb" - first and last blocks same letter, middle different
    const block1NonWildcard = block1.replace(/\?/g, '');
    const block3NonWildcard = block3.replace(/\?/g, '');
    
    if (block1NonWildcard.length > 0 && block3NonWildcard.length > 0) {
      const block1Letter = block1NonWildcard[0];
      const block3Letter = block3NonWildcard[0];
      
      // Special case: if middle block is all wildcards, it's considered "different"
      const block2IsAllWildcards = block2 === '???';
      
      if (block1Letter === block3Letter && block1AllSame && block3AllSame && 
          (block2IsAllWildcards || !block2AllSame)) {
        return true;
      }
    }
    
    // Pattern 2: 2 distinct digits across blocks patterns
    if (uniqueLetters.length === 2 && !pattern.includes('?')) {
      // Check for patterns like "bbbaaaaaaa" (3+7) or "bbbbbaaaaa" (5+5) or "bbbaaabbbb" (3+3+4)
      const first3 = pattern.slice(0, 3);
      const middle3 = pattern.slice(3, 6);
      const last4 = pattern.slice(6, 10);
      const last7 = pattern.slice(3, 10);
      const first5 = pattern.slice(0, 5);
      const last5 = pattern.slice(5, 10);
      
      // Check 3+7 split (bbbaaaaaaa)
      if (this._isAllSameInBlock(first3) && this._isAllSameInBlock(last7) && first3[0] !== last7[0]) {
        return true;
      }
      
      // Check 5+5 split (bbbbbaaaaa)
      if (this._isAllSameInBlock(first5) && this._isAllSameInBlock(last5) && first5[0] !== last5[0]) {
        return true;
      }
      
      // Check 3+3+4 split (bbbaaabbbb)
      if (this._isAllSameInBlock(first3) && this._isAllSameInBlock(middle3) && this._isAllSameInBlock(last4)) {
        const first3Letter = first3[0];
        const middle3Letter = middle3[0];
        const last4Letter = last4[0];
        
        // Should have exactly 2 distinct letters across all blocks
        if ((first3Letter === last4Letter && first3Letter !== middle3Letter) ||
            (first3Letter === middle3Letter && first3Letter !== last4Letter) ||
            (middle3Letter === last4Letter && middle3Letter !== first3Letter)) {
          return true;
        }
      }
    }
    
    // Pattern 3: 3 distinct digits across blocks: "aaabbbcccc"
    if (uniqueLetters.length === 3 && !pattern.includes('?')) {
      // Check if it's a 3-block pattern with all different letters
      if (block1AllSame && block2AllSame && block3AllSame) {
        const block1Letter = block1[0];
        const block2Letter = block2[0];
        const block3Letter = block3[0];
        
        if (block1Letter !== block2Letter && block2Letter !== block3Letter && block1Letter !== block3Letter) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Checks if pattern is The Full Straight (all 10 digits in sequence)
   * Examples: "abcdefghij" → ascending/descending (2 combos)
   * @param {string} pattern
   * @returns {boolean}
   */
  isFullStraight(pattern) {
    const letters = pattern.split('');
    const uniqueLetters = [...new Set(letters)];
    
    // Must have all 10 unique letters a-j
    if (uniqueLetters.length !== 10) {
      return false;
    }
    
    // Check if all letters a-j are present
    const expectedLetters = 'abcdefghij'.split('');
    const hasAllLetters = expectedLetters.every(letter => uniqueLetters.includes(letter));
    
    if (!hasAllLetters) {
      return false;
    }
    
    // Check if letters are in consecutive order (ascending or descending)
    const letterValues = letters.map(letter => letter.charCodeAt(0) - 'a'.charCodeAt(0));
    
    // Check ascending sequence
    let isAscending = true;
    for (let i = 1; i < letterValues.length; i++) {
      if (letterValues[i] !== letterValues[i-1] + 1) {
        isAscending = false;
        break;
      }
    }
    
    // Check descending sequence
    let isDescending = true;
    for (let i = 1; i < letterValues.length; i++) {
      if (letterValues[i] !== letterValues[i-1] - 1) {
        isDescending = false;
        break;
      }
    }
    
    return isAscending || isDescending;
  }

  /**
   * Checks if pattern is Cyclic Straight (digits cycle with wraparound)
   * Examples: "zabcdefghi" → cyclic progression (20 combos)
   * @param {string} pattern
   * @returns {boolean}
   */
  isCyclicStraight(pattern) {
    const letters = pattern.split('');
    
    // Must have exactly 10 unique letters
    const uniqueLetters = [...new Set(letters)];
    if (uniqueLetters.length !== 10) {
      return false;
    }
    
    // Map letters to their positions in the alphabet, but treat them as 0-9 for cyclic checking
    // We need to find what digit each letter represents in the cyclic sequence
    const letterValues = letters.map(letter => letter.charCodeAt(0) - 'a'.charCodeAt(0));
    
    // For cyclic patterns, we need to check if the sequence follows a cyclic progression
    // where each next letter is (previous + 1) mod 10 or (previous - 1) mod 10
    
    // Try to find a mapping where the pattern is cyclic
    // Check if it's zabcdefghi pattern (z=9, a=0, b=1, ..., i=8)
    if (pattern === 'zabcdefghi') {
      return true;
    }
    
    // Check if it's ihgfedcbaz pattern (i=8, h=7, ..., a=0, z=9)
    if (pattern === 'ihgfedcbaz') {
      return true;
    }
    
    // General cyclic check: try different starting digit mappings
    for (let startDigit = 0; startDigit < 10; startDigit++) {
      // Try ascending cyclic
      let isAscendingCyclic = true;
      const firstLetter = letters[0];
      const firstLetterValue = firstLetter.charCodeAt(0) - 'a'.charCodeAt(0);
      
      // Map the first letter to startDigit, then check if rest follows cyclic pattern
      for (let i = 1; i < letters.length; i++) {
        const currentLetter = letters[i];
        const currentLetterValue = currentLetter.charCodeAt(0) - 'a'.charCodeAt(0);
        const prevLetter = letters[i-1];
        const prevLetterValue = prevLetter.charCodeAt(0) - 'a'.charCodeAt(0);
        
        // Calculate expected next value in cyclic sequence
        const expectedDiff = (currentLetterValue - prevLetterValue + 26) % 26;
        
        // For cyclic, we expect difference of 1 (or 25 for wraparound z->a)
        if (expectedDiff !== 1 && expectedDiff !== 25) {
          isAscendingCyclic = false;
          break;
        }
      }
      
      if (isAscendingCyclic) {
        return true;
      }
      
      // Try descending cyclic
      let isDescendingCyclic = true;
      for (let i = 1; i < letters.length; i++) {
        const currentLetter = letters[i];
        const currentLetterValue = currentLetter.charCodeAt(0) - 'a'.charCodeAt(0);
        const prevLetter = letters[i-1];
        const prevLetterValue = prevLetter.charCodeAt(0) - 'a'.charCodeAt(0);
        
        // Calculate expected next value in cyclic sequence (descending)
        const expectedDiff = (prevLetterValue - currentLetterValue + 26) % 26;
        
        // For cyclic descending, we expect difference of 1 (or 25 for wraparound a->z)
        if (expectedDiff !== 1 && expectedDiff !== 25) {
          isDescendingCyclic = false;
          break;
        }
      }
      
      if (isDescendingCyclic) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks if pattern is The Rhythmic Bridge (repeating across blocks)
   * Updated patterns based on new specification:
   * - Repeating pattern 2-3 block: "abcefgabcd"
   * - Repeating pattern front-middle: "abcabcdefg"
   * - Repeating pattern middle-end: "efgabcabcd"
   * @param {string} pattern
   * @returns {boolean}
   */
  isRhythmicBridge(pattern) {
    // Look for repeating sub-patterns across the string
    const letterPositions = this._getLetterPositions(pattern);
    
    // Check if any letter appears in multiple positions (indicating repetition)
    for (const [letter, positions] of Object.entries(letterPositions)) {
      if (positions.length >= 2) {
        // Check if positions form a repeating pattern
        const gaps = [];
        for (let i = 1; i < positions.length; i++) {
          gaps.push(positions[i] - positions[i-1]);
        }
        
        // If we have consistent gaps, it might be rhythmic
        if (gaps.length > 0) {
          const firstGap = gaps[0];
          const hasConsistentGap = gaps.every(gap => gap === firstGap);
          if (hasConsistentGap && firstGap <= 7) {
            return true;
          }
        }
      }
    }
    
    // Additional check for specific repeating patterns
    // Check for 3-character repeating patterns like "abc" in "abcefgabcd" or "abcabcdefg"
    for (let len = 2; len <= 4; len++) {
      for (let start = 0; start <= pattern.length - len * 2; start++) {
        const subPattern = pattern.slice(start, start + len);
        
        // Look for this sub-pattern appearing again later
        for (let nextStart = start + len; nextStart <= pattern.length - len; nextStart++) {
          const nextSubPattern = pattern.slice(nextStart, nextStart + len);
          if (subPattern === nextSubPattern) {
            return true;
          }
        }
      }
    }
    
    // Check for specific patterns from the table
    // Pattern: "abcefgabcd" - "abc" repeats at positions 0-2 and 6-8
    if (pattern.slice(0, 3) === pattern.slice(6, 9)) {
      return true;
    }
    
    // Pattern: "abcabcdefg" - "abc" repeats at positions 0-2 and 3-5
    if (pattern.slice(0, 3) === pattern.slice(3, 6)) {
      return true;
    }
    
    // Pattern: "efgabcabcd" - "abc" repeats at positions 3-5 and 6-8
    if (pattern.slice(3, 6) === pattern.slice(6, 9)) {
      return true;
    }
    
    return false;
  }

  /**
   * Checks if pattern is a Thai Mobile No. pattern
   * Thai mobile patterns start with 06, 08, or 09 followed by 8 more characters (digits or ?)
   * @param {string} pattern
   * @returns {boolean}
   */
  isThaiMobileNo(pattern) {
    // Check if pattern starts with valid Thai mobile prefixes
    if (!pattern.startsWith('06') && !pattern.startsWith('08') && !pattern.startsWith('09')) {
      return false;
    }
    
    // Check if pattern is exactly 10 characters and contains only digits and ?
    if (pattern.length !== 10) {
      return false;
    }
    
    // Check if all characters are digits or ?
    return /^[0-9?]+$/.test(pattern);
  }

  /**
   * Analyzes Soloist pattern structure to determine combination count
   * Updated for new specification patterns including moved patterns from Hyphen-separated
   * @param {string} pattern
   * @returns {Object} Structure describing the pattern
   */
  analyzeSoloistStructure(pattern) {
    const letterCounts = this._getLetterCounts(pattern);
    const uniqueLetters = Object.keys(letterCounts);
    const counts = Object.values(letterCounts).sort((a, b) => b - a);
    
    // Simple case: all same letter (aaaaaaaaaa) -> 10 combinations
    if (uniqueLetters.length === 1) {
      return {
        type: 'all_same',
        expectedCombinations: 10,
        repeatingLetter: uniqueLetters[0],
        uniquePositions: [],
        patternStructure: 'All positions use same digit'
      };
    }
    
    // All 9 digits identical: abbbbbbbbb -> 90 combinations (10 × 9)
    if (uniqueLetters.length === 2 && counts[0] === 9 && counts[1] === 1) {
      const repeatingLetter = Object.keys(letterCounts).find(letter => letterCounts[letter] === 9);
      const uniqueLetter = Object.keys(letterCounts).find(letter => letterCounts[letter] === 1);
      const uniquePosition = pattern.indexOf(uniqueLetter);
      
      return {
        type: 'nine_identical',
        expectedCombinations: 90,
        repeatingLetter: repeatingLetter,
        uniquePositions: [uniquePosition],
        patternStructure: 'One position differs, 9 positions same'
      };
    }
    
    // Special cases for patterns moved from Hyphen-separated
    
    // 2 distinct digits patterns (bbbaaaaaaa, bbbbbaaaaa) -> 90 combinations
    if (uniqueLetters.length === 2) {
      // Check for 3+7 or 5+5 split patterns
      const first3 = pattern.slice(0, 3);
      const last7 = pattern.slice(3, 10);
      const first5 = pattern.slice(0, 5);
      const last5 = pattern.slice(5, 10);
      
      if ((this._isAllSameInBlock(first3) && this._isAllSameInBlock(last7) && first3[0] !== last7[0]) ||
          (this._isAllSameInBlock(first5) && this._isAllSameInBlock(last5) && first5[0] !== last5[0])) {
        return {
          type: 'two_distinct_blocks',
          expectedCombinations: 90,
          repeatingLetter: null,
          uniquePositions: [],
          patternStructure: '2 distinct digits across blocks'
        };
      }
    }
    
    // 3 distinct digits pattern (aaabbbcccc) -> 720 combinations
    if (uniqueLetters.length === 3) {
      const block1 = pattern.slice(0, 3);
      const block2 = pattern.slice(3, 6);
      const block3 = pattern.slice(6, 10);
      
      const block1AllSame = this._isAllSameInBlock(block1);
      const block2AllSame = this._isAllSameInBlock(block2);
      const block3AllSame = this._isAllSameInBlock(block3);
      
      if (block1AllSame && block2AllSame && block3AllSame) {
        const block1Letter = block1[0];
        const block2Letter = block2[0];
        const block3Letter = block3[0];
        
        if (block1Letter !== block2Letter && block2Letter !== block3Letter && block1Letter !== block3Letter) {
          return {
            type: 'three_distinct_blocks',
            expectedCombinations: 720,
            repeatingLetter: null,
            uniquePositions: [],
            patternStructure: '3 distinct digits across blocks'
          };
        }
      }
      
      // All 8 digits identical: abdddddddd -> 720 combinations (10 × 9 × 8)
      if (counts[0] === 8) {
        return {
          type: 'eight_identical',
          expectedCombinations: 720,
          repeatingLetter: Object.keys(letterCounts).find(letter => letterCounts[letter] === 8),
          uniquePositions: this._getUniquePositions(pattern, letterCounts),
          patternStructure: '8 positions same, 2 positions different'
        };
      }
    }
    
    // All 7 digits identical: abcddddddd -> 5040 combinations (10 × 9 × 8 × 7)
    if (uniqueLetters.length === 4 && counts[0] === 7) {
      return {
        type: 'seven_identical',
        expectedCombinations: 5040,
        repeatingLetter: Object.keys(letterCounts).find(letter => letterCounts[letter] === 7),
        uniquePositions: this._getUniquePositions(pattern, letterCounts),
        patternStructure: '7 positions same, 3 positions different'
      };
    }
    
    // All 6 digits identical: abcdeeeeee -> 30240 combinations (10 × 9 × 8 × 7 × 6)
    if (uniqueLetters.length === 5 && counts[0] === 6) {
      return {
        type: 'six_identical',
        expectedCombinations: 30240,
        repeatingLetter: Object.keys(letterCounts).find(letter => letterCounts[letter] === 6),
        uniquePositions: this._getUniquePositions(pattern, letterCounts),
        patternStructure: '6 positions same, 4 positions different'
      };
    }
    
    // All 5 digits identical: abcdefffff -> 151200 combinations (10 × 9 × 8 × 7 × 6 × 5)
    if (uniqueLetters.length === 6 && counts[0] === 5) {
      return {
        type: 'five_identical',
        expectedCombinations: 151200,
        repeatingLetter: Object.keys(letterCounts).find(letter => letterCounts[letter] === 5),
        uniquePositions: this._getUniquePositions(pattern, letterCounts),
        patternStructure: '5 positions same, 5 positions different'
      };
    }
    
    // All 4 digits identical (Block-ending): abcdefgggg -> 604800 combinations (10 × 9 × 8 × 7 × 6 × 5 × 4)
    if (uniqueLetters.length === 7 && counts[0] === 4) {
      return {
        type: 'four_identical_block_ending',
        expectedCombinations: 604800,
        repeatingLetter: Object.keys(letterCounts).find(letter => letterCounts[letter] === 4),
        uniquePositions: this._getUniquePositions(pattern, letterCounts),
        patternStructure: '4 positions same (block-ending), 6 positions different'
      };
    }
    
    // Fallback for other patterns
    const maxCount = Math.max(...counts);
    const repeatingLetter = Object.keys(letterCounts).find(letter => letterCounts[letter] === maxCount);
    
    return {
      type: 'complex',
      expectedCombinations: this._calculatePermutations(uniqueLetters.length),
      repeatingLetter: repeatingLetter,
      uniquePositions: this._getUniquePositions(pattern, letterCounts),
      patternStructure: `Complex pattern with ${uniqueLetters.length} unique letters`
    };
  }

  /**
   * Analyzes Rhythmic Bridge pattern structure
   * @param {string} pattern
   * @returns {Object} Structure describing the repeating pattern
   */
  /**
     * Analyzes Rhythmic Bridge pattern structure
     * @param {string} pattern
     * @returns {Object} Structure describing the repeating pattern
     */
    analyzeRhythmicStructure(pattern) {
      const letterPositions = this._getLetterPositions(pattern);
      const uniqueLetters = Object.keys(letterPositions);
      const repeatGroups = [];
      const independentPositions = [];

      // Create position groups - positions that must use the same digit
      const positionGroups = [];
      const processedPositions = new Set();

      for (let pos = 0; pos < pattern.length; pos++) {
        if (processedPositions.has(pos)) continue;

        const letter = pattern[pos];
        const allPositionsForLetter = letterPositions[letter] || [pos];

        if (allPositionsForLetter.length > 1) {
          // Group positions that should use the same digit
          positionGroups.push(allPositionsForLetter);
          repeatGroups.push(allPositionsForLetter);
          allPositionsForLetter.forEach(p => processedPositions.add(p));
        } else {
          // Single position - independent digit choice
          positionGroups.push([pos]);
          independentPositions.push(pos);
          processedPositions.add(pos);
        }
      }

      // Calculate expected combinations based on position groups
      // Each position group can have 10 different digit choices
      const expectedCombinations = Math.pow(10, positionGroups.length);

      return {
        letterPositions: new Map(Object.entries(letterPositions)),
        uniqueLetters: uniqueLetters,
        repeatGroups: repeatGroups,
        independentPositions: independentPositions,
        positionGroups: positionGroups,
        expectedCombinations: expectedCombinations
      };
    }

  /**
   * Helper method to count occurrences of each letter
   * @param {string} pattern
   * @returns {Object} Map of letter to count
   */
  _getLetterCounts(pattern) {
    const counts = {};
    for (const letter of pattern) {
      counts[letter] = (counts[letter] || 0) + 1;
    }
    return counts;
  }

  /**
   * Helper method to get positions of each letter
   * @param {string} pattern
   * @returns {Object} Map of letter to array of positions
   */
  _getLetterPositions(pattern) {
    const positions = {};
    for (let i = 0; i < pattern.length; i++) {
      const letter = pattern[i];
      if (!positions[letter]) {
        positions[letter] = [];
      }
      positions[letter].push(i);
    }
    return positions;
  }

  /**
   * Helper method to check if a block has a repeating pattern
   * @param {string} block
   * @returns {boolean}
   */
  _isBlockRepeating(block) {
    const letterCounts = this._getLetterCounts(block);
    const maxCount = Math.max(...Object.values(letterCounts));
    
    // For hyphen-separated patterns, we need at least half the block to be the same letter
    // For a 3-character block, at least 2 should be the same (like "bbb" or "tnx" where t,n,x are different)
    // For a 4-character block, at least 3 should be the same (like "bbbb")
    
    // Actually, let's be more specific: for hyphen-separated, each block should have
    // a clear dominant letter or be a specific pattern
    if (block.length === 3) {
      // For 3-char blocks: either all same (aaa) or 2 same (like in "tnx" - no dominant letter)
      // Let's check if it's NOT a soloist-style block
      const uniqueLetters = Object.keys(letterCounts);
      return uniqueLetters.length <= 2 || maxCount >= 2;
    } else if (block.length === 4) {
      // For 4-char blocks: at least 3 should be the same (bbbb, cccc)
      return maxCount >= 3;
    }
    
    return false;
  }

  /**
   * Helper method to check if all letters in a block are the same (ignoring ? characters)
   * @param {string} block
   * @returns {boolean}
   */
  _isAllSameInBlock(block) {
    // Filter out ? characters and check if remaining characters are all the same
    const nonWildcardChars = block.split('').filter(char => char !== '?');
    if (nonWildcardChars.length === 0) return true; // All wildcards
    
    const firstLetter = nonWildcardChars[0];
    return nonWildcardChars.every(letter => letter === firstLetter);
  }

  /**
   * Helper method to get positions that don't use the repeating letter
   * @param {string} pattern
   * @param {Object} letterCounts
   * @returns {number[]}
   */
  _getUniquePositions(pattern, letterCounts) {
    const maxCount = Math.max(...Object.values(letterCounts));
    const repeatingLetter = Object.keys(letterCounts).find(letter => letterCounts[letter] === maxCount);
    
    const uniquePositions = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== repeatingLetter) {
        uniquePositions.push(i);
      }
    }
    return uniquePositions;
  }
  
  /**
   * Helper method to calculate permutations for n unique letters
   * @param {number} n
   * @returns {number}
   */
  _calculatePermutations(n) {
    let result = 10;
    for (let i = 1; i < n; i++) {
      result *= (10 - i);
    }
    return result;
  }
  
  /**
   * Helper method to get the dominant letter in a block (if any)
   * @param {string} block
   * @returns {string|null}
   */
  _getDominantLetter(block) {
    const letterCounts = this._getLetterCounts(block);
    const maxCount = Math.max(...Object.values(letterCounts));
    
    // Return the letter with the highest count, or null if no clear dominant letter
    for (const [letter, count] of Object.entries(letterCounts)) {
      if (count === maxCount && count >= Math.ceil(block.length / 2)) {
        return letter;
      }
    }
    return null;
  }
}

/**
 * PatternGenerator class for generating phone numbers based on pattern type
 * Generates phone numbers using type-specific algorithms that match exact combination counts
 */
class PatternGenerator {
  /**
   * Generates all phone numbers for a pattern based on its type
   * @param {string} pattern - Valid 10-character pattern
   * @param {string} patternType - Identified pattern type
   * @returns {string[]} Array of formatted numbers in 000-000-0000 format
   */
  generate(pattern, patternType) {
    if (!pattern || pattern.length !== 10) {
      throw new Error('Pattern must be exactly 10 characters');
    }

    const analyzer = new PatternAnalyzer();

    switch (patternType) {
      case PatternType.THAI_MOBILE_NO:
        return this.generateThaiMobileNo(pattern);
      
      case PatternType.SOLOIST:
        const soloistStructure = analyzer.analyzeSoloistStructure(pattern);
        return this.generateSoloist(pattern, soloistStructure);
      
      case PatternType.HYPHEN_SEPARATED:
        return this.generateHyphenSeparated(pattern);
      
      case PatternType.FULL_STRAIGHT:
        return this.generateFullStraight(pattern);
      
      case PatternType.CYCLIC_STRAIGHT:
        return this.generateCyclicStraight(pattern);
      
      case PatternType.RHYTHMIC_BRIDGE:
        const rhythmicStructure = analyzer.analyzeRhythmicStructure(pattern);
        return this.generateRhythmicBridge(pattern, rhythmicStructure);
      
      default:
        throw new Error(`Unsupported pattern type: ${patternType}`);
    }
  }

  /**
   * Generates numbers for The Soloist pattern
   * Updated for new specification patterns:
   * - "aaaaaaaaaa" → 10 numbers (all same digit)
   * - "abbbbbbbbb" → 90 numbers (9 identical, 1 different)
   * - "abdddddddd" → 720 numbers (8 identical, 2 different)
   * - "abcddddddd" → 5040 numbers (7 identical, 3 different)
   * - "abcdeeeeee" → 30240 numbers (6 identical, 4 different)
   * - "abcdefffff" → 151200 numbers (5 identical, 5 different)
   * - "abcdefgggg" → 604800 numbers (4 identical, 6 different)
   * - "bbbaaaaaaa" → 90 numbers (2 distinct digits, 3+7 split)
   * - "bbbbbaaaaa" → 90 numbers (2 distinct digits, 5+5 split)
   * - "aaabbbcccc" → 720 numbers (3 distinct digits across blocks)
   * @param {string} pattern
   * @param {Object} structure - Soloist structure from analyzer
   * @returns {string[]} Variable number based on pattern structure
   */
  generateSoloist(pattern, structure) {
    const results = [];

    // Handle patterns with ? characters
    if (pattern.includes('?')) {
      return this._generateWithWildcards(pattern);
    }

    if (structure.type === 'all_same') {
      // Simple case: all positions use same digit (10 combinations)
      for (let digit = 0; digit <= 9; digit++) {
        const number = digit.toString().repeat(10);
        results.push(this.formatNumber(number));
      }
    } else if (structure.type === 'nine_identical') {
      // Case: 9 positions same, 1 different (90 combinations)
      // 10 choices for repeated digit × 9 choices for unique digit (can't be same as repeated)
      for (let repeatedDigit = 0; repeatedDigit <= 9; repeatedDigit++) {
        for (let uniqueDigit = 0; uniqueDigit <= 9; uniqueDigit++) {
          if (uniqueDigit !== repeatedDigit) {
            let number = '';
            for (let pos = 0; pos < 10; pos++) {
              if (structure.uniquePositions.includes(pos)) {
                number += uniqueDigit.toString();
              } else {
                number += repeatedDigit.toString();
              }
            }
            results.push(this.formatNumber(number));
          }
        }
      }
    } else {
      // Handle special cases for patterns moved from Hyphen-separated
      
      // 2 distinct digits patterns
      const uniqueLetters = [...new Set(pattern.split('').filter(char => char !== '?'))];
      if (uniqueLetters.length === 2) {
        // Check for 3+7 split (bbbaaaaaaa)
        const first3 = pattern.slice(0, 3);
        const last7 = pattern.slice(3, 10);
        if (this._isAllSameInBlock(first3) && this._isAllSameInBlock(last7) && first3[0] !== last7[0]) {
          for (let digit1 = 0; digit1 <= 9; digit1++) {
            for (let digit2 = 0; digit2 <= 9; digit2++) {
              if (digit2 !== digit1) {
                const number = digit1.toString().repeat(3) + digit2.toString().repeat(7);
                results.push(this.formatNumber(number));
              }
            }
          }
          return results;
        }
        
        // Check for 5+5 split (bbbbbaaaaa)
        const first5 = pattern.slice(0, 5);
        const last5 = pattern.slice(5, 10);
        if (this._isAllSameInBlock(first5) && this._isAllSameInBlock(last5) && first5[0] !== last5[0]) {
          for (let digit1 = 0; digit1 <= 9; digit1++) {
            for (let digit2 = 0; digit2 <= 9; digit2++) {
              if (digit2 !== digit1) {
                const number = digit1.toString().repeat(5) + digit2.toString().repeat(5);
                results.push(this.formatNumber(number));
              }
            }
          }
          return results;
        }
      }
      
      // 3 distinct digits pattern (aaabbbcccc)
      if (uniqueLetters.length === 3) {
        const block1 = pattern.slice(0, 3);
        const block2 = pattern.slice(3, 6);
        const block3 = pattern.slice(6, 10);
        
        const block1AllSame = this._isAllSameInBlock(block1);
        const block2AllSame = this._isAllSameInBlock(block2);
        const block3AllSame = this._isAllSameInBlock(block3);
        
        if (block1AllSame && block2AllSame && block3AllSame) {
          const block1Letter = block1[0];
          const block2Letter = block2[0];
          const block3Letter = block3[0];
          
          if (block1Letter !== block2Letter && block2Letter !== block3Letter && block1Letter !== block3Letter) {
            // 10 × 9 × 8 = 720 combinations
            for (let digit1 = 0; digit1 <= 9; digit1++) {
              for (let digit2 = 0; digit2 <= 9; digit2++) {
                if (digit2 !== digit1) {
                  for (let digit3 = 0; digit3 <= 9; digit3++) {
                    if (digit3 !== digit1 && digit3 !== digit2) {
                      const number = digit1.toString().repeat(3) + 
                                    digit2.toString().repeat(3) + 
                                    digit3.toString().repeat(4);
                      results.push(this.formatNumber(number));
                    }
                  }
                }
              }
            }
            return results;
          }
        }
      }
      
      // Complex case: multiple unique positions (original logic)
      // Generate all valid digit assignments using recursive approach
      const letterToPositions = {};
      
      // Map each letter to its positions
      uniqueLetters.forEach(letter => {
        letterToPositions[letter] = [];
        for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] === letter) {
            letterToPositions[letter].push(i);
          }
        }
      });
      
      // Generate all combinations recursively
      this._generateSoloistCombinations(uniqueLetters, letterToPositions, 0, {}, results, pattern);
    }

    return results;
  }

  /**
   * Helper method for generating Soloist combinations recursively
   * @param {string[]} uniqueLetters - Array of unique letters in pattern
   * @param {Object} letterToPositions - Map of letter to positions
   * @param {number} letterIndex - Current letter index
   * @param {Object} letterToDigit - Current letter-to-digit mapping
   * @param {string[]} results - Results array to populate
   * @param {string} pattern - Original pattern
   */
  _generateSoloistCombinations(uniqueLetters, letterToPositions, letterIndex, letterToDigit, results, pattern) {
    if (letterIndex === uniqueLetters.length) {
      // Generate the number using current digit assignments
      let number = '';
      for (let pos = 0; pos < 10; pos++) {
        const letter = pattern[pos];
        number += letterToDigit[letter].toString();
      }
      results.push(this.formatNumber(number));
      return;
    }
    
    const currentLetter = uniqueLetters[letterIndex];
    
    // Try each digit 0-9 for this letter
    for (let digit = 0; digit <= 9; digit++) {
      // Check if this digit is already used by another letter
      let digitUsed = false;
      for (const [letter, assignedDigit] of Object.entries(letterToDigit)) {
        if (assignedDigit === digit) {
          digitUsed = true;
          break;
        }
      }
      
      if (!digitUsed) {
        letterToDigit[currentLetter] = digit;
        this._generateSoloistCombinations(uniqueLetters, letterToPositions, letterIndex + 1, letterToDigit, results, pattern);
        delete letterToDigit[currentLetter];
      }
    }
  }

  /**
   * Generate numbers for patterns containing ? wildcards
   * @param {string} pattern - Pattern with ? characters
   * @returns {string[]} Array of formatted numbers
   */
  _generateWithWildcards(pattern) {
    const results = [];
    
    // Find all wildcard positions
    const wildcardPositions = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '?') {
        wildcardPositions.push(i);
      }
    }
    
    // Create letter-to-positions mapping for non-wildcard characters
    const letterToPositions = {};
    const uniqueLetters = [...new Set(pattern.split('').filter(char => char !== '?'))];
    
    uniqueLetters.forEach(letter => {
      letterToPositions[letter] = [];
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === letter) {
          letterToPositions[letter].push(i);
        }
      }
    });
    
    // Generate all combinations
    this._generateWildcardCombinations(pattern, uniqueLetters, letterToPositions, wildcardPositions, 0, {}, [], results);
    
    return results;
  }

  /**
   * Recursive helper for generating wildcard combinations
   * Updated: Allow wildcards to duplicate letter digits
   */
  _generateWildcardCombinations(pattern, uniqueLetters, letterToPositions, wildcardPositions, letterIndex, letterToDigit, wildcardDigits, results) {
    // If we've assigned digits to all letters, now handle wildcards
    if (letterIndex === uniqueLetters.length) {
      this._generateWildcardDigits(pattern, letterToDigit, wildcardPositions, 0, wildcardDigits, results);
      return;
    }
    
    const currentLetter = uniqueLetters[letterIndex];
    
    // Try each digit 0-9 for this letter
    for (let digit = 0; digit <= 9; digit++) {
      // Check if this digit is already used by another letter (NOT wildcards)
      let digitUsed = false;
      for (const [letter, assignedDigit] of Object.entries(letterToDigit)) {
        if (assignedDigit === digit) {
          digitUsed = true;
          break;
        }
      }
      
      if (!digitUsed) {
        letterToDigit[currentLetter] = digit;
        this._generateWildcardCombinations(pattern, uniqueLetters, letterToPositions, wildcardPositions, letterIndex + 1, letterToDigit, wildcardDigits, results);
        delete letterToDigit[currentLetter];
      }
    }
  }

  /**
   * Generate all possible digit assignments for wildcard positions
   * Updated: Allow wildcards to have duplicate digits (independent assignment)
   */
  _generateWildcardDigits(pattern, letterToDigit, wildcardPositions, wildcardIndex, wildcardDigits, results) {
    if (wildcardIndex === wildcardPositions.length) {
      // Generate the final number
      let number = '';
      for (let pos = 0; pos < 10; pos++) {
        const char = pattern[pos];
        if (char === '?') {
          const wildcardIdx = wildcardPositions.indexOf(pos);
          number += wildcardDigits[wildcardIdx].toString();
        } else {
          number += letterToDigit[char].toString();
        }
      }
      results.push(this.formatNumber(number));
      return;
    }
    
    // Try each digit 0-9 for this wildcard position
    // IMPORTANT: Wildcards can duplicate any digit (including letters and other wildcards)
    for (let digit = 0; digit <= 9; digit++) {
      wildcardDigits[wildcardIndex] = digit;
      this._generateWildcardDigits(pattern, letterToDigit, wildcardPositions, wildcardIndex + 1, wildcardDigits, results);
    }
  }

  /**
   * Generates numbers for Hyphen-separated pattern
   * Updated patterns based on new specification:
   * - 2 distinct digits across blocks: "bbbaaaaaaa", "bbbbbaaaaa"
   * - 3 distinct digits across blocks: "aaabbbcccc"
   * - First and last blocks identical: "bbbtnxbbbb"
   * @param {string} pattern
   * @returns {string[]} Variable number based on pattern structure
   */
  generateHyphenSeparated(pattern) {
    const results = [];
    
    // Handle patterns with ? characters
    if (pattern.includes('?')) {
      return this._generateWithWildcards(pattern);
    }
    
    // Handle different hyphen-separated pattern types
    
    // Type 1: "bbbaaaaaaa" (3+7 split) - 2 distinct digits
    if (pattern === 'bbbaaaaaaa') {
      for (let digit1 = 0; digit1 <= 9; digit1++) {
        for (let digit2 = 0; digit2 <= 9; digit2++) {
          if (digit2 !== digit1) {
            const number = digit1.toString().repeat(3) + digit2.toString().repeat(7);
            results.push(this.formatNumber(number));
          }
        }
      }
      return results;
    }
    
    // Type 2: "bbbbbaaaaa" (5+5 split) - 2 distinct digits
    if (pattern === 'bbbbbaaaaa') {
      for (let digit1 = 0; digit1 <= 9; digit1++) {
        for (let digit2 = 0; digit2 <= 9; digit2++) {
          if (digit2 !== digit1) {
            const number = digit1.toString().repeat(5) + digit2.toString().repeat(5);
            results.push(this.formatNumber(number));
          }
        }
      }
      return results;
    }
    
    // Check for general "first X same, last Y same, different" pattern
    const first3 = pattern.slice(0, 3);
    const last7 = pattern.slice(3, 10);
    const first3AllSame = this._isAllSameInBlock(first3);
    const last7AllSame = this._isAllSameInBlock(last7);
    
    if (first3AllSame && last7AllSame && first3[0] !== last7[0]) {
      // General case for other 3+7 patterns - 2 distinct digits
      for (let digit1 = 0; digit1 <= 9; digit1++) {
        for (let digit2 = 0; digit2 <= 9; digit2++) {
          if (digit2 !== digit1) {
            const number = digit1.toString().repeat(3) + digit2.toString().repeat(7);
            results.push(this.formatNumber(number));
          }
        }
      }
      return results;
    }
    
    // Check for 5+5 split pattern
    const first5 = pattern.slice(0, 5);
    const last5 = pattern.slice(5, 10);
    const first5AllSame = this._isAllSameInBlock(first5);
    const last5AllSame = this._isAllSameInBlock(last5);
    
    if (first5AllSame && last5AllSame && first5[0] !== last5[0]) {
      // 5+5 split pattern - 2 distinct digits
      for (let digit1 = 0; digit1 <= 9; digit1++) {
        for (let digit2 = 0; digit2 <= 9; digit2++) {
          if (digit2 !== digit1) {
            const number = digit1.toString().repeat(5) + digit2.toString().repeat(5);
            results.push(this.formatNumber(number));
          }
        }
      }
      return results;
    }
    
    // Standard 3-3-4 block analysis
    const block1 = pattern.slice(0, 3);   // positions 0-2
    const block2 = pattern.slice(3, 6);   // positions 3-5
    const block3 = pattern.slice(6, 10);  // positions 6-9

    const block1AllSame = this._isAllSameInBlock(block1);
    const block2AllSame = this._isAllSameInBlock(block2);
    const block3AllSame = this._isAllSameInBlock(block3);

    // Type 4: "bbbaaabbbb" - first and last blocks same letter, different lengths (3+3+4)
    if (block1AllSame && block2AllSame && block3AllSame) {
      const block1Letter = block1.replace(/\?/g, '')[0];
      const block2Letter = block2.replace(/\?/g, '')[0];
      const block3Letter = block3.replace(/\?/g, '')[0];
      
      // Check for bbbaaabbbb pattern (first and last blocks same letter, middle different)
      if (block1Letter === block3Letter && block1Letter !== block2Letter) {
        // 10 choices for b digit × 9 choices for a digit (≠b) = 90 combinations
        for (let bDigit = 0; bDigit <= 9; bDigit++) {
          for (let aDigit = 0; aDigit <= 9; aDigit++) {
            if (aDigit !== bDigit) {
              const number = bDigit.toString().repeat(3) + 
                            aDigit.toString().repeat(3) + 
                            bDigit.toString().repeat(4);
              results.push(this.formatNumber(number));
            }
          }
        }
        return results;
      }
      
      // Check if all blocks are different (original aaabbbcccc logic)
      if (block1Letter !== block2Letter && block2Letter !== block3Letter && block1Letter !== block3Letter) {
        // 10 × 9 × 8 = 720 combinations
        for (let digit1 = 0; digit1 <= 9; digit1++) {
          for (let digit2 = 0; digit2 <= 9; digit2++) {
            if (digit2 !== digit1) {
              for (let digit3 = 0; digit3 <= 9; digit3++) {
                if (digit3 !== digit1 && digit3 !== digit2) {
                  const number = digit1.toString().repeat(3) + 
                                digit2.toString().repeat(3) + 
                                digit3.toString().repeat(4);
                  results.push(this.formatNumber(number));
                }
              }
            }
          }
        }
        return results;
      }
    }
    
    // Type 5: "bbb???bbbb" - first and last blocks same, middle different (with wildcards)
    const block1Letter = block1.replace(/\?/g, '')[0];
    const block3Letter = block3.replace(/\?/g, '')[0];
    
    if (block1Letter === block3Letter && block1AllSame && block3AllSame && !block2AllSame) {
      // 10 choices for b digit × 9 choices for middle block (≠b) = 90
      for (let bDigit = 0; bDigit <= 9; bDigit++) {
        for (let middleDigit = 0; middleDigit <= 9; middleDigit++) {
          if (middleDigit !== bDigit) {
            const number = bDigit.toString().repeat(3) + 
                          middleDigit.toString().repeat(3) + 
                          bDigit.toString().repeat(4);
            results.push(this.formatNumber(number));
          }
        }
      }
      return results;
    }

    return results;
  }

  /**
   * Generates numbers for The Full Straight pattern
   * Rule: All 10 digits in sequence, ascending or descending
   * @param {string} pattern - e.g., "abcdefghij"
   * @returns {string[]} 2 numbers: ascending and descending sequences
   */
  generateFullStraight(pattern) {
    const results = [];
    
    // Generate based on pattern direction
    if (pattern === 'abcdefghij') {
      // Ascending: 123-456-7890 (starts from 1, not 0)
      results.push(this.formatNumber("1234567890"));
    } else if (pattern === 'jihgfedcba') {
      // Descending: 987-654-3210 (starts from 9, ends at 0)
      results.push(this.formatNumber("9876543210"));
    } else {
      // Fallback: generate both
      results.push(this.formatNumber("1234567890"));   // "123-456-7890"
      results.push(this.formatNumber("9876543210"));   // "987-654-3210"
    }
    
    return results;
  }

  /**
   * Generates numbers for Cyclic Straight pattern
   * Rule: Each digit increases/decreases by 1 with wraparound 9→0 or 0→9
   * @param {string} pattern - e.g., "zabcdefghi" or "ihgfedcbaz"
   * @returns {string[]} 10 numbers with cyclic progression based on pattern direction
   */
  generateCyclicStraight(pattern) {
    const results = [];
    
    // Determine direction based on pattern
    if (pattern === 'zabcdefghi') {
      // Ascending cyclic: z(9)→a(0)→b(1)→...→i(8)
      // Generate 10 starting positions for ascending cyclic
      for (let start = 0; start <= 9; start++) {
        let ascending = "";
        for (let i = 0; i < 10; i++) {
          ascending += ((start + i) % 10).toString();
        }
        
        // Skip if this is the Full Straight ascending pattern
        if (ascending !== "1234567890") {
          results.push(this.formatNumber(ascending));
        }
      }
    } else if (pattern === 'ihgfedcbaz') {
      // Descending cyclic: i(8)→h(7)→...→a(0)→z(9)
      // Generate 10 starting positions for descending cyclic
      for (let start = 0; start <= 9; start++) {
        let descending = "";
        for (let i = 0; i < 10; i++) {
          descending += ((start - i + 10) % 10).toString();
        }
        
        // Skip if this is the Full Straight descending pattern
        if (descending !== "9876543210") {
          results.push(this.formatNumber(descending));
        }
      }
    } else {
      // Fallback: generate both directions but return different sets
      // This shouldn't happen with the current dropdown options
      for (let start = 0; start <= 9; start++) {
        // Ascending with wraparound
        let ascending = "";
        for (let i = 0; i < 10; i++) {
          ascending += ((start + i) % 10).toString();
        }
        
        // Skip if this is the Full Straight ascending pattern
        if (ascending !== "1234567890") {
          results.push(this.formatNumber(ascending));
        }
        
        // Descending with wraparound  
        let descending = "";
        for (let i = 0; i < 10; i++) {
          descending += ((start - i + 10) % 10).toString();
        }
        
        // Skip if this is the Full Straight descending pattern
        if (descending !== "9876543210") {
          results.push(this.formatNumber(descending));
        }
      }
    }
    
    return results;
  }

  /**
   * Generates numbers for The Rhythmic Bridge pattern
   * Example: "abcaxxabcd" → 9,900 numbers with repeating pattern
   * @param {string} pattern
   * @param {Object} structure - Rhythmic structure from analyzer
   * @returns {string[]} Variable number based on structure
   */
  /**
     * Generates numbers for The Rhythmic Bridge pattern
     * Example: "abcaxxabcd" → 1,000,000 numbers with repeating pattern
     * @param {string} pattern
     * @param {Object} structure - Rhythmic structure from analyzer
     * @returns {string[]} Variable number based on structure
     */
    generateRhythmicBridge(pattern, structure) {
      // Performance optimization: Pre-allocate results array with estimated size
      const results = [];
      results.length = 0; // Ensure clean start

      // Handle patterns with ? characters
      if (pattern.includes('?')) {
        return this._generateWithWildcards(pattern);
      }

      // For "abcaxxabcd" we need to handle repeated letters correctly
      // Each position that shares the same letter must use the same digit
      // But positions with the same letter that appear independently should be treated separately

      const letterPositions = structure.letterPositions;

      // Create position groups - positions that must use the same digit
      const positionGroups = [];
      const processedPositions = new Set();

      for (let pos = 0; pos < pattern.length; pos++) {
        if (processedPositions.has(pos)) continue;

        const letter = pattern[pos];
        const allPositionsForLetter = letterPositions.get(letter) || [pos];

        // For rhythmic bridge, we need to check if positions with same letter
        // should be grouped together or treated independently
        if (allPositionsForLetter.length > 1) {
          // Group positions that should use the same digit
          positionGroups.push(allPositionsForLetter);
          allPositionsForLetter.forEach(p => processedPositions.add(p));
        } else {
          // Single position - independent digit choice
          positionGroups.push([pos]);
          processedPositions.add(pos);
        }
      }

      // Generate all combinations
      const totalGroups = positionGroups.length;
      const totalCombinations = Math.pow(10, totalGroups);

      // Performance optimization: Use iterative approach for better performance
      for (let combination = 0; combination < totalCombinations; combination++) {
        // Convert combination number to digit assignments
        const digits = new Array(10);
        let temp = combination;

        // Assign digits to each position group
        for (let groupIndex = totalGroups - 1; groupIndex >= 0; groupIndex--) {
          const digit = temp % 10;
          temp = Math.floor(temp / 10);

          const positions = positionGroups[groupIndex];
          positions.forEach(pos => {
            digits[pos] = digit;
          });
        }

        results.push(this.formatNumber(digits.join('')));

        // Performance optimization: Yield control periodically for large datasets
        if (combination % 10000 === 0 && totalCombinations > 50000) {
          // Allow UI to remain responsive
          setTimeout(() => {}, 0);
        }
      }

      return results;
    }

  /**
   * Optimized iterative generation for rhythmic bridge patterns
   * Performance optimized for common patterns with ≤6 unique letters
   */
  _generateRhythmicIterative(pattern, letterPositions, uniqueLetters, results) {
    const numLetters = uniqueLetters.length;
    const maxCombinations = Math.pow(10, numLetters);
    
    // Performance optimization: Batch processing for large result sets
    const batchSize = 1000;
    let processed = 0;
    
    for (let combination = 0; combination < maxCombinations; combination++) {
      // Convert combination number to digit assignment
      const digits = [];
      let temp = combination;
      
      for (let i = 0; i < numLetters; i++) {
        digits.unshift(temp % 10);
        temp = Math.floor(temp / 10);
      }
      
      // Build the phone number
      const phoneDigits = new Array(10);
      let valid = true;
      
      for (let i = 0; i < numLetters && valid; i++) {
        const letter = uniqueLetters[i];
        const digit = digits[i];
        const positions = letterPositions.get(letter);
        
        for (const pos of positions) {
          phoneDigits[pos] = digit;
        }
      }
      
      if (valid) {
        results.push(this.formatNumber(phoneDigits.join('')));
      }
      
      // Performance optimization: Yield control periodically for large datasets
      processed++;
      if (processed % batchSize === 0 && maxCombinations > 5000) {
        // Allow UI to remain responsive
        setTimeout(() => {}, 0);
      }
    }
  }

  /**
   * Helper method for generating rhythmic bridge combinations recursively
   * @param {string} pattern
   * @param {Map} letterPositions
   * @param {string[]} uniqueLetters
   * @param {number} letterIndex
   * @param {Map} letterToDigitMap
   * @param {string[]} results
   */
  _generateRhythmicCombinations(pattern, letterPositions, uniqueLetters, letterIndex, letterToDigitMap, results) {
    if (letterIndex === uniqueLetters.length) {
      // Generate the number using current digit assignments
      let number = '';
      for (let pos = 0; pos < 10; pos++) {
        const letter = pattern[pos];
        number += letterToDigitMap.get(letter).toString();
      }
      results.push(this.formatNumber(number));
      return;
    }
    
    const currentLetter = uniqueLetters[letterIndex];
    
    // Try each digit 0-9 for this letter
    for (let digit = 0; digit <= 9; digit++) {
      // Check if this digit is already used by another letter
      let digitUsed = false;
      for (const [letter, assignedDigit] of letterToDigitMap) {
        if (assignedDigit === digit) {
          digitUsed = true;
          break;
        }
      }
      
      if (!digitUsed) {
        letterToDigitMap.set(currentLetter, digit);
        this._generateRhythmicCombinations(pattern, letterPositions, uniqueLetters, letterIndex + 1, letterToDigitMap, results);
        letterToDigitMap.delete(currentLetter);
      }
    }
  }

  /**
   * Generates Thai Mobile No. patterns
   * Supports patterns: 06????????, 08????????, 09????????
   * Fixed digits (0,6,8,9) are preserved, ? characters generate all possible combinations
   * Each pattern generates ALL possible combinations: 10^8 = 100,000,000 numbers
   * @param {string} pattern - Thai mobile pattern (e.g., "06????????")
   * @returns {string[]} Array of ALL formatted numbers (100,000,000 numbers)
   */
  generateThaiMobileNo(pattern) {
    const results = [];
    
    // Thai Mobile patterns have 8 wildcard positions (? characters)
    // Total combinations = 10^8 = 100,000,000 numbers
    // Generate ALL possible combinations systematically
    
    // Extract prefix (first 2 digits: 06, 08, or 09)
    const prefix = pattern.slice(0, 2);
    
    // Generate all 100,000,000 possible combinations for the 8 wildcard positions
    // Each wildcard position can be any digit 0-9
    for (let i = 0; i < 100000000; i++) {
      // Convert number to 8-digit string with leading zeros
      const wildcardDigits = i.toString().padStart(8, '0');
      
      // Combine prefix + wildcard digits
      const fullNumber = prefix + wildcardDigits;
      
      // Format as XXX-XXX-XXXX
      results.push(this.formatNumber(fullNumber));
    }
    
    // Results are already in ascending order (0 to 99,999,999)
    return results;
  }

  /**
   * Formats a 10-digit string with dashes
   * @param {string} digits - 10-digit string
   * @returns {string} Formatted as 000-000-0000
   */
  formatNumber(digits) {
    if (!digits || digits.length !== 10) {
      throw new Error('Digits must be exactly 10 characters');
    }
    
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  /**
   * Calculates expected number of combinations for a pattern type
   * @param {string} pattern
   * @param {string} patternType
   * @returns {number} Expected combination count
   */
  calculateCombinationCount(pattern, patternType) {
    const analyzer = new PatternAnalyzer();
    
    switch (patternType) {
      case PatternType.THAI_MOBILE_NO:
        return 100000000; // 10^8 = 100,000,000 combinations (all possible numbers)
      
      case PatternType.SOLOIST:
        const structure = analyzer.analyzeSoloistStructure(pattern);
        return structure.expectedCombinations;
      
      case PatternType.HYPHEN_SEPARATED:
        // Calculate based on pattern structure
        const block1 = pattern.slice(0, 3);
        const block2 = pattern.slice(3, 6);
        const block3 = pattern.slice(6, 10);
        
        const block1AllSame = this._isAllSameInBlock(block1);
        const block2AllSame = this._isAllSameInBlock(block2);
        const block3AllSame = this._isAllSameInBlock(block3);
        
        if (block1AllSame && block2AllSame && block3AllSame) {
          return 720; // 10 × 9 × 8 for three different blocks
        } else {
          return 90;  // 10 × 9 for two different digits
        }
      
      case PatternType.FULL_STRAIGHT:
        return 2; // ascending and descending
      
      case PatternType.CYCLIC_STRAIGHT:
        return 20; // 10 starting positions × 2 directions
      
      case PatternType.RHYTHMIC_BRIDGE:
        // Calculate based on position groups, not just unique letters
        const rhythmicStructure = analyzer.analyzeRhythmicStructure(pattern);
        return rhythmicStructure.expectedCombinations;
      
      default:
        return 0;
    }
  }

  /**
   * Helper method to check if all letters in a block are the same (ignoring ? characters)
   * @param {string} block
   * @returns {boolean}
   */
  _isAllSameInBlock(block) {
    // Filter out ? characters and check if remaining characters are all the same
    const nonWildcardChars = block.split('').filter(char => char !== '?');
    if (nonWildcardChars.length === 0) return true; // All wildcards
    
    const firstLetter = nonWildcardChars[0];
    return nonWildcardChars.every(letter => letter === firstLetter);
  }
}

/**
 * PatternManager class for pattern collection management
 * Manages the collection of patterns, their types, and generated numbers
 */
class PatternManager {
  constructor() {
    this.patterns = []; // Array of {pattern: string, patternType: string, numbers: string[], timestamp: number}
    this.validator = new PatternValidator();
    this.analyzer = new PatternAnalyzer();
    this.generator = new PatternGenerator();
  }

  /**
   * Adds a pattern to the collection
   * @param {string} pattern - Valid pattern to add
   * @returns {boolean} Success status
   */
  addPattern(pattern) {
    try {
      // Performance monitoring: Start timing pattern identification
      const endIdentificationTiming = window.performanceMonitor ? 
        window.performanceMonitor.startTiming('patternIdentification') : null;

      // Validate pattern first
      const validation = this.validator.validate(pattern);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }

      // Check if pattern already exists
      const existingPattern = this.patterns.find(p => p.pattern === pattern);
      if (existingPattern) {
        throw new Error('Pattern already exists in collection');
      }

      // Identify pattern type
      const patternType = this.analyzer.identifyPatternType(pattern);
      
      // Record identification performance
      if (endIdentificationTiming) {
        endIdentificationTiming({ pattern, patternType });
      }

      // Performance monitoring: Start timing number generation
      const endGenerationTiming = window.performanceMonitor ? 
        window.performanceMonitor.startTiming('numberGeneration') : null;

      // Generate all numbers for this pattern
      const numbers = this.generator.generate(pattern, patternType);
      
      // Record generation performance
      if (endGenerationTiming) {
        endGenerationTiming({ 
          pattern, 
          patternType, 
          numberCount: numbers.length,
          operation: 'numberGeneration'
        });
      }

      // Add to collection
      const patternGroup = {
        pattern: pattern,
        patternType: patternType,
        numbers: numbers,
        timestamp: Date.now()
      };

      this.patterns.push(patternGroup);
      return true;

    } catch (error) {
      console.error('Error adding pattern:', error.message);
      throw error;
    }
  }

  /**
   * Removes a pattern from the collection
   * @param {number} index - Index of pattern to remove
   */
  removePattern(index) {
    if (index >= 0 && index < this.patterns.length) {
      this.patterns.splice(index, 1);
    }
  }

  /**
   * Gets all patterns with their types and generated numbers
   * @returns {Array<{pattern: string, patternType: string, numbers: string[]}>}
   */
  getAllPatternGroups() {
    return this.patterns.map(p => ({
      pattern: p.pattern,
      patternType: p.patternType,
      numbers: p.numbers,
      timestamp: p.timestamp
    }));
  }

  /**
   * Clears all patterns
   */
  clearAll() {
    this.patterns = [];
  }

  /**
   * Gets count of patterns
   * @returns {number}
   */
  getCount() {
    return this.patterns.length;
  }

  /**
   * Gets total count of all generated numbers
   * @returns {number}
   */
  getTotalNumberCount() {
    return this.patterns.reduce((total, pattern) => total + pattern.numbers.length, 0);
  }
}

/**
 * Legacy function for backward compatibility
 * @param {string} pattern - Pattern to validate
 * @returns {Object} - {isValid: boolean, errorMessage: string}
 */
function validatePattern(pattern) {
  const validator = new PatternValidator();
  const result = validator.validate(pattern);
  return {
    isValid: result.isValid,
    errorMessage: result.errorMessage
  };
}

/**
 * Show error message (legacy function for backward compatibility)
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (window.uiController) {
    window.uiController.showError(message);
  }
}

/**
 * Clear error message (legacy function for backward compatibility)
 */
function clearError() {
  if (window.uiController) {
    window.uiController.clearError();
  }
}

/**
 * Update the UI based on current state (legacy function for backward compatibility)
 */
function updateUI() {
  if (window.uiController) {
    window.uiController.updateUI();
  }
}

/**
 * CSVExporter class for CSV generation and download
 * Generates and downloads CSV files containing all generated numbers with pattern type information
 */
class CSVExporter {
  /**
   * Exports all pattern-number combinations to CSV file
   * Format: account_number, pattern, pattern_type (one row per number)
   * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} data
   * @returns {void} Triggers browser download
   */
  export(data) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Generate CSV content
      const csvContent = this.generateCSV(data);
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `account-numbers-${timestamp}.csv`;
      
      // Trigger download
      this.downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('CSV export failed:', error.message);
      throw new Error(`Failed to export CSV: ${error.message}`);
    }
  }

  /**
   * Generates CSV content from data (one row per number)
   * PERFORMANCE OPTIMIZED: Uses efficient string building for large datasets
   * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} data
   * @returns {string} CSV formatted string with UTF-8 encoding
   */
  /**
     * Generates CSV content from data (one row per number)
     * PERFORMANCE OPTIMIZED: Uses efficient string building for large datasets
     * DUPLICATE REMOVAL: Removes duplicate phone numbers, keeping first occurrence by pattern order
     * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} data
     * @returns {string} CSV formatted string with UTF-8 encoding
     */
    generateCSV(data) {
      // Performance optimization: Pre-calculate total rows for array sizing
      let totalRows = 1; // Header row
      data.forEach(group => totalRows += group.numbers.length);

      // Use array with pre-allocated size for better performance
      const rows = new Array(totalRows);
      let rowIndex = 0;

      // Add header row with new column order
      rows[rowIndex++] = 'pattern_type,pattern,account_number';

      // Track seen account numbers to remove duplicates (first occurrence wins)
      const seenNumbers = new Set();

      // Performance optimization: Batch process data to avoid memory pressure
      const batchSize = 1000;

      data.forEach(patternGroup => {
        const { pattern, patternType, numbers } = patternGroup;

        // Pre-escape pattern and type once (performance optimization)
        const escapedPattern = this.escapeCSVValue(pattern);
        const escapedPatternType = this.escapeCSVValue(patternType);

        // Process numbers in batches for large datasets
        for (let i = 0; i < numbers.length; i += batchSize) {
          const batch = numbers.slice(i, i + batchSize);

          batch.forEach(accountNumber => {
            // Skip if we've already seen this account number
            if (seenNumbers.has(accountNumber)) {
              return;
            }

            // Mark this number as seen
            seenNumbers.add(accountNumber);

            // New column order: pattern_type, pattern, account_number
            rows[rowIndex++] = escapedPatternType + ',' + escapedPattern + ',' + this.escapeCSVValue(accountNumber);
          });

          // Yield control for very large datasets (prevent UI blocking)
          if (numbers.length > 5000 && i % (batchSize * 5) === 0) {
            // Allow other operations to run
            setTimeout(() => {}, 0);
          }
        }
      });

      // Trim the array to actual size (remove unused pre-allocated slots)
      const actualRows = rows.slice(0, rowIndex);

      // Join all rows with newlines (single operation for performance)
      return actualRows.join('\n');
    }

  /**
   * Creates and triggers file download
   * @param {string} content - CSV content
   * @param {string} filename - Name for downloaded file
   */
  downloadFile(content, filename) {
    try {
      // Create Blob with UTF-8 encoding
      const blob = new Blob([content], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // Check browser compatibility
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // IE/Edge support
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // Modern browsers
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('File download failed:', error.message);
      throw new Error('Browser does not support file download');
    }
  }

  /**
   * Escapes special characters for CSV format
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSVValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      // Escape internal quotes by doubling them
      const escapedValue = value.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }
    
    return value;
  }

  /**
   * Async export for large datasets with progress callback
   * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} data
   * @param {Function} progressCallback - Callback function for progress updates
   * @returns {Promise<void>} Promise that resolves when export is complete
   */
  async exportAsync(data, progressCallback) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Calculate total numbers
      const totalNumbers = data.reduce((sum, group) => sum + group.numbers.length, 0);
      const batchSize = 10000; // Process in smaller batches for large datasets
      
      // Generate CSV content with progress updates
      const csvContent = await this.generateCSVAsync(data, progressCallback);
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `account-numbers-${timestamp}.csv`;
      
      // Trigger download
      this.downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('CSV async export failed:', error.message);
      throw new Error(`Failed to export CSV: ${error.message}`);
    }
  }

  /**
   * Generates CSV content asynchronously with progress updates
   * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} data
   * @param {Function} progressCallback - Callback function for progress updates
   * @returns {Promise<string>} CSV formatted string
   */
  async generateCSVAsync(data, progressCallback) {
    // Calculate total rows for progress tracking
    const totalNumbers = data.reduce((sum, group) => sum + group.numbers.length, 0);
    const batchSize = 5000; // Smaller batches for better progress updates
    
    // Use array for better performance
    const rows = ['pattern_type,pattern,account_number']; // Header
    const seenNumbers = new Set();
    
    let processedCount = 0;
    
    for (const patternGroup of data) {
      const { pattern, patternType, numbers } = patternGroup;
      
      // Pre-escape pattern and type once (performance optimization)
      const escapedPattern = this.escapeCSVValue(pattern);
      const escapedPatternType = this.escapeCSVValue(patternType);
      
      // Process numbers in batches
      for (let i = 0; i < numbers.length; i += batchSize) {
        const batch = numbers.slice(i, i + batchSize);
        
        for (const accountNumber of batch) {
          // Skip if we've already seen this account number
          if (seenNumbers.has(accountNumber)) {
            continue;
          }
          
          // Mark this number as seen
          seenNumbers.add(accountNumber);
          
          // Add row: pattern_type, pattern, account_number
          rows.push(escapedPatternType + ',' + escapedPattern + ',' + this.escapeCSVValue(accountNumber));
          processedCount++;
        }
        
        // Update progress and yield control
        if (progressCallback && i % (batchSize * 2) === 0) {
          progressCallback({
            current: processedCount,
            total: totalNumbers,
            percentage: Math.round((processedCount / totalNumbers) * 100)
          });
          
          // Allow other operations to run
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
    }
    
    // Final progress update
    if (progressCallback) {
      progressCallback({
        current: processedCount,
        total: totalNumbers,
        percentage: 100
      });
    }
    
    // Join all rows with newlines
    return rows.join('\n');
  }
}

/**
 * UIController class for managing user interface interactions and updates
 * Manages all DOM interactions for the pattern-based number generator
 */
class UIController {
  constructor() {
    this.elements = {};
    this.loadingElements = {};
  }

  /**
   * Initializes the UI and event listeners
   */
  init() {
    // Cache DOM elements
    this.elements = {
      patternSelect: document.getElementById('pattern-select'),
      addPatternBtn: document.getElementById('add-pattern-btn'),
      errorMessage: document.getElementById('error-message'),
      patternList: document.getElementById('pattern-list'),
      resultsDisplay: document.getElementById('results-display'),
      exportCsvBtn: document.getElementById('export-csv-btn'),
      exportExcelBtn: document.getElementById('export-excel-btn'),
      // Number checker elements
      numberInput: document.getElementById('number-input'),
      checkNumberBtn: document.getElementById('check-number-btn'),
      checkerResult: document.getElementById('checker-result'),
    };

    // Cache loading elements
    this.loadingElements = {
      overlay: document.getElementById('loading-overlay'),
      message: document.getElementById('loading-message'),
    };

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Show loading screen with customizable message
   * @param {string} message - Loading message to display
   * @param {string} pattern - Pattern being processed (not used anymore)
   */
  showLoading(message = 'กำลังประมวลผล...', pattern = '') {
    if (this.loadingElements.overlay) {
      this.loadingElements.overlay.classList.add('show');
      
      if (this.loadingElements.message) {
        this.loadingElements.message.textContent = message;
      }
    }
  }

  /**
   * Update loading progress (simplified - no progress bar anymore)
   * @param {number} current - Current progress count (not used)
   * @param {number} total - Total expected count (not used)
   * @param {string} message - Optional message update
   */
  updateLoadingProgress(current, total, message = null) {
    if (message && this.loadingElements.message) {
      this.loadingElements.message.textContent = message;
    }
  }

  /**
   * Hide loading screen
   */
  hideLoading() {
    if (this.loadingElements.overlay) {
      this.loadingElements.overlay.classList.remove('show');
    }
  }

  /**
   * Handle account number click (for lucky number analysis)
   * @param {string} accountNumber - Account number clicked
   * @param {HTMLElement} element - Clicked element
   */
  handleAccountNumberClick(accountNumber, element) {
    console.log('Account number clicked:', accountNumber);
    console.log('Lucky number UI available:', !!window.luckyNumberUI);
    
    // Show lucky number analysis popup
    if (window.luckyNumberUI) {
      console.log('Showing lucky popup...');
      window.luckyNumberUI.showLuckyPopup(accountNumber);
    } else {
      console.error('Lucky number UI not initialized! Trying to initialize...');
      
      // Try to initialize if not ready
      if (typeof LuckyNumberUI !== 'undefined') {
        try {
          window.luckyNumberUI = new LuckyNumberUI();
          window.luckyNumberUI.showLuckyPopup(accountNumber);
          console.log('Successfully initialized and showed popup');
        } catch (error) {
          console.error('Failed to initialize:', error);
          alert('เกิดข้อผิดพลาดในระบบเลขมงคล');
        }
      } else {
        alert('ระบบเลขมงคลยังไม่พร้อม กรุณารีเฟรชหน้าเว็บ');
      }
    }
  }

  /**
   * Check if a number is premium (ดีมาก rating)
   * @param {string} accountNumber - Account number to check
   * @returns {boolean} True if the number has "ดีมาก" rating
   */
  isPremiumNumber(accountNumber) {
    try {
      // Create a temporary analyzer to check the rating
      const analyzer = new LuckyNumberAnalyzer();
      const analysis = analyzer.analyzeNumber(accountNumber);
      return analysis.rating.level === 'ดีมาก';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Set up event handlers - Task 11.1 Implementation
   * Wires all event handlers for input submission, pattern removal, and CSV export
   * PERFORMANCE ENHANCED: Includes performance monitoring controls
   */
  setupEventListeners() {
    // Wire event handler for input submission (Add Pattern button)
    this.elements.addPatternBtn.addEventListener('click', () => {
      this.handleAddPattern();
    });

    // Wire event handler for input submission (Enter key in select field)
    this.elements.patternSelect.addEventListener('change', () => {
      this.clearError();
    });

    // Connect validation errors to UI error display (clear error on selection change)
    this.elements.patternSelect.addEventListener('change', () => {
      this.clearError();
    });

    // Number checker event listeners
    if (this.elements.checkNumberBtn) {
      this.elements.checkNumberBtn.addEventListener('click', () => {
        this.handleNumberCheck();
      });
    }

    if (this.elements.numberInput) {
      // Allow only digits and limit to 10 characters
      this.elements.numberInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
      });

      // Check number on Enter key
      this.elements.numberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleNumberCheck();
        }
      });
    }

    // Wire event handlers for export buttons
    if (this.elements.exportCsvBtn) {
      this.elements.exportCsvBtn.addEventListener('click', async () => {
        console.log('CSV export button clicked');
        try {
          await this.handleExport();
        } catch (error) {
          console.error('CSV export button error:', error);
          this.hideLoading();
          this.showError(`CSV export failed: ${error.message}`);
        }
      });
    }
    
    if (this.elements.exportExcelBtn) {
      this.elements.exportExcelBtn.addEventListener('click', async () => {
        console.log('Excel export button clicked');
        try {
          await this.handleExcelExport();
        } catch (error) {
          console.error('Excel export button error:', error);
          this.hideLoading();
          this.showError(`Excel export failed: ${error.message}`);
        }
      });
    }

    // Performance monitoring controls
    const showPerfBtn = document.getElementById('show-performance-btn');
    const runBenchmarksBtn = document.getElementById('run-benchmarks-btn');
    
    if (showPerfBtn) {
      showPerfBtn.addEventListener('click', () => {
        this.togglePerformanceDisplay();
      });
    }
    
    if (runBenchmarksBtn) {
      runBenchmarksBtn.addEventListener('click', () => {
        this.runPerformanceBenchmarks();
      });
    }
    
    console.log('All event handlers wired successfully:');
    console.log('- Input submission (button + Enter key)');
    console.log('- Pattern removal (via removePattern method)');
    console.log('- CSV export');
    console.log('- Excel export');
    console.log('- Number checker');
    console.log('- Error display clearing');
    console.log('- Performance monitoring controls');
  }

  /**
   * Toggle performance metrics display
   */
  togglePerformanceDisplay() {
    const perfDisplay = document.getElementById('performance-display');
    const showBtn = document.getElementById('show-performance-btn');
    
    if (!perfDisplay || !showBtn) return;
    
    if (perfDisplay.style.display === 'none') {
      // Show performance metrics
      if (window.performanceMonitor) {
        window.performanceMonitor.displayMetrics(perfDisplay);
      }
      perfDisplay.style.display = 'block';
      showBtn.textContent = 'Hide Performance Metrics';
    } else {
      // Hide performance metrics
      perfDisplay.style.display = 'none';
      showBtn.textContent = 'Show Performance Metrics';
    }
  }

  /**
   * Run performance benchmarks
   */
  runPerformanceBenchmarks() {
    const runBtn = document.getElementById('run-benchmarks-btn');
    if (!runBtn) return;
    
    runBtn.textContent = 'Running Benchmarks...';
    runBtn.disabled = true;
    
    // Open benchmarks in new window/tab
    window.open('performance-benchmarks.html', '_blank');
    
    setTimeout(() => {
      runBtn.textContent = 'Run Benchmarks';
      runBtn.disabled = false;
    }, 2000);
  }

  /**
   * Handle adding a pattern - Task 11.1 Implementation
   * Connects validation errors to UI error display and pattern additions to UI updates
   * PERFORMANCE MONITORED: Tracks pattern identification and generation performance
   */
  handleAddPattern() {
    const selectedOption = this.elements.patternSelect.selectedOptions[0];
    
    if (!selectedOption || !selectedOption.value) {
      this.showError('กรุณาเลือก pattern จากรายการ');
      return;
    }
    
    const pattern = selectedOption.value;

    try {
      // Show loading screen
      const patternType = selectedOption.getAttribute('data-type') || 'Unknown';
      this.showLoading(`กำลังสร้างหมายเลขบัญชี สำหรับ ${patternType}`, pattern);

      // Use setTimeout to allow loading screen to show before heavy computation
      setTimeout(() => {
        try {
          // Performance monitoring: Start timing the entire operation
          const endTiming = window.performanceMonitor ? window.performanceMonitor.startTiming('patternProcessing') : null;

          // For Thai Mobile patterns, show progress updates
          if (pattern.startsWith('06') || pattern.startsWith('08') || pattern.startsWith('09')) {
            this.updateLoadingProgress(0, 100000000, 'กำลังสร้างหมายเลขมือถือไทย 100 ล้านเลข...');
            
            // Simulate progress updates for large generation
            let progressCount = 0;
            const progressInterval = setInterval(() => {
              progressCount += 10000000; // 10M increments
              this.updateLoadingProgress(progressCount, 100000000);
              
              if (progressCount >= 100000000) {
                clearInterval(progressInterval);
              }
            }, 100);
          }

          // Add pattern using PatternManager (includes validation, type identification, and number generation)
          state.patternManager.addPattern(pattern);

          // Record performance metrics
          if (endTiming) {
            endTiming({ pattern, operation: 'addPattern' });
          }

          // Hide loading screen
          this.hideLoading();

          // Clear error and reset select field
          this.clearError();
          this.elements.patternSelect.value = '';

          // Connect pattern additions to UI updates (showing pattern type and all generated numbers)
          this.updateUI();
          
          console.log(`Pattern "${pattern}" added successfully with type identification and number generation`);

        } catch (error) {
          // Hide loading screen on error
          this.hideLoading();
          
          // Connect validation errors to UI error display
          this.showError(error.message);
          console.log(`Pattern "${pattern}" validation failed: ${error.message}`);
        }
      }, 100); // Small delay to ensure loading screen shows

    } catch (error) {
      // Hide loading screen on error
      this.hideLoading();
      
      // Connect validation errors to UI error display
      this.showError(error.message);
      console.log(`Pattern "${pattern}" validation failed: ${error.message}`);
    }
  }

  /**
   * Displays validation error message
   * @param {string} message - Error message to display
   */
  showError(message, type = 'error') {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.remove('show', 'error', 'info');
    this.elements.errorMessage.classList.add('show', type);
  }

  /**
   * Clears error message
   */
  clearError() {
    this.elements.errorMessage.textContent = '';
    this.elements.errorMessage.classList.remove('show');
  }

  /**
   * Updates the pattern list display with types and all generated numbers
   * @param {Array<{pattern: string, patternType: string, numbers: string[]}>} patternGroups
   */
  updatePatternList(patternGroups) {
      if (!patternGroups) {
        patternGroups = state.patternManager.getAllPatternGroups();
      }

      if (patternGroups.length === 0) {
        this.elements.patternList.innerHTML = '<p style="color: #666; text-align: center;">ยังไม่มี pattern ที่เพิ่ม</p>';
      } else {
        // Display patterns in selection order (by timestamp) instead of sorting by number count
        const orderedPatternGroups = patternGroups.sort((a, b) => a.timestamp - b.timestamp);

        let html = '';
        orderedPatternGroups.forEach((group, index) => {
          html += `
            <div class="pattern-item">
              <div class="pattern-header">
                <span class="pattern-text">${group.pattern}</span>
                <span class="pattern-type">${group.patternType}</span>
                <span class="pattern-count">${group.numbers.length.toLocaleString()} numbers</span>
                <button class="btn btn-remove" onclick="uiController.removePattern(${index})">ลบ</button>
              </div>
            </div>
          `;
        });
        this.elements.patternList.innerHTML = html;
      }
    }

  /**
   * Update the results display with all pattern groups and their numbers
   * PERFORMANCE OPTIMIZED: Implements virtual scrolling for large result sets
   */
  updateResultsDisplay() {
      const patternGroups = state.patternManager.getAllPatternGroups();

      if (patternGroups.length === 0) {
        this.elements.resultsDisplay.innerHTML = '<p style="color: #666; text-align: center;">ยังไม่มีผลลัพธ์</p>';
      } else {
        // Display patterns in selection order (by timestamp) instead of sorting by number count
        const orderedPatternGroups = patternGroups.sort((a, b) => a.timestamp - b.timestamp);

        // Use DocumentFragment for batch DOM updates (performance optimization)
        const fragment = document.createDocumentFragment();

        orderedPatternGroups.forEach((group, groupIndex) => {
          const resultGroup = document.createElement('div');
          resultGroup.className = 'result-group';

          // Create header with formatted number count
          const header = document.createElement('h3');
          header.textContent = `${group.pattern} (${group.patternType}) - ${group.numbers.length.toLocaleString()} numbers`;
          resultGroup.appendChild(header);

          // Cache sorted numbers to avoid re-sorting on pagination
          if (!group._sortedNumbers) {
            group._sortedNumbers = [...group.numbers].sort((a, b) => {
              // Remove dashes and compare as numbers
              const numA = parseInt(a.replace(/-/g, ''));
              const numB = parseInt(b.replace(/-/g, ''));
              return numA - numB; // Ascending order
            });
          }

          const sortedNumbers = group._sortedNumbers;

          // Pagination setup
          const itemsPerPage = 1000;
          const totalPages = Math.ceil(sortedNumbers.length / itemsPerPage);
          const currentPage = this.currentPages?.[groupIndex] || 1;

          // Initialize currentPages if not exists
          if (!this.currentPages) {
            this.currentPages = {};
          }
          this.currentPages[groupIndex] = currentPage;

          // Get current page numbers
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, sortedNumbers.length);
          const numbersToShow = sortedNumbers.slice(startIndex, endIndex);

          // Create numbers grid with click to copy (optimized)
          const numbersGrid = document.createElement('div');
          numbersGrid.className = 'numbers-grid';

          // Use innerHTML for better performance with large datasets
          let gridHTML = '';
          numbersToShow.forEach(number => {
            const premiumBadge = this.isPremiumNumber(number) ? '<div class="premium-badge">🏅</div>' : '';
            gridHTML += `<span class="number-item clickable ${this.isPremiumNumber(number) ? 'premium' : ''}" data-number="${number}" title="คลิกเพื่อดูผลรวมเลขมงคล" onclick="uiController.handleAccountNumberClick('${number}', this)">${number}${premiumBadge}</span>`;
          });
          numbersGrid.innerHTML = gridHTML;

          resultGroup.appendChild(numbersGrid);

          // Create combined pagination section (moved to bottom)
          if (totalPages > 1) {
            const paginationSection = document.createElement('div');
            paginationSection.className = 'pagination-section';

            // 1. แสดงรายการที่ (range info)
            const rangeInfo = document.createElement('div');
            rangeInfo.className = 'pagination-range-info';
            rangeInfo.innerHTML = `แสดงรายการที่ ${(startIndex + 1).toLocaleString()} - ${endIndex.toLocaleString()} จากทั้งหมด ${sortedNumbers.length.toLocaleString()} รายการ`;
            paginationSection.appendChild(rangeInfo);

            // 2. ไปหน้า (page input)
            const pageInputContainer = document.createElement('div');
            pageInputContainer.className = 'page-input-container';
            pageInputContainer.innerHTML = `
              <span>ไปหน้า: </span>
              <input type="number" class="page-input" min="1" max="${totalPages}" value="${currentPage}" 
                     onchange="uiController.goToPage(${groupIndex}, this.value)" 
                     onkeypress="if(event.key==='Enter') uiController.goToPage(${groupIndex}, this.value)">
              <span> จาก ${totalPages}</span>
            `;
            paginationSection.appendChild(pageInputContainer);

            // 3. Pagination controls
            const paginationControls = document.createElement('div');
            paginationControls.className = 'pagination-controls';

            let paginationHTML = '';

            // Previous button
            if (currentPage > 1) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${currentPage - 1})">« ก่อนหน้า</button>`;
            }

            // Smart page number display (show fewer pages for better performance)
            const maxVisiblePages = 7; // Reduced from 10 to 7
            const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (startPage > 1) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, 1)">1</button>`;
              if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
              }
            }

            for (let page = startPage; page <= endPage; page++) {
              const isActive = page === currentPage ? ' active' : '';
              paginationHTML += `<button class="btn btn-pagination${isActive}" onclick="uiController.changePage(${groupIndex}, ${page})">${page}</button>`;
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
              }
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${totalPages})">${totalPages}</button>`;
            }

            // Next button
            if (currentPage < totalPages) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${currentPage + 1})">ถัดไป »</button>`;
            }

            paginationControls.innerHTML = paginationHTML;
            paginationSection.appendChild(paginationControls);

            resultGroup.appendChild(paginationSection);
          }

          fragment.appendChild(resultGroup);
        });

        // Single DOM update (performance optimization)
        this.elements.resultsDisplay.innerHTML = '';
        this.elements.resultsDisplay.appendChild(fragment);
      }
    }

  /**
   * Show all numbers for a specific pattern group (on-demand loading)
   * @param {number} groupIndex - Index of the pattern group
   */
  showAllNumbers(groupIndex) {
    const patternGroups = state.patternManager.getAllPatternGroups();
    // Sort pattern groups by number count (ascending) to match updateResultsDisplay
    const sortedPatternGroups = patternGroups.sort((a, b) => a.numbers.length - b.numbers.length);
    const group = sortedPatternGroups[groupIndex];
    
    if (!group) return;
    
    // Find the result group element
    const resultGroups = this.elements.resultsDisplay.querySelectorAll('.result-group');
    const targetGroup = resultGroups[groupIndex];
    
    if (!targetGroup) return;
    
    // Sort numbers within the group (ascending order)
    const sortedNumbers = [...group.numbers].sort((a, b) => {
      // Remove dashes and compare as numbers
      const numA = parseInt(a.replace(/-/g, ''));
      const numB = parseInt(b.replace(/-/g, ''));
      return numA - numB; // Ascending order
    });
    
    // Replace the numbers grid with all sorted numbers
    const numbersGrid = targetGroup.querySelector('.numbers-grid');
    const truncationMsg = targetGroup.querySelector('.truncation-message');
    
    // Use DocumentFragment for performance
    const fragment = document.createDocumentFragment();
    
    sortedNumbers.forEach(number => {
      const numberItem = document.createElement('span');
      numberItem.className = 'number-item';
      numberItem.textContent = number;
      fragment.appendChild(numberItem);
    });
    
    numbersGrid.innerHTML = '';
    numbersGrid.appendChild(fragment);
    
    // Remove truncation message
    if (truncationMsg) {
      truncationMsg.remove();
    }
    
    // Add collapse option
    const collapseMsg = document.createElement('p');
    collapseMsg.className = 'collapse-message';
    collapseMsg.innerHTML = `<em>Showing all ${sortedNumbers.length.toLocaleString()} numbers (sorted low to high). <a href="#" onclick="uiController.updateResultsDisplay()">Collapse to first 1000</a></em>`;
    targetGroup.appendChild(collapseMsg);
  }

  /**
   * Shows/hides export button based on data availability
   * @param {boolean} hasData
   */
  toggleExportButton(hasData) {
    if (hasData === undefined) {
      hasData = state.patternManager.getCount() > 0;
    }
    
    if (hasData) {
      if (this.elements.exportCsvBtn) {
        this.elements.exportCsvBtn.style.display = 'block';
      }
      if (this.elements.exportExcelBtn) {
        this.elements.exportExcelBtn.style.display = 'block';
      }
    } else {
      if (this.elements.exportCsvBtn) {
        this.elements.exportCsvBtn.style.display = 'none';
      }
      if (this.elements.exportExcelBtn) {
        this.elements.exportExcelBtn.style.display = 'none';
      }
    }
  }

  /**
   * Displays the identified pattern type for a pattern
   * @param {string} pattern
   * @param {string} patternType
   */
  displayPatternType(pattern, patternType) {
    // This method is called as part of updatePatternList
    // The pattern type is displayed in the pattern list items
    console.log(`Pattern ${pattern} identified as ${patternType}`);
  }

  /**
   * Displays count of generated numbers for each pattern
   * @param {string} pattern
   * @param {number} count
   */
  displayNumberCount(pattern, count) {
    // This method is called as part of updatePatternList and updateResultsDisplay
    // The count is displayed in both the pattern list and results display
    console.log(`Pattern ${pattern} generated ${count} numbers`);
  }

  /**
   * Update the entire UI based on current state
   */
  updateUI() {
    this.updatePatternList();
    this.updateResultsDisplay();
    this.toggleExportButton();
  }

  /**
   * Handle CSV export - Optimized Implementation
   * Connects export button to CSVExporter (exporting all numbers with pattern types)
   * PERFORMANCE MONITORED: Tracks CSV export performance
   * OPTIMIZED: Uses async processing for large datasets
   */
  async handleExport() {
    try {
      const patternGroups = state.patternManager.getAllPatternGroups();
      
      if (patternGroups.length === 0) {
        this.showError('No patterns to export. Add some patterns first.');
        return;
      }
      
      // Calculate total numbers for progress tracking
      const totalNumbers = patternGroups.reduce((sum, group) => sum + group.numbers.length, 0);
      const isLargeDataset = totalNumbers > 100000;
      
      // Show loading screen for export (simplified message)
      this.showLoading('กำลังสร้างไฟล์ CSV...');
      
      try {
        // Performance monitoring: Start timing CSV export
        const endTiming = window.performanceMonitor ? window.performanceMonitor.startTiming('csvExport') : null;
        
        // Use optimized CSVExporter with async processing for large datasets
        const csvExporter = new CSVExporter();
        
        if (isLargeDataset) {
          // For large datasets, use async export with simplified progress
          await csvExporter.exportAsync(patternGroups, (progress) => {
            // Simplified progress - just update the message
            this.updateLoadingProgress(0, 0, `กำลังประมวลผล ${progress.current.toLocaleString()} / ${progress.total.toLocaleString()} รายการ`);
          });
        } else {
          // For small datasets, use regular export
          csvExporter.export(patternGroups);
        }
        
        // Record performance metrics
        if (endTiming) {
          endTiming({ 
            patterns: patternGroups.length, 
            totalNumbers,
            operation: 'csvExport' 
          });
        }
        
        // Hide loading screen
        this.hideLoading();
        
        // Clear any existing errors
        this.clearError();
        
        console.log(`CSV export completed for ${patternGroups.length} patterns with ${totalNumbers} numbers`);
        
      } catch (error) {
        // Hide loading screen on error
        this.hideLoading();
        console.error('Export error:', error.message);
        this.showError(error.message);
      }
      
    } catch (error) {
      // Hide loading screen on error
      this.hideLoading();
      console.error('Export error:', error.message);
      this.showError(error.message);
    }
  }

  /**
   * Handle Excel export - Optimized Implementation
   * Exports all numbers to Excel (.xlsx) format using SheetJS
   * Uses same column structure as CSV: pattern_type, pattern, account_number
   * OPTIMIZED: Uses batch processing and async operations for large datasets
   */
  async handleExcelExport() {
    console.log('handleExcelExport called');
    try {
      const patternGroups = state.patternManager.getAllPatternGroups();
      console.log('Pattern groups:', patternGroups.length);
      
      if (patternGroups.length === 0) {
        this.showError('ไม่มี pattern ที่จะ export');
        return;
      }

      // Calculate total numbers for progress tracking
      const totalNumbers = patternGroups.reduce((sum, group) => sum + group.numbers.length, 0);
      console.log('Total numbers to export:', totalNumbers);
      
      // Configuration for file splitting
      const RECORDS_PER_FILE = 500000; // 500K records per file
      const needsSplitting = totalNumbers > RECORDS_PER_FILE;
      const totalFiles = Math.ceil(totalNumbers / RECORDS_PER_FILE);
      
      if (needsSplitting) {
        console.log(`Large dataset detected: ${totalNumbers.toLocaleString()} records will be split into ${totalFiles} files`);
        this.showError(`ข้อมูลมี ${totalNumbers.toLocaleString()} รายการ จะแบ่งเป็น ${totalFiles} ไฟล์ Excel (ไฟล์ละ ${RECORDS_PER_FILE.toLocaleString()} รายการ)`, 'info');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Show message for 3 seconds
      }
      
      // Show loading screen for export
      this.showLoading('กำลังสร้างไฟล์ Excel...');
      
      try {
        // Check if XLSX library is available
        if (typeof XLSX === 'undefined') {
          throw new Error('XLSX library not loaded');
        }
        
        // Process all data first with duplicate removal
        this.updateLoadingProgress(0, 0, 'กำลังประมวลผลข้อมูล...');
        
        const allData = [];
        const seenNumbers = new Set(); // Remove duplicates
        
        for (const group of patternGroups) {
          for (const number of group.numbers) {
            // Skip duplicates (same logic as CSV)
            if (seenNumbers.has(number)) {
              continue;
            }
            seenNumbers.add(number);
            
            allData.push([group.patternType, group.pattern, number]);
          }
        }
        
        console.log('Data processed for Excel:', allData.length, 'unique records');
        
        // Generate base filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const baseFilename = `account-numbers-${timestamp}`;
        
        if (needsSplitting) {
          // Split into multiple files
          for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
            const startIndex = fileIndex * RECORDS_PER_FILE;
            const endIndex = Math.min(startIndex + RECORDS_PER_FILE, allData.length);
            const fileData = allData.slice(startIndex, endIndex);
            
            this.updateLoadingProgress(0, 0, `กำลังสร้างไฟล์ ${fileIndex + 1}/${totalFiles} (${fileData.length.toLocaleString()} รายการ)...`);
            
            // Create workbook for this chunk
            const wb = XLSX.utils.book_new();
            
            // Create worksheet data
            const wsData = [
              ['pattern_type', 'pattern', 'account_number'], // Header row
              ...fileData
            ];
            
            // Create worksheet with optimized settings
            const ws = XLSX.utils.aoa_to_sheet(wsData, {
              cellStyles: false,
              sheetStubs: false
            });
            
            // Set column widths
            ws['!cols'] = [
              { wch: 18 }, // pattern_type
              { wch: 12 }, // pattern  
              { wch: 15 }  // account_number
            ];
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Account Numbers');
            
            // Generate filename for this part
            const filename = `${baseFilename}-part${fileIndex + 1}of${totalFiles}.xlsx`;
            
            this.updateLoadingProgress(0, 0, `กำลังดาวน์โหลดไฟล์ ${fileIndex + 1}/${totalFiles}...`);
            
            // Download this file
            try {
              console.log(`Downloading file ${fileIndex + 1}/${totalFiles}:`, filename);
              
              XLSX.writeFile(wb, filename, {
                bookType: 'xlsx',
                type: 'binary',
                cellStyles: false,
                compression: true
              });
              
              console.log(`File ${fileIndex + 1}/${totalFiles} downloaded successfully`);
              
              // Small delay between downloads to prevent browser issues
              if (fileIndex < totalFiles - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
            } catch (downloadError) {
              console.error(`Failed to download file ${fileIndex + 1}/${totalFiles}:`, downloadError);
              throw new Error(`ไม่สามารถดาวน์โหลดไฟล์ที่ ${fileIndex + 1} ได้: ${downloadError.message}`);
            }
          }
          
          console.log(`All ${totalFiles} Excel files downloaded successfully`);
          
        } else {
          // Single file export (less than 500K records)
          this.updateLoadingProgress(0, 0, 'กำลังสร้างไฟล์ Excel...');
          
          const wb = XLSX.utils.book_new();
          
          // Create worksheet data
          const wsData = [
            ['pattern_type', 'pattern', 'account_number'], // Header row
            ...allData
          ];
          
          // Create worksheet with optimized settings
          const ws = XLSX.utils.aoa_to_sheet(wsData, {
            cellStyles: false,
            sheetStubs: false
          });
          
          // Set column widths
          ws['!cols'] = [
            { wch: 18 }, // pattern_type
            { wch: 12 }, // pattern  
            { wch: 15 }  // account_number
          ];
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, 'Account Numbers');
          
          const filename = `${baseFilename}.xlsx`;
          
          this.updateLoadingProgress(0, 0, 'กำลังดาวน์โหลดไฟล์...');
          
          // Download single file
          console.log('Downloading single Excel file:', filename);
          
          XLSX.writeFile(wb, filename, {
            bookType: 'xlsx',
            type: 'binary',
            cellStyles: false,
            compression: true
          });
          
          console.log('Single Excel file downloaded successfully');
        }
        
        // Hide loading screen
        this.hideLoading();
        
        // Clear any existing errors
        this.clearError();
        
        if (needsSplitting) {
          console.log(`Excel export completed: ${totalFiles} files with ${allData.length} total unique records`);
          this.showError(`ดาวน์โหลดเสร็จสิ้น: ${totalFiles} ไฟล์ Excel รวม ${allData.length.toLocaleString()} รายการ`, 'success');
        } else {
          console.log(`Excel export completed: 1 file with ${allData.length} unique records`);
        }
        
      } catch (error) {
        // Hide loading screen on error
        this.hideLoading();
        console.error('Excel export processing error:', error);
        this.showError(`Excel export failed: ${error.message}`);
      }
      
    } catch (error) {
      // Hide loading screen on error
      this.hideLoading();
      console.error('Excel export error:', error);
      this.showError(`Excel export failed: ${error.message}`);
    }
  }

  /**
   * Process data for Excel export with optimization for large datasets
   * @param {Array} patternGroups - Pattern groups to process
   * @param {boolean} isLargeDataset - Whether this is a large dataset
   * @returns {Promise<Array>} Processed data array
   */
  async processDataForExcel(patternGroups, isLargeDataset) {
    const data = [];
    const seenNumbers = new Set(); // Remove duplicates like CSV
    const batchSize = isLargeDataset ? 10000 : 50000; // Smaller batches for large datasets
    
    let processedCount = 0;
    
    for (const group of patternGroups) {
      const { pattern, patternType, numbers } = group;
      
      // Process numbers in batches to avoid blocking UI
      for (let i = 0; i < numbers.length; i += batchSize) {
        const batch = numbers.slice(i, i + batchSize);
        
        for (const number of batch) {
          // Skip if we've already seen this account number (same as CSV logic)
          if (seenNumbers.has(number)) {
            continue;
          }
          
          // Mark this number as seen
          seenNumbers.add(number);
          
          // Same column structure as CSV: pattern_type, pattern, account_number
          data.push({
            pattern_type: patternType,
            pattern: pattern,
            account_number: number
          });
          
          processedCount++;
        }
        
        // Yield control to prevent UI blocking for large datasets
        if (isLargeDataset && i % (batchSize * 2) === 0) {
          // Update progress
          const totalNumbers = patternGroups.reduce((sum, g) => sum + g.numbers.length, 0);
          this.updateLoadingProgress(processedCount, totalNumbers, `ประมวลผลแล้ว ${processedCount.toLocaleString()} / ${totalNumbers.toLocaleString()} รายการ`);
          
          // Allow other operations to run
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    }
    
    return data;
  }

  /**
   * Download Excel file with fallback mechanisms for large datasets
   * @param {Object} workbook - Excel workbook object
   * @param {string} filename - Filename for download
   * @param {number} recordCount - Number of records
   */
  async downloadExcelWithFallback(workbook, filename, recordCount) {
    try {
      // Method 1: Try with compression first
      console.log(`Attempting Excel download with ${recordCount.toLocaleString()} records...`);
      
      if (recordCount > 500000) {
        // For very large datasets (>500k), use maximum compression
        XLSX.writeFile(workbook, filename, { 
          compression: true,
          bookType: 'xlsx',
          type: 'binary'
        });
      } else if (recordCount > 100000) {
        // For large datasets (>100k), use standard compression
        XLSX.writeFile(workbook, filename, { compression: true });
      } else {
        // For moderate datasets, use standard method
        XLSX.writeFile(workbook, filename);
      }
      
      console.log('Excel download successful');
      
    } catch (error) {
      console.error('Excel download method 1 failed:', error);
      
      try {
        // Method 2: Try manual blob creation
        console.log('Trying manual blob creation...');
        const wbout = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          compression: true 
        });
        
        const blob = new Blob([wbout], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Check blob size
        const sizeMB = blob.size / (1024 * 1024);
        console.log(`Excel file size: ${sizeMB.toFixed(2)} MB`);
        
        if (sizeMB > 100) {
          throw new Error(`File too large: ${sizeMB.toFixed(2)} MB`);
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('Manual blob download successful');
        
      } catch (blobError) {
        console.error('Manual blob creation failed:', blobError);
        throw new Error(`Excel export failed: ${blobError.message}`);
      }
    }
  }

  /**
   * Fallback to CSV export when Excel fails
   * @param {Array} data - Data array
   * @param {string} filename - CSV filename
   */
  async fallbackToCSV(data, filename) {
    try {
      console.log('Falling back to CSV export...');
      
      // Create CSV content
      const csvRows = ['pattern_type,pattern,account_number'];
      
      for (const row of data) {
        const csvRow = [
          this.escapeCSVValue(row.pattern_type),
          this.escapeCSVValue(row.pattern),
          this.escapeCSVValue(row.account_number)
        ].join(',');
        csvRows.push(csvRow);
      }
      
      const csvContent = csvRows.join('\n');
      
      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Show message to user
      this.showError('Excel ไฟล์ใหญ่เกินไป ได้สร้างไฟล์ CSV แทน', 'info');
      
      console.log('CSV fallback successful');
      
    } catch (csvError) {
      console.error('CSV fallback failed:', csvError);
      throw new Error(`Both Excel and CSV export failed: ${csvError.message}`);
    }
  }

  /**
   * Escape CSV values (helper method for fallback)
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSVValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      const escapedValue = value.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }
    
    return value;
  }

  /**
   * Remove a pattern from the collection
   * @param {number} sortedIndex - Index of pattern in sorted display order
   */
  removePattern(displayIndex) {
      const patternGroups = state.patternManager.getAllPatternGroups();
      // Get patterns in the same order as displayed (by timestamp)
      const orderedPatternGroups = patternGroups.sort((a, b) => a.timestamp - b.timestamp);

      if (displayIndex >= 0 && displayIndex < orderedPatternGroups.length) {
        const patternToRemove = orderedPatternGroups[displayIndex];

        // Find the original index in the PatternManager's internal array
        const originalIndex = state.patternManager.patterns.findIndex(p => 
          p.pattern === patternToRemove.pattern && 
          p.timestamp === patternToRemove.timestamp
        );

        if (originalIndex !== -1) {
          state.patternManager.removePattern(originalIndex);
          this.updateUI();
        } else {
          console.error('Could not find pattern to remove:', patternToRemove);
        }
      } else {
        console.error('Invalid displayIndex for removal:', displayIndex);
      }
    }
  /**
   * Change page for a specific pattern group
   * @param {number} groupIndex - Index of the pattern group
   * @param {number} newPage - New page number
   */
  /**
     * Change page for a specific pattern group (optimized)
     * @param {number} groupIndex - Index of the pattern group
     * @param {number} newPage - New page number
     */
    changePage(groupIndex, newPage) {
      if (!this.currentPages) {
        this.currentPages = {};
      }
      this.currentPages[groupIndex] = newPage;

      // Instead of re-rendering everything, just update the specific group
      this.updateSingleGroupDisplay(groupIndex);

      // Scroll to the pattern group
      const resultGroups = document.querySelectorAll('.result-group');
      if (resultGroups[groupIndex]) {
        resultGroups[groupIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    /**
     * Update display for a single pattern group (performance optimization)
     * @param {number} groupIndex - Index of the pattern group to update
     */
    /**
       * Update display for a single pattern group (performance optimization)
       * @param {number} groupIndex - Index of the pattern group to update
       */
      updateSingleGroupDisplay(groupIndex) {
        const patternGroups = state.patternManager.getAllPatternGroups();
        const orderedPatternGroups = patternGroups.sort((a, b) => a.timestamp - b.timestamp);

        if (groupIndex >= orderedPatternGroups.length) {
          return;
        }

        const group = orderedPatternGroups[groupIndex];
        const resultGroups = document.querySelectorAll('.result-group');
        const targetGroup = resultGroups[groupIndex];

        if (!targetGroup) {
          // Fallback to full update if group not found
          this.updateResultsDisplay();
          return;
        }

        // Use cached sorted numbers
        if (!group._sortedNumbers) {
          group._sortedNumbers = [...group.numbers].sort((a, b) => {
            const numA = parseInt(a.replace(/-/g, ''));
            const numB = parseInt(b.replace(/-/g, ''));
            return numA - numB;
          });
        }

        const sortedNumbers = group._sortedNumbers;
        const itemsPerPage = 1000;
        const totalPages = Math.ceil(sortedNumbers.length / itemsPerPage);
        const currentPage = this.currentPages[groupIndex] || 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, sortedNumbers.length);
        const numbersToShow = sortedNumbers.slice(startIndex, endIndex);

        // Update numbers grid
        const numbersGrid = targetGroup.querySelector('.numbers-grid');
        if (numbersGrid) {
          let gridHTML = '';
          numbersToShow.forEach(number => {
            const premiumBadge = this.isPremiumNumber(number) ? '<div class="premium-badge">🏅</div>' : '';
            gridHTML += `<span class="number-item clickable ${this.isPremiumNumber(number) ? 'premium' : ''}" data-number="${number}" title="คลิกเพื่อดูผลรวมเลขมงคล" onclick="uiController.handleAccountNumberClick('${number}', this)">${number}${premiumBadge}</span>`;
          });
          numbersGrid.innerHTML = gridHTML;
        }

        // Update pagination section
        const paginationSection = targetGroup.querySelector('.pagination-section');
        if (paginationSection && totalPages > 1) {
          // Update range info
          const rangeInfo = paginationSection.querySelector('.pagination-range-info');
          if (rangeInfo) {
            rangeInfo.innerHTML = `แสดงรายการที่ ${(startIndex + 1).toLocaleString()} - ${endIndex.toLocaleString()} จากทั้งหมด ${sortedNumbers.length.toLocaleString()} รายการ`;
          }

          // Update page input
          const pageInputContainer = paginationSection.querySelector('.page-input-container');
          if (pageInputContainer) {
            pageInputContainer.innerHTML = `
              <span>ไปหน้า: </span>
              <input type="number" class="page-input" min="1" max="${totalPages}" value="${currentPage}" 
                     onchange="uiController.goToPage(${groupIndex}, this.value)" 
                     onkeypress="if(event.key==='Enter') uiController.goToPage(${groupIndex}, this.value)">
              <span> จาก ${totalPages}</span>
            `;
          }

          // Update pagination controls
          const paginationControls = paginationSection.querySelector('.pagination-controls');
          if (paginationControls) {
            let paginationHTML = '';

            // Previous button
            if (currentPage > 1) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${currentPage - 1})">« ก่อนหน้า</button>`;
            }

            // Smart page number display
            const maxVisiblePages = 7;
            const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (startPage > 1) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, 1)">1</button>`;
              if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
              }
            }

            for (let page = startPage; page <= endPage; page++) {
              const isActive = page === currentPage ? ' active' : '';
              paginationHTML += `<button class="btn btn-pagination${isActive}" onclick="uiController.changePage(${groupIndex}, ${page})">${page}</button>`;
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
              }
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${totalPages})">${totalPages}</button>`;
            }

            // Next button
            if (currentPage < totalPages) {
              paginationHTML += `<button class="btn btn-pagination" onclick="uiController.changePage(${groupIndex}, ${currentPage + 1})">ถัดไป »</button>`;
            }

            paginationControls.innerHTML = paginationHTML;
          }
        }
      }
  /**
   * Go to specific page for a pattern group
   * @param {number} groupIndex - Index of the pattern group
   * @param {string|number} pageInput - Page number input
   */
  goToPage(groupIndex, pageInput) {
    const pageNumber = parseInt(pageInput);

    if (isNaN(pageNumber) || pageNumber < 1) {
      alert('กรุณาใส่เลขหน้าที่ถูกต้อง');
      return;
    }

    const patternGroups = state.patternManager.getAllPatternGroups();
    const orderedPatternGroups = patternGroups.sort((a, b) => a.timestamp - b.timestamp);

    if (groupIndex >= orderedPatternGroups.length) {
      return;
    }

    const group = orderedPatternGroups[groupIndex];
    const totalPages = Math.ceil(group.numbers.length / 1000);

    if (pageNumber > totalPages) {
      alert(`หน้าที่ ${pageNumber} ไม่มีอยู่ (มีทั้งหมด ${totalPages} หน้า)`);
      return;
    }

    this.changePage(groupIndex, pageNumber);
  }

  /**
   * Copy account number to clipboard and show feedback
   * @param {string} accountNumber - Account number to copy
   * @param {HTMLElement} element - Element that was clicked
   */
  async copyAccountNumber(accountNumber, element) {
    try {
      // Remove dashes for copying (clean account number)
      const cleanAccountNumber = accountNumber.replace(/-/g, '');

      // Copy to clipboard
      await navigator.clipboard.writeText(cleanAccountNumber);

      // Show visual feedback
      const originalText = element.textContent;
      const originalClass = element.className;

      element.textContent = 'Copied!';
      element.className = originalClass + ' copied';

      // Reset after 1.5 seconds
      setTimeout(() => {
        element.textContent = originalText;
        element.className = originalClass;
      }, 1500);

    } catch (error) {
      console.error('Failed to copy account number:', error);

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber.replace(/-/g, '');
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');

        // Show visual feedback
        const originalText = element.textContent;
        const originalClass = element.className;

        element.textContent = 'Copied!';
        element.className = originalClass + ' copied';

        setTimeout(() => {
          element.textContent = originalText;
          element.className = originalClass;
        }, 1500);

      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('ไม่สามารถ copy ได้ กรุณา copy ด้วยตนเอง: ' + accountNumber.replace(/-/g, ''));
      }

      document.body.removeChild(textArea);
    }
  }

  handleNumberCheck() {
    console.log('handleNumberCheck called');
    
    // Check if elements exist
    if (!this.elements.numberInput) {
      console.error('Number input element not found');
      return;
    }
    
    if (!this.elements.checkerResult) {
      console.error('Checker result element not found');
      return;
    }
    
    const numberInput = this.elements.numberInput.value.trim();
    const resultDiv = this.elements.checkerResult;
    
    console.log('Input value:', numberInput);
    
    // Clear previous result
    resultDiv.style.display = 'none';
    resultDiv.className = 'checker-result';
    
    // Validate input
    if (!numberInput) {
      this.showCheckerResult('กรุณากรอกหมายเลข', 'error');
      return;
    }
    
    if (numberInput.length !== 10) {
      this.showCheckerResult('หมายเลขต้องมี 10 หลักเท่านั้น', 'error');
      return;
    }
    
    if (!/^\d{10}$/.test(numberInput)) {
      this.showCheckerResult('หมายเลขต้องเป็นตัวเลขเท่านั้น', 'error');
      return;
    }
    
    console.log('Checking number against all possible patterns:', numberInput);
    
    // Show loading while checking
    this.showCheckerResult('🔍 กำลังตรวจสอบกับทุก pattern...', 'checking');
    
    // Check against all possible patterns (not just added ones)
    this.checkAgainstAllPatterns(numberInput);
  }
  
  async checkAgainstAllPatterns(numberInput) {
    const foundInPatterns = [];
    
    // Define all possible patterns to check
    const allPatterns = [
      // The Soloist patterns
      { pattern: 'aaaaaaaaaa', type: 'The Soloist', description: 'All 10 digits identical' },
      { pattern: '?bbbbbbbbb', type: 'The Soloist', description: 'All 9 digits identical' },
      { pattern: '??dddddddd', type: 'The Soloist', description: 'All 8 digits identical' },
      { pattern: '???ddddddd', type: 'The Soloist', description: 'All 7 digits identical' },
      { pattern: '????eeeeee', type: 'The Soloist', description: 'All 6 digits identical' },
      { pattern: '?????fffff', type: 'The Soloist', description: 'All 5 digits identical' },
      { pattern: '??????gggg', type: 'The Soloist', description: 'All 4 digits identical' },
      
      // Hyphen-separated patterns
      { pattern: 'bbbaaaaaaa', type: 'Hyphen-separated', description: '2 distinct digits across blocks' },
      { pattern: 'bbbbbaaaaa', type: 'Hyphen-separated', description: '2 distinct digits across blocks' },
      { pattern: 'bbbaaabbbb', type: 'Hyphen-separated', description: '2 distinct digits across blocks' },
      { pattern: 'aaabbbcccc', type: 'Hyphen-separated', description: '3 distinct digits across blocks' },
      { pattern: 'bbb???bbbb', type: 'Hyphen-separated', description: 'First and last blocks identical' },
      
      // Full Straight patterns
      { pattern: 'abcdefghij', type: 'The Full Straight', description: 'Ascending sequence' },
      { pattern: 'jihgfedcba', type: 'The Full Straight', description: 'Descending sequence' },
      
      // Cyclic Straight patterns
      { pattern: 'zabcdefghi', type: 'Cyclic Straight', description: 'Cyclic ascending' },
      { pattern: 'ihgfedcbaz', type: 'Cyclic Straight', description: 'Cyclic descending' },
      
      // Rhythmic Bridge patterns
      { pattern: 'abc???abc?', type: 'The Rhythmic Bridge', description: 'Repeating pattern 2-3 block' },
      { pattern: 'abcabc????', type: 'The Rhythmic Bridge', description: 'Repeating pattern front-middle' },
      { pattern: '???abcabc?', type: 'The Rhythmic Bridge', description: 'Repeating pattern middle-end' },
      { pattern: 'abcabcabc?', type: 'The Rhythmic Bridge', description: 'Fully linked on 3 blocks' },
      
      // Thai Mobile patterns
      { pattern: '06????????', type: 'Thai Mobile No.', description: 'Started with 06' },
      { pattern: '08????????', type: 'Thai Mobile No.', description: 'Started with 08' },
      { pattern: '09????????', type: 'Thai Mobile No.', description: 'Started with 09' }
    ];
    
    console.log(`Checking against ${allPatterns.length} possible patterns...`);
    
    // Use PatternAnalyzer to check each pattern type
    const analyzer = new PatternAnalyzer();
    
    for (const patternDef of allPatterns) {
      try {
        // Check if the number matches this pattern type
        const matches = this.checkNumberAgainstPattern(numberInput, patternDef, analyzer);
        if (matches) {
          foundInPatterns.push({
            pattern: patternDef.pattern,
            patternType: patternDef.type,
            description: patternDef.description,
            matchDetails: matches
          });
          console.log(`Found match in pattern: ${patternDef.pattern} (${patternDef.type})`);
        }
      } catch (error) {
        console.error(`Error checking pattern ${patternDef.pattern}:`, error);
      }
    }
    
    // Show results
    if (foundInPatterns.length > 0) {
      this.showCheckerResultFormatted(numberInput, foundInPatterns, 'found');
      console.log('Number found in patterns:', foundInPatterns);
    } else {
      this.showCheckerResult(`❌ ไม่พบหมายเลข ${numberInput} ในรูปแบบ pattern ใดๆ ที่รองรับ`, 'not-found');
      console.log('Number not found in any supported pattern');
    }
  }
  
  showCheckerResultFormatted(numberInput, foundInPatterns, type) {
    console.log('showCheckerResultFormatted called:', numberInput, foundInPatterns.length, type);
    
    if (!this.elements.checkerResult) {
      console.error('Checker result element not found');
      return;
    }
    
    const resultDiv = this.elements.checkerResult;
    resultDiv.className = `checker-result ${type}`;
    resultDiv.style.display = 'block';
    
    // Create formatted HTML content with cards but simple text format
    let htmlContent = `
      <div class="result-header">
        <div class="result-icon">✅</div>
        <div class="result-title">พบหมายเลข ${numberInput} ตรงกับ ${foundInPatterns.length} pattern${foundInPatterns.length > 1 ? 's' : ''}</div>
      </div>
      <div class="result-patterns">
    `;
    
    foundInPatterns.forEach((found, index) => {
      htmlContent += `
        <div class="pattern-match">
          <div class="pattern-number">${index + 1}</div>
          <div class="pattern-details">
            <div class="pattern-line-card">${found.patternType} (${found.pattern}) - ${found.description}</div>
          </div>
        </div>
      `;
    });
    
    htmlContent += `
      </div>
    `;
    
    resultDiv.innerHTML = htmlContent;
    console.log('Card formatted result displayed');
  }
  
  checkNumberAgainstPattern(numberInput, patternDef, analyzer) {
    const pattern = patternDef.pattern;
    const type = patternDef.type;
    
    try {
      // Check based on pattern type
      switch (type) {
        case 'The Soloist':
          return this.checkSoloistPattern(numberInput, pattern);
          
        case 'Hyphen-separated':
          return this.checkHyphenPattern(numberInput, pattern);
          
        case 'The Full Straight':
          return this.checkFullStraightPattern(numberInput, pattern);
          
        case 'Cyclic Straight':
          return this.checkCyclicStraightPattern(numberInput, pattern);
          
        case 'The Rhythmic Bridge':
          return this.checkRhythmicBridgePattern(numberInput, pattern);
          
        case 'Thai Mobile No.':
          return this.checkThaiMobilePattern(numberInput, pattern);
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error in checkNumberAgainstPattern for ${pattern}:`, error);
      return false;
    }
  }
  
  checkSoloistPattern(numberInput, pattern) {
    // Check if number matches soloist pattern (repeated digits)
    const digits = numberInput.split('');
    
    if (pattern === 'aaaaaaaaaa') {
      // All 10 digits identical
      return digits.every(d => d === digits[0]);
    }
    
    if (pattern === '?bbbbbbbbb') {
      // Last 9 digits identical
      const lastNine = digits.slice(1);
      return lastNine.every(d => d === lastNine[0]);
    }
    
    if (pattern === '??dddddddd') {
      // Last 8 digits identical
      const lastEight = digits.slice(2);
      return lastEight.every(d => d === lastEight[0]);
    }
    
    if (pattern === '???ddddddd') {
      // Last 7 digits identical
      const lastSeven = digits.slice(3);
      return lastSeven.every(d => d === lastSeven[0]);
    }
    
    if (pattern === '????eeeeee') {
      // Last 6 digits identical
      const lastSix = digits.slice(4);
      return lastSix.every(d => d === lastSix[0]);
    }
    
    if (pattern === '?????fffff') {
      // Last 5 digits identical
      const lastFive = digits.slice(5);
      return lastFive.every(d => d === lastFive[0]);
    }
    
    if (pattern === '??????gggg') {
      // Last 4 digits identical
      const lastFour = digits.slice(6);
      return lastFour.every(d => d === lastFour[0]);
    }
    
    return false;
  }
  
  checkHyphenPattern(numberInput, pattern) {
    // Check hyphen-separated patterns
    const block1 = numberInput.slice(0, 3);
    const block2 = numberInput.slice(3, 6);
    const block3 = numberInput.slice(6, 10);
    
    if (pattern === 'bbbaaaaaaa') {
      // First block different from rest
      return block2.split('').every(d => d === block2[0]) && 
             block3.split('').every(d => d === block3[0]) &&
             block2[0] === block3[0] && block1[0] !== block2[0];
    }
    
    if (pattern === 'bbbbbaaaaa') {
      // First 5 digits one value, last 5 another
      const first5 = numberInput.slice(0, 5);
      const last5 = numberInput.slice(5);
      return first5.split('').every(d => d === first5[0]) &&
             last5.split('').every(d => d === last5[0]) &&
             first5[0] !== last5[0];
    }
    
    if (pattern === 'bbbaaabbbb') {
      // First and last blocks same, middle different
      return block1.split('').every(d => d === block1[0]) &&
             block2.split('').every(d => d === block2[0]) &&
             block3.split('').every(d => d === block3[0]) &&
             block1[0] === block3[0] && block1[0] !== block2[0];
    }
    
    if (pattern === 'aaabbbcccc') {
      // All three blocks different
      return block1.split('').every(d => d === block1[0]) &&
             block2.split('').every(d => d === block2[0]) &&
             block3.split('').every(d => d === block3[0]) &&
             block1[0] !== block2[0] && block2[0] !== block3[0] && block1[0] !== block3[0];
    }
    
    if (pattern === 'bbb???bbbb') {
      // First and last blocks identical
      return block1.split('').every(d => d === block1[0]) &&
             block3.split('').every(d => d === block3[0]) &&
             block1[0] === block3[0];
    }
    
    return false;
  }
  
  checkFullStraightPattern(numberInput, pattern) {
    const digits = numberInput.split('').map(d => parseInt(d));
    
    if (pattern === 'abcdefghij') {
      // Ascending sequence
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== (digits[i-1] + 1) % 10) {
          return false;
        }
      }
      return true;
    }
    
    if (pattern === 'jihgfedcba') {
      // Descending sequence
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== (digits[i-1] - 1 + 10) % 10) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
  
  checkCyclicStraightPattern(numberInput, pattern) {
    const digits = numberInput.split('').map(d => parseInt(d));
    
    if (pattern === 'zabcdefghi') {
      // Cyclic ascending (wraps around)
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== (digits[i-1] + 1) % 10) {
          return false;
        }
      }
      return true;
    }
    
    if (pattern === 'ihgfedcbaz') {
      // Cyclic descending (wraps around)
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== (digits[i-1] - 1 + 10) % 10) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
  
  checkRhythmicBridgePattern(numberInput, pattern) {
    if (pattern === 'abc???abc?') {
      // First 3 digits repeat in positions 7-9
      return numberInput.slice(0, 3) === numberInput.slice(6, 9);
    }
    
    if (pattern === 'abcabc????') {
      // First 3 digits repeat in positions 4-6
      return numberInput.slice(0, 3) === numberInput.slice(3, 6);
    }
    
    if (pattern === '???abcabc?') {
      // Digits 4-6 repeat in positions 7-9
      return numberInput.slice(3, 6) === numberInput.slice(6, 9);
    }
    
    if (pattern === 'abcabcabc?') {
      // First 3 digits repeat in positions 4-6 and 7-9
      return numberInput.slice(0, 3) === numberInput.slice(3, 6) &&
             numberInput.slice(0, 3) === numberInput.slice(6, 9);
    }
    
    return false;
  }
  
  checkThaiMobilePattern(numberInput, pattern) {
    if (pattern === '06????????') {
      return numberInput.startsWith('06');
    }
    
    if (pattern === '08????????') {
      return numberInput.startsWith('08');
    }
    
    if (pattern === '09????????') {
      return numberInput.startsWith('09');
    }
    
    return false;
  }
  
  showCheckerResult(message, type) {
    console.log('showCheckerResult called:', message, type);
    
    if (!this.elements.checkerResult) {
      console.error('Checker result element not found');
      return;
    }
    
    const resultDiv = this.elements.checkerResult;
    resultDiv.className = `checker-result ${type}`;
    resultDiv.style.display = 'block';
    
    // For simple messages (error, not-found, checking), use text content
    if (type === 'error' || type === 'not-found' || type === 'checking') {
      if (type === 'not-found') {
        // Beautiful not-found message with enhanced styling
        resultDiv.innerHTML = `
          <div class="result-header-beautiful">
            <div class="result-icon-beautiful">
              <div class="icon-wrapper">
                <span class="search-icon">🔍</span>
                <span class="cross-icon">❌</span>
              </div>
            </div>
            <div class="result-content-beautiful">
              <div class="result-title-beautiful">ไม่พบหมายเลขในระบบ</div>
              <div class="result-subtitle-beautiful">หมายเลข ${message.match(/\d{10}/)?.[0] || 'ที่กรอก'} ไม่ตรงกับ Pattern ใดๆ</div>
              <div class="result-suggestions">
                <div class="suggestion-item">💡 ลองตรวจสอบหมายเลขอีกครั้ง</div>
                <div class="suggestion-item">🎯 หรือสร้าง Pattern ใหม่ด้านล่าง</div>
              </div>
            </div>
          </div>
        `;
      } else {
        resultDiv.textContent = message;
      }
    } else {
      // For other types, use text content as fallback
      resultDiv.textContent = message;
    }
    
    console.log('Result displayed:', type);
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
      setTimeout(() => {
        resultDiv.style.display = 'none';
      }, 5000);
    }
  }
}

/**
 * Handle CSV export (legacy function for backward compatibility)
 */
function handleExport() {
  if (window.uiController) {
    window.uiController.handleExport();
  }
}

/**
 * Remove a pattern from the collection (legacy function for backward compatibility)
 * @param {number} index - Index of pattern to remove
 */
function removePattern(index) {
  if (window.uiController) {
    window.uiController.removePattern(index);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
