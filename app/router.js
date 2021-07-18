import EmberRouter from '@ember/routing/router';
import config from 'bristle-js/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('about');
  this.route('contact', { path: 'getting-in-touch' });
});
