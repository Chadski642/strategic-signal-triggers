/**
 * Tests for CONTENT_PERSONALIZATION_GAP detector
 */

const ContentPersonalizationGapDetector = require('../detector');
const { TestRunner } = require('../../../testing/test-runner');

describe('ContentPersonalizationGapDetector', () => {
  let detector;
  let testRunner;

  beforeEach(() => {
    detector = new ContentPersonalizationGapDetector();
    testRunner = new TestRunner();
  });

  describe('Basic detector properties', () => {
    it('should have the correct signal ID', () => {
      expect(detector.signalId).toBe('CONTENT_PERSONALIZATION_GAP');
    });

    it('should have the correct category', () => {
      expect(detector.category).toBe('Marketing Technology Signals');
    });
  });

  describe('Positive detection cases', () => {
    it('should detect e-commerce site with user accounts but no personalization', async () => {
      const mockPage = await testRunner.createMockPage('example-ecommerce.com', {
        content: `
          <html>
            <head><title>Example E-commerce</title></head>
            <body>
              <header>
                <nav>
                  <a href="/login">Sign In</a>
                  <a href="/account">My Account</a>
                </nav>
              </header>
              <main>
                <section class="product-recommendations">
                  <h2>Featured Products</h2>
                  <!-- Generic product recommendations not personalized -->
                </section>
              </main>
            </body>
          </html>
        `,
        cookies: [
          { name: 'session_id', value: '12345' },
          { name: 'user_pref', value: 'currency=USD' }
        ]
      });

      const result = await detector.detect(mockPage);
      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect content site with login but generic content', async () => {
      const mockPage = await testRunner.createMockPage('example-media.com', {
        content: `
          <html>
            <head><title>Example Media</title></head>
            <body>
              <header>
                <div class="user-menu">
                  <span class="welcome-message">Welcome back, User!</span>
                  <a href="/account">My Account</a>
                  <a href="/logout">Logout</a>
                </div>
              </header>
              <main>
                <section class="featured-content">
                  <h2>Today's Top Stories</h2>
                  <!-- Same featured articles for all users -->
                </section>
                <!-- No "Recommended for you" section -->
              </main>
            </body>
          </html>
        `
      });

      const result = await detector.detect(mockPage);
      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Negative detection cases', () => {
    it('should not detect site with proper personalization', async () => {
      const mockPage = await testRunner.createMockPage('personalized-shop.com', {
        content: `
          <html>
            <head><title>Personalized Shop</title></head>
            <body>
              <header>
                <nav>
                  <a href="/login">Sign In</a>
                  <a href="/account">My Account</a>
                </nav>
              </header>
              <main>
                <section class="personalized-recommendations">
                  <h2>Recommended For You</h2>
                  <div class="recommendation-container" data-user-id="12345">
                    <!-- Dynamic personalized content -->
                  </div>
                </section>
                <section class="recently-viewed">
                  <h2>Recently Viewed Items</h2>
                  <!-- User-specific recently viewed products -->
                </section>
              </main>
              <script>
                loadPersonalizedRecommendations(userId, userPreferences, browsingHistory);
              </script>
            </body>
          </html>
        `
      });

      const result = await detector.detect(mockPage);
      expect(result.detected).toBe(false);
    });

    it('should not detect sites without user accounts', async () => {
      const mockPage = await testRunner.createMockPage('simple-site.com', {
        content: `
          <html>
            <head><title>Simple Site</title></head>
            <body>
              <header>
                <nav>
                  <a href="/about">About</a>
                  <a href="/contact">Contact</a>
                </nav>
              </header>
              <main>
                <section class="content">
                  <h1>Welcome to our site</h1>
                  <p>This is a simple informational site.</p>
                </section>
              </main>
            </body>
          </html>
        `
      });

      const result = await detector.detect(mockPage);
      expect(result.detected).toBe(false);
    });
  });
});