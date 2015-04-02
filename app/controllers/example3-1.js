import Ember from 'ember';

var localStream, localPeerConnection, remotePeerConnection;

export default Ember.Controller.extend({
  localVideoSrc: null,
  remoteVideoSrc: null,
  localStream: null,
  remoteStream: null,
  startButtonDisabled: false,
  callButtonDisabled: true,
  hangupButtonDisabled: true,
  actions: {
    start: function() {
      var _this = this;
      this.send('log', 'Requesting local stream');
      this.set('startButtonDisabled', true);
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({audio: true, video: true}, function(stream) { 
        _this.send('successCallback', stream);
      }, function(err) {
        _this.send('errorCallback', err);
      });
    },
    call: function() {
      this.set('callButtonDisabled', true);
      this.set('hangupButtonDisabled', false);
      this.send('log', 'Starting call');
      var _this = this;
      if (navigator.webkitGetUserMedia) {
        if (_this.get('localStream').getVideoTracks().length > 0) {
          _this.send('log', 'Using video device: ' + _this.get('localStream').getVideoTracks()[0].label);
        }
        if (_this.get('localStream').getAudioTracks().length > 0) {
          _this.send('log', 'Using audio device: ' + _this.get('localStream').getAudioTracks()[0].label);
        }
      }
      if (navigator.webkitGetUserMedia) {
        RTCPeerConnection = webkitRTCPeerConnection;
      } else if (navigator.mozGetUserMedia) {
        RTCPeerConnection = mozRTCPeerConnection;
        RTCSessionDescription = mozRTCSessionDescription;
        RTCIceCandidate = mozRTCIceCandidate;
      }
      this.send('log', "RTCPeerConnection object: " + RTCPeerConnection);
      var servers = null;
      localPeerConnection = new RTCPeerConnection(servers);
      this.send('log', "Created local peer connection object localPeerConnection");
      localPeerConnection.onicecandidate = function(event) { 
        _this.send('gotLocalIceCandidate', event);
      }
      remotePeerConnection = new RTCPeerConnection(servers);
      this.send('log', "Created remote peer connection object remotePeerConnection");
      remotePeerConnection.onicecandidate = function(event) {
        _this.send('gotRemoteIceCandidate', event);
      }

      remotePeerConnection.onaddstream = function(event) { 
        _this.send('gotRemoteStream', event);
      }
      localPeerConnection.addStream(this.get('localStream'));

      this.send('log', "Added localStream to localPeerConnection");
      localPeerConnection.createOffer(function(description) {
        _this.send('gotLocalDescription', description);
      }, function(error) {
        _this.send('onSignalingError', error);
      });
    },
    hangup: function() {
      this.send('log', "Ending call");
      localPeerConnection.close();
      remotePeerConnection.close();
      localPeerConnection = null;
      remotePeerConnection = null;
      this.set('hangupButtonDisabled', true);
      this.set('callButtonDisabled', false);
    },
    log: function(text) {
      console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
    },
    successCallback: function(stream) {
      this.send('log', 'Received local stream');
      if (window.URL) {
        this.set('localVideoSrc', window.URL.createObjectURL(stream));
      } else {
        this.set('localVideoSrc', stream);
      }
      this.set('localStream', stream);
      this.set('callButtonDisabled', false);
    },
    errorCallback: function(err) {
      this.send('log', ("navigator.getUserMedia error: ", err));
    },
    onSignalingError: function(error) {
      console.log('Failed to create signaling message : ' + error.name);
    },
    gotLocalDescription: function(description) {
      var _this = this;
      localPeerConnection.setLocalDescription(description);
      this.send('log', "Offer from localPeerConnection: \n" + description.sdp);
      remotePeerConnection.setRemoteDescription(description);
      remotePeerConnection.createAnswer(function(description) {
        _this.send('gotRemoteDescription', description);
      }, function(error) {
        _this.send('onSignalingError', error);
      });
    },
    gotRemoteDescription: function(description) {
      remotePeerConnection.setLocalDescription(description);
      this.send('log', "Answer from remotePeerConnection: \n" + description.sdp);
      // Conversely, set the 'remote' description as the remote description of the local PeerConnection 
      localPeerConnection.setRemoteDescription(description);
    },
    gotRemoteStream: function(event) {
      console.log("event stream is " + event.stream);
      if (window.URL) {
        // Chrome
        this.set('remoteVideoSrc', window.URL.createObjectURL(event.stream));
      } else {
        // Firefox
        this.set('remoteVideoSrc', event.stream);
      }  
      this.send('log',"Received remote stream");

    },
    gotLocalIceCandidate: function(event) {
      if (event.candidate) {
      // Add candidate to the remote PeerConnection 
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        this.send('log', "Local ICE candidate: \n" + event.candidate.candidate);
      }
    },
    gotRemoteIceCandidate: function(event) {
      if (event.candidate) {
      // Add candidate to the local PeerConnection    
        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        this.send('log', "Remote ICE candidate: \n " + event.candidate.candidate);
      }
    }
  }

});
