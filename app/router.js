import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('example2-1');
  this.route('example2-3');
  this.route('example3-1');
});
