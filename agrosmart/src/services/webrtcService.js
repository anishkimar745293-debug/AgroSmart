import {
  addIceCandidate,
  saveAnswer,
  saveOffer,
  listenIceCandidates,
} from "./callService";

/*
==================================================
Global Variables
==================================================
*/

let peerConnection = null;

let localStream = null;

let remoteStream = null;

/*
==================================================
ICE Servers
==================================================
*/

const configuration = {
  iceServers: [
    {
      urls: import.meta.env.VITE_STUN_URL,
    },
    {
      urls: import.meta.env.VITE_TURN_URL_1,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
    {
      urls: import.meta.env.VITE_TURN_URL_2,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
    {
      urls: import.meta.env.VITE_TURN_URL_3,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
    {
      urls: import.meta.env.VITE_TURN_URL_4,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
  ],
};

/*
==================================================
Create Peer Connection
==================================================
*/


// Ensure peerConnection global context me set ho sake
export const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);
  window.peerConnection = peerConnection; // Failsafe global binding
  
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
  return peerConnection;
};

export const startLocalStream = async (video = true) => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: video,
    audio: true,
  });
  return localStream;
};

export const addLocalTracks = () => {
  if (!peerConnection || !localStream) return;
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};

export const createAnswer = async (callId, offerDescription) => {
  if (!peerConnection) createPeerConnection();
  
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await saveAnswer(callId, answer);
};



/*
==================================================
Get Peer Connection
==================================================
*/

export const getPeerConnection = () => {

  return peerConnection;

};



/*
==================================================
Receive Remote Tracks
==================================================
*/

export const registerRemoteTracks = (
  callback
) => {

  peerConnection.ontrack = (
    event
  ) => {

    event.streams[0]
      .getTracks()
      .forEach(track => {

        remoteStream.addTrack(track);

      });

    callback(remoteStream);

  };

};

/*
==================================================
Connection State
==================================================
*/

export const listenConnectionState = (
  callback
) => {

  peerConnection.onconnectionstatechange =
    () => {

      callback(
        peerConnection.connectionState
      );

    };

};

/*
==================================================
ICE Gathering State
==================================================
*/

export const listenIceGatheringState = (
  callback
) => {

  peerConnection.onicegatheringstatechange =
    () => {

      callback(
        peerConnection.iceGatheringState
      );

    };

};

/*
==================================================
ICE Connection State
==================================================
*/

export const listenIceConnectionState = (
  callback
) => {

  peerConnection.oniceconnectionstatechange =
    () => {

      callback(
        peerConnection.iceConnectionState
      );

    };

};

/*
==================================================
Create Offer
==================================================
*/

export const createOffer = async (callId) => {

  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  await peerConnection.setLocalDescription(offer);

  await saveOffer(callId, offer);

  return offer;

};


/*
==================================================
Set Remote Answer
==================================================
*/

export const setRemoteAnswer = async (
  answer
) => {

  if (
    peerConnection.currentRemoteDescription
  ) return;

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );

};

/*
==================================================
Listen Local ICE Candidates
==================================================
*/

export const startIceCandidateListener = (
  callId,
  collectionName
) => {

  peerConnection.onicecandidate =
    async (event) => {

      if (!event.candidate) return;

      await addIceCandidate(
        callId,
        collectionName,
        event.candidate.toJSON()
      );

    };

};

/*
==================================================
Listen Remote ICE Candidates
==================================================
*/

export const startRemoteIceListener = (
  callId,
  collectionName
) => {

  return listenIceCandidates(

    callId,

    collectionName,

    async (candidate) => {

      try {

        await peerConnection.addIceCandidate(

          new RTCIceCandidate(candidate)

        );

      }

      catch (err) {

        console.log(
          "ICE Error",
          err
        );

      }

    }

  );

};

/*
==================================================
Wait ICE Gathering Complete
==================================================
*/

export const waitForIceGathering =
  () => {

    return new Promise(

      (resolve) => {

        if (
          peerConnection.iceGatheringState ===
          "complete"
        ) {

          resolve();

          return;

        }

        const checkState = () => {

          if (

            peerConnection.iceGatheringState ===

            "complete"

          ) {

            peerConnection.removeEventListener(

              "icegatheringstatechange",

              checkState

            );

            resolve();

          }

        };

        peerConnection.addEventListener(

          "icegatheringstatechange",

          checkState

        );

      }

    );

  };

  /*
==================================================
Toggle Microphone
==================================================
*/

export const toggleMicrophone = () => {

  if (!localStream) return false;

  const audioTrack = localStream
    .getAudioTracks()[0];

  if (!audioTrack) return false;

  audioTrack.enabled =
    !audioTrack.enabled;

  return audioTrack.enabled;

};

/*
==================================================
Toggle Camera
==================================================
*/

export const toggleCamera = () => {

  if (!localStream) return false;

  const videoTrack = localStream
    .getVideoTracks()[0];

  if (!videoTrack) return false;

  videoTrack.enabled =
    !videoTrack.enabled;

  return videoTrack.enabled;

};

/*
==================================================
Replace Video Track
==================================================
*/

export const replaceVideoTrack =
async (newTrack) => {

  if (!peerConnection) return;

  const sender =
    peerConnection
      .getSenders()
      .find(sender =>
        sender.track &&
        sender.track.kind === "video"
      );

  if (!sender) return;

  await sender.replaceTrack(
    newTrack
  );

};

/*
==================================================
Start Screen Share
==================================================
*/

export const startScreenShare =
async () => {

  const screenStream =
    await navigator.mediaDevices.getDisplayMedia({

      video: true,

      audio: false,

    });

  const screenTrack =
    screenStream.getVideoTracks()[0];

  await replaceVideoTrack(
    screenTrack
  );

  screenTrack.onended =
    async () => {

      const cameraTrack =
        localStream
          .getVideoTracks()[0];

      if (cameraTrack) {

        await replaceVideoTrack(
          cameraTrack
        );

      }

    };

};

/*
==================================================
Stop Local Stream
==================================================
*/

export const stopLocalStream = () => {

  if (!localStream) return;

  localStream
    .getTracks()
    .forEach(track => {

      track.stop();

    });

};

/*
==================================================
Close Peer Connection
==================================================
*/

export const closePeerConnection =
() => {

  if (!peerConnection) return;

  peerConnection.close();

  peerConnection = null;

};

/*
==================================================
Cleanup
==================================================
*/

export const cleanupWebRTC = () => {

  if (localStream) {

    localStream
      .getTracks()
      .forEach(track => {

        track.stop();

      });

    localStream = null;

  }

  if (remoteStream) {

    remoteStream
      .getTracks()
      .forEach(track => {

        track.stop();

      });

    remoteStream = null;

  }

  if (peerConnection) {

    peerConnection.close();

    peerConnection = null;

  }

};

/*
==================================================
Track End Events
==================================================
*/

export const listenTrackEvents =
(callback) => {

  if (!localStream) return;

  localStream
    .getTracks()
    .forEach(track => {

      track.onended = () => {

        callback(track.kind);

      };

    });

};

/*
==================================================
Listen Connection Failure
==================================================
*/

export const listenConnectionFailure =
(callback) => {

  peerConnection.onconnectionstatechange =
    () => {

      const state =
        peerConnection.connectionState;

      if (

        state === "failed" ||

        state === "disconnected" ||

        state === "closed"

      ) {

        callback(state);

      }

    };

};

/*
==================================================
Get Connection State
==================================================
*/

export const getConnectionState = () => {

  if (!peerConnection) {

    return "closed";

  }

  return peerConnection.connectionState;

};

/*
==================================================
Get Signaling State
==================================================
*/

export const getSignalingState = () => {

  if (!peerConnection) {

    return "closed";

  }

  return peerConnection.signalingState;

};

/*
==================================================
Get ICE Connection State
==================================================
*/

export const getIceConnectionState = () => {

  if (!peerConnection) {

    return "closed";

  }

  return peerConnection.iceConnectionState;

};

/*
==================================================
Restart ICE
==================================================
*/

export const restartIce = async () => {

  if (!peerConnection) return;

  if (peerConnection.restartIce) {

    peerConnection.restartIce();

  }

};

/*
==================================================
Attach Local Stream
==================================================
*/

export const attachLocalStream = (
  videoElement
) => {

  if (
    videoElement &&
    localStream
  ) {

    videoElement.srcObject =
      localStream;

  }

};

/*
==================================================
Attach Remote Stream
==================================================
*/

export const attachRemoteStream = (
  videoElement
) => {

  if (
    videoElement &&
    remoteStream
  ) {

    videoElement.srcObject =
      remoteStream;

  }

};

/*
==================================================
Listen Signaling State
==================================================
*/

export const listenSignalingState = (
  callback
) => {

  if (!peerConnection) return;

  peerConnection.onsignalingstatechange =
    () => {

      callback(
        peerConnection.signalingState
      );

    };

};

/*
==================================================
Listen ICE Candidate Errors
==================================================
*/

export const listenIceErrors = (
  callback
) => {

  if (!peerConnection) return;

  peerConnection.onicecandidateerror =
    (event) => {

      callback(event);

    };

};

/*
==================================================
Is Connected
==================================================
*/

export const isConnected = () => {

  if (!peerConnection) {

    return false;

  }

  return (
    peerConnection.connectionState ===
    "connected"
  );

};

/*
==================================================
Destroy Everything
==================================================
*/

export const getLocalStream = () => localStream;
export const getRemoteStream = () => remoteStream;

