/**
 * CONTENT_PERSONALIZATION_GAP Detector
 * 
 * Identifies websites that have user account systems but lack personalized content delivery
 * based on user behavior or preferences.
 */

class ContentPersonalizationGapDetector extends BaseDetector {
  constructor() {
    super();
    this.signalId = 'CONTENT_PERSONALIZATION_GAP';
    this.signalName = 'Content Personalization Gap';
    this.description = 'Detects websites with user accounts but lacking personalized content';
    this.category = 'Marketing Technology Signals';
  }

  /**
   * Main detection method
   * @param {Object} page - Page object containing DOM and other context
   * @returns {DetectionResult} Object with detection results
   */
  async detect(page) {
    // Detect user account system
    const hasUserAccountSystem = await this.checkForUserAccountSystem(page);
    
    // Detect user data collection
    const hasUserDataCollection = await this.checkForUserDataCollection(page);
    
    // Detect absence of personalization
    const hasPersonalization = await this.checkForPersonalizationFeatures(page);
    
    // Determine confidence score and result
    let confidence = 0;
    let detected = false;
    let evidence = {};
    
    if (hasUserAccountSystem && hasUserDataCollection && !hasPersonalization) {
      confidence = 0.95;
      detected = true;
      evidence = {
        userAccountSystem: true,
        userDataCollection: true,
        personalizationDetected: false,
      };
    } else if (hasUserAccountSystem && !hasPersonalization) {
      confidence = 0.75;
      detected = true;
      evidence = {
        userAccountSystem: true,
        personalizationDetected: false,
      };
    } else if (hasUserAccountSystem && await this.hasAmbiguousPersonalization(page)) {
      confidence = 0.60;
      detected = true;
      evidence = {
        userAccountSystem: true,
        ambiguousPersonalization: true,
      };
    }
    
    return {
      signalId: this.signalId,
      detected,
      confidence,
      evidence,
    };
  }

  /**
   * Check for presence of user account system
   * @param {Object} page - Page context
   * @returns {Boolean}
   */
  async checkForUserAccountSystem(page) {
    const loginPatterns = [
      /(sign[\s-]?in|log[\s-]?in|account|register|my[\s-]?profile)/i,
      /(username|password|forgot[\s-]?password|create[\s-]?account)/i,
    ];
    
    // Check URL patterns
    const url = page.url();
    if (/(login|signin|account|profile|register)/i.test(url)) {
      return true;
    }
    
    // Check for login/account links
    const loginLinks = await page.$$eval('a, button', elements => {
      return elements
        .filter(el => {
          const text = el.innerText.toLowerCase();
          return /(login|sign in|my account|register|profile)/i.test(text);
        })
        .map(el => el.innerText);
    });
    
    if (loginLinks.length > 0) {
      return true;
    }
    
    // Check HTML content for login patterns
    const content = await page.content();
    return loginPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for user data collection mechanisms
   * @param {Object} page - Page context
   * @returns {Boolean}
   */
  async checkForUserDataCollection(page) {
    // Check for cookies used for user data
    const cookies = await page.cookies();
    const userDataCookies = cookies.filter(cookie => {
      return /(user|pref|session|login|auth|account)/i.test(cookie.name);
    });
    
    if (userDataCookies.length > 0) {
      return true;
    }
    
    // Check for localStorage usage
    const hasUserLocalStorage = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (/(user|pref|session|login|auth|account)/i.test(key)) {
          return true;
        }
      }
      return false;
    });
    
    if (hasUserLocalStorage) {
      return true;
    }
    
    // Check for user data collection in form fields
    const userDataForms = await page.$$eval('form', forms => {
      return forms.filter(form => {
        const inputs = form.querySelectorAll('input');
        for (const input of inputs) {
          const inputType = input.type.toLowerCase();
          const inputName = (input.name || '').toLowerCase();
          const inputId = (input.id || '').toLowerCase();
          
          if (['email', 'tel', 'text'].includes(inputType) && 
              /(email|name|phone|user|address)/i.test(inputName + ' ' + inputId)) {
            return true;
          }
        }
        return false;
      }).length > 0;
    });
    
    return userDataForms;
  }

  /**
   * Check for personalization features
   * @param {Object} page - Page context
   * @returns {Boolean}
   */
  async checkForPersonalizationFeatures(page) {
    // Personalization pattern markers in content
    const personalizationPatterns = [
      /(recommended[\s-]?for[\s-]?you|because[\s-]?you|personalized|tailored[\s-]?for[\s-]?you)/i,
      /(your[\s-]?recommendations|based[\s-]?on[\s-]?your)/i,
      /(you[\s-]?might[\s-]?(?:also[\s-]?)?like|you[\s-]?may[\s-]?(?:also[\s-]?)?like)/i,
      /(recently[\s-]?viewed|your[\s-]?recently[\s-]?viewed)/i,
    ];
    
    // Check HTML content for personalization patterns
    const content = await page.content();
    const hasPersonalizationMarkers = personalizationPatterns.some(pattern => pattern.test(content));
    
    if (hasPersonalizationMarkers) {
      return true;
    }
    
    // Check for personalization scripts
    const hasRecommendationScripts = await page.$$eval('script', scripts => {
      return scripts.some(script => {
        const content = script.innerText || script.src || '';
        return /(recommend|personali[sz]|suggest)/i.test(content);
      });
    });
    
    if (hasRecommendationScripts) {
      return true;
    }
    
    return false;
  }

  /**
   * Check for ambiguous personalization status
   * @param {Object} page - Page context
   * @returns {Boolean}
   */
  async hasAmbiguousPersonalization(page) {
    // Implementation depends on specific detection needs
    // This is a simplified example
    const content = await page.content();
    const ambiguousTerms = [
      /(customer[\s-]?experience|user[\s-]?experience)/i,
      /(preferences|settings|customize)/i,
    ];
    
    return ambiguousTerms.some(term => term.test(content));
  }
}

// Register the detector
module.exports = ContentPersonalizationGapDetector;