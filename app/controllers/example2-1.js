import Ember from 'ember';

export default Ember.Controller.extend({
  constraints: {audio: true, video: true},
  actions: {
    start: function() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia(this.get("constraints"), successCallback, errorCallback);
      function successCallback(stream) {
        console.log(stream);
        var video = document.querySelector('video');
        window.stream = stream;
        if (window.URL) {
          video.src = window.URL.createObjectURL(stream);
          console.log(video.src);
        } else {
          video.src = stream;
        }
        video.play();
      }
      function errorCallback(err) {
        console.log("navigator.getUserMedia error: ", err);
      }
    }
  }
});
