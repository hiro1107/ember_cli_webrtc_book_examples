import Ember from 'ember';

export default Ember.Controller.extend({
  qvgaConstraints: { video: {
    mandatory: {
      maxWidth: 320,
      maxHeight: 240
    }
  }},
  vgaConstraints: { video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 480
    }
  }},
  hdConstraints: { video: {
    mandatory: {
      minWidth: 1280,
      minHeight: 720
    }
  }},
  actions: {
    getMedia: function(constraints) {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      var stream;
      var video = document.querySelector("video");
      function successCallback(stream) {
        window.stream = stream; // stream available to console
        if (window.URL) {
          video.src = window.URL.createObjectURL(stream);
          console.log(video.src);
        } else {
          video.src = stream;
        }
        //video.src = stream;
        video.play();
      }
      function errorCallback(error) {
        console.log("navigator.getUserMedia error", error);
      }
      if (!!stream) {
        this.get('video').src = null;
        stream.stop();
      }
      navigator.getUserMedia(constraints, successCallback, errorCallback);
    },
    qvgaStart: function() {
      this.send('getMedia', this.get('qvgaConstraints'));
    },
    vgaStart: function() {
      this.send('getMedia', this.get('vgaConstraints'));
    },
    hdStart: function() {
      this.send('getMedia', this.get('hdConstraints'));
    }

  }
});
