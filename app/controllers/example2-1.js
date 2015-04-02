import Ember from 'ember';

export default Ember.Controller.extend({
  constraints: {audio: true, video: true},
  videoSrc: null,
  actions: {
    start: function() {
      var _this = this;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia(this.get("constraints"), function(stream) {
        _this.send('successCallback', stream);
      }, function(err) {
        _this.send('errorCallback', err);
      });
    },
    successCallback: function(stream) {
      console.log(stream);
      var video = document.querySelector('video');
      var _this = this;
      window.stream = stream;
      if (window.URL) {
        _this.set('videoSrc', window.URL.createObjectURL(stream));
      } else {
         _this.set('videoSrc', stream);
      }
      video.play();
    },
    errorCallback: function(err) {
      console.log("navigator.getUserMedia error: ", err);
    }
  }
});
