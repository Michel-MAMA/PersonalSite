import { initNavigation } from './assets/js/navigation.js';
import { initAppearance } from './assets/js/appearance.js';
import { initWhatsApp } from './assets/js/whatsapp.js';

initNavigation();
initAppearance();
initWhatsApp();

// Load page-specific behavior only where its markup is present.
const features = [
  ['#contact-form', () => import('./assets/js/contact.js'), 'initContact'],
  ['#blog-search, [data-share-article]', () => import('./assets/js/blog.js'), 'initBlog'],
  ['[data-blog-engagement]', () => import('./assets/js/engagement.js'), 'initEngagement'],
  ['[data-coaching-booking]', () => import('./assets/js/booking.js'), 'initBooking'],
];
await Promise.all(features.map(async ([selector, load, initialize]) => {
  if (document.querySelector(selector)) {
    const feature = await load();
    feature[initialize]();
  }
}));
