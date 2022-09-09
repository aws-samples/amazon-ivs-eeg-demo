import React from 'react';
import { STANDARD_LANDSCAPE } from 'amazon-ivs-web-broadcast';

export class Util {
  static barOptions = {
    responsive: false,
    plugins: {
      title: {
        display: true,
        text: 'Brain Activity',
        font: {
          size: 10,
        }
      },
      legend: {
        display: false
      },
    },
    elements: {
      line: {
        borderColor: '#000000',
        borderWidth: 1
      },
      point: {
        radius: 0
      }
    },
    tooltips: {
      enabled: false
    },
    scales: {
      yAxes: {
        display: false
      },
      x: {
        display: false
      }
    }
  };

  static brainPreviewChartData = {
    labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
    datasets: [
      {
        label: 'Brain Activity',
        fill: true,
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255,153,17,.5)',
        borderColor: '#000000',
      }
    ],
  };

  async handlePermissions() {
    let permissions;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      for (const track of stream.getTracks()) {
        track.stop();
      }
      permissions = { video: true, audio: true };
    }
    catch (err) {
      permissions = { video: false, audio: false };
      console.error(err.message);
    }
    if (!permissions.video) {
      console.error('Failed to get video permissions.');
    } else if (!permissions.audio) {
      console.error('Failed to get audio permissions.');
    }
  }

  async createAudioStream(client, deviceId) {
    if (client && client.getAudioInputDevice('mic1')) client.removeAudioInputDevice('mic1');
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId
      },
    });
    if (client) client.addAudioInputDevice(audioStream, 'mic1');
    return audioStream;
  }

  async createVideoStream(client, deviceId) {
    if (client && client.getVideoInputDevice('camera1')) client.removeVideoInputDevice('camera1');
    const streamConfig = STANDARD_LANDSCAPE;
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: {
          ideal: streamConfig.maxResolution.width,
          max: streamConfig.maxResolution.width,
        },
        height: {
          ideal: streamConfig.maxResolution.height,
          max: streamConfig.maxResolution.height,
        },
      },
    });
    if (client) client.addVideoInputDevice(videoStream, 'camera1', { index: 0 });
    return videoStream;
  }

  async getDevices(videoDeviceId, audioDeviceId) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    const audioDevices = devices.filter((d) => d.kind === 'audioinput');
    let selectedVideoDeviceId = videoDeviceId;
    let selectedAudioDeviceId = audioDeviceId;
    let cameraOptions = [];
    let micOptions = [];

    videoDevices.forEach((device, idx) => {
      const option = <option key={device.deviceId} value={device.deviceId}>{device.label}</option>;
      if (!videoDeviceId && idx === 0) {
        selectedVideoDeviceId = device.deviceId;
      }
      cameraOptions.push(option);
    });
    audioDevices.forEach((device, idx) => {
      const option = <option key={device.deviceId} value={device.deviceId}>{device.label}</option>;
      if (!audioDeviceId && idx === 0) {
        selectedAudioDeviceId = device.deviceId;
      }
      micOptions.push(option);
    });
    return {
      selectedAudioDeviceId,
      selectedVideoDeviceId,
      micOptions,
      cameraOptions,
    };
  }
}