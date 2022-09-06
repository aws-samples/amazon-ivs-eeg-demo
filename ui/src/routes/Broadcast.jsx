import React, { Component } from 'react';
import { zipSamples, MuseClient } from 'muse-js';
import { powerByBand, epoch, fft } from '@neurosity/pipes';
import './Broadcast.css';
import { Badge, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faGear } from '@fortawesome/free-solid-svg-icons';
import IVSBroadcastClient, { STANDARD_LANDSCAPE } from 'amazon-ivs-web-broadcast';
import { Bar } from 'react-chartjs-2';

const LAMBDA_URL = `${process.env.REACT_APP_LAMBDA_URL}/send`;

export class Broadcast extends Component {
  constructor() {
    super();
    this.chartReference = React.createRef();
    this.previewRef = React.createRef();

    this.state = {
      museClient: null,
      isConnected: false,
      isBroadcasting: false,
      showModal: false,
      ingestEndpoint: '',
      streamKey: '',
      channelArn: '',
      cameraOptions: [],
      micOptions: [],
      selectedVideoDeviceId: '',
      selectedAudioDeviceId: '',
      broadcastClient: null,
      videoStream: null,
      audioStream: null,
    };

    this.state.previewData = {
      labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
      datasets: [
        {
          label: 'Brain Activity',
          fill: true,
          data: [0,0,0,0,0],
          backgroundColor: 'rgba(255,153,17,.5)',
          borderColor: '#000000',
        }
      ],
    };

    this.state.barOptions = {
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
        x:{
          display: false
        }
      }
    };
  }

  async componentDidMount() {
    const settings = JSON.parse( localStorage.getItem('web-broadcast') || '{}' );
    this.setState({
      ingestEndpoint: settings.ingestEndpoint,
      streamKey: settings.streamKey,
      selectedAudioDeviceId: settings.selectedAudioDeviceId,
      selectedVideoDeviceId: settings.selectedVideoDeviceId,
      channelArn: settings.channelArn,
    });

    // init web broadcast
    await this.handlePermissions();
    await this.getDevices();
    this.setState({
      broadcastClient: IVSBroadcastClient.create({
        streamConfig: STANDARD_LANDSCAPE,
        ingestEndpoint: this.state.ingestEndpoint,
      })
    });
    await this.createVideoStream();
    await this.createAudioStream();
    this.previewVideo();
  }

  handlePermissions = async () => {
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
  };

  getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    const audioDevices = devices.filter((d) => d.kind === 'audioinput');
    videoDevices.forEach((device, idx) => {
        const option = <option key={device.deviceId} value={device.deviceId}>{device.label}</option>;
        if (!this.state.selectedVideoDeviceId && idx === 0) {
            this.state.selectedVideoDeviceId = device.deviceId;
        }
        this.state.cameraOptions.push(option);
    });
    audioDevices.forEach((device, idx) => {
        const option = <option key={device.deviceId} value={device.deviceId}>{device.label}</option>;
        if (!this.state.selectedAudioDeviceId && idx === 0) {
            this.state.selectedAudioDeviceId = device.deviceId;
        }
        this.state.micOptions.push(option);
    });
  };

  createVideoStream = async () => {
    if (this.state.broadcastClient && this.state.broadcastClient.getVideoInputDevice('camera1')) this.state.broadcastClient.removeVideoInputDevice('camera1');
    const streamConfig = STANDARD_LANDSCAPE;
    const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: { exact: this.state.selectedVideoDeviceId },
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
    this.setState({videoStream});
    if (this.state.broadcastClient) this.state.broadcastClient.addVideoInputDevice(videoStream, 'camera1', { index: 0 });
  };

  createAudioStream = async () => {
      if (this.state.broadcastClient && this.state.broadcastClient.getAudioInputDevice('mic1')) this.state.broadcastClient.removeAudioInputDevice('mic1');
      const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
              deviceId: this.state.selectedAudioDeviceId
          },
      });
      this.setState({audioStream});
      if (this.state.broadcastClient) this.state.broadcastClient.addAudioInputDevice(audioStream, 'mic1');
  };

  previewVideo = () => {
    this.state.broadcastClient.attachPreview(this.previewRef.current);
  };

  handleBroadcast = async () => {
    if(!this.state.isBroadcasting) {
      try {
        await this.state.broadcastClient.startBroadcast(this.state.streamKey);
        this.setState({isBroadcasting: true});
      }
      catch(e) {
        console.error(e);
        this.setState({isBroadcasting: false});
      }
    }
    else {
      try {
        await this.state.broadcastClient.stopBroadcast();
        if(this.state.isConnected) this.state.museClient.disconnect();
        this.setState({isConnected: false});
      }
      catch(e) {
        console.error(e);
      }
      finally {
        this.setState({isBroadcasting: false});
      }
    }
  };

  handleModalClose = () => {
    const settings = {
      ingestEndpoint: this.state.ingestEndpoint, 
      streamKey: this.state.streamKey,
      selectedVideoDeviceId: this.state.selectedVideoDeviceId,
      selectedAudioDeviceId: this.state.selectedAudioDeviceId,
      channelArn: this.state.channelArn,
    };
    localStorage.setItem('web-broadcast', JSON.stringify(settings));
    this.setState({ showModal: false });
  };

  handleModalShow = () => {
    this.setState({ showModal: true });
  };

  handleIngestEndpointChange = (e) => {
    this.setState({ingestEndpoint: e.target.value});
  };

  handleChannelArnChange = (e) => {
    this.setState({channelArn: e.target.value});
  };

  handleCamChange = (e) => {
    this.setState({selectedVideoDeviceId: e.target.value}, () => {
      this.createVideoStream();
    });
  };

  handleMicChange = (e) => {
    this.setState({selectedAudioDeviceId: e.target.value}, () => {
      this.createAudioStream();
    });
  };

  handleStreamKeyChange = (e) => {
    this.setState({streamKey: e.target.value});
  };

  connect = async () => {
    const client = new MuseClient();
    this.setState({museClient: client});
    client.connectionStatus.subscribe((status) => {
      this.setState({
        isConnected: status,
      });
    });

    // init Muse headset
    try {
      await client.connect();
      await client.start();
      zipSamples(client.eegReadings)
        .pipe(
          epoch({ duration: 1024, interval: 250, samplingRate: 256 }),
          fft({ bins: 256 }),
          powerByBand(),
        )
        .subscribe(
          (data) => {
            const ch0 = [data.delta[0], data.theta[0], data.alpha[0], data.beta[0], data.gamma[0]];
            const ch1 = [data.delta[1], data.theta[1], data.alpha[1], data.beta[1], data.gamma[1]];
            const ch2 = [data.delta[2], data.theta[2], data.alpha[2], data.beta[2], data.gamma[2]];
            const ch3 = [data.delta[3], data.theta[3], data.alpha[3], data.beta[3], data.gamma[3]];
            const meta = [ch0, ch1, ch2, ch3];
            
            this.setState(state => {
              state.previewData.datasets[0].data = ch0;
              this.chartReference.current.data.datasets[0].data = state.previewData.datasets[0].data;
              return ({
                previewData: {
                  ...state.previewData,
                  datasets: [
                    {
                      ...state.previewData.datasets[0],
                      data: state.previewData.datasets[0].data
                    }
                  ],
                },
              });
            });

            // put metadata if broadcasting
            if(this.state.isBroadcasting) {
              fetch(LAMBDA_URL, {
                'method': 'POST',
                'mode': 'no-cors',
                'headers': {
                  'Content-Type': 'application/json',
                },
                'body': JSON.stringify({
                  channelArn: this.state.channelArn,
                  metadata: JSON.stringify(meta)
                })
              });
            }
          },
        );
    }
    catch (err) {
      console.error('Connection failed', err);
    }
  };

  render() {
    return (
      <>
        <Row>
          <Col lg='8' xs='12' className='offset-lg-2 mb-lg-3'>
            <Card className='border-dark'>
              <Card.Header className='d-flex justify-content-between p-2 bg-dark text-white'>
                <span className='fw-bold'>IVS Broadcast</span>
                <div className='align-self-center'>
                  <Badge 
                    bg={this.state.isBroadcasting ? 'badge bg-success' : 'badge bg-danger'} 
                    className='me-1'>
                      <b>Stream: </b>{this.state.isBroadcasting ? 'Broadcasting' : 'Offline'}
                  </Badge>
                  <Badge 
                    bg={this.state.isConnected ? 'badge bg-success' : 'badge bg-danger'}>
                      <b>Headband: </b>{this.state.isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
              </Card.Header>
              <div className='position-relative d-flex align-items-center'>
                <canvas ref={this.previewRef} id='broadcast-preview'></canvas>
                <div className='position-absolute bottom-0 end-0 p-2'>
                  <Bar ref={this.chartReference} width={150} height={75} data={this.state.previewData} options={this.state.barOptions}  />
                </div>
              </div>
              <Card.Footer className='p-2 bg-light border-dark'>
                <Row>
                  <Col>
                    <Button 
                      size='sm'
                      variant='dark' 
                      disabled={this.state.isConnected || !this.state.isBroadcasting} 
                      onClick={this.connect}>
                        <FontAwesomeIcon icon={faBrain} /> Connect Muse
                    </Button>
                  </Col>
                  <Col className='text-center'>
                    <Button 
                      size='sm'
                      variant={this.state.isBroadcasting ? 'danger' : 'primary'} 
                      onClick={this.handleBroadcast}>
                        {this.state.isBroadcasting ? 'Stop Broadcast' : 'Broadcast'}
                    </Button>
                  </Col>
                  <Col className='text-end'>
                    <Button size='sm' variant='dark' onClick={this.handleModalShow}><FontAwesomeIcon icon={faGear} /></Button>
                  </Col>
                </Row>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        <Modal show={this.state.showModal} onHide={this.handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Web Broadcast Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className='mb-3' controlId='formCam'>
                <Form.Label>Camera</Form.Label>
                <Form.Select defaultValue={this.state.selectedVideoDeviceId} onChange={this.handleCamChange}>
                  {this.state.cameraOptions}
                </Form.Select>
              </Form.Group>
              <Form.Group className='mb-3' controlId='formMic'>
                <Form.Label>Microphone</Form.Label>
                <Form.Select defaultValue={this.state.selectedAudioDeviceId} onChange={this.handleMicChange}>
                  {this.state.micOptions}
                </Form.Select>
              </Form.Group>
              <Form.Group className='mb-3' controlId='formChannelArn'>
                <Form.Label>Channel Arn</Form.Label>
                <Form.Control 
                  type='text' 
                  placeholder='Arn' 
                  value={this.state.channelArn} 
                  onChange={this.handleChannelArnChange} />
              </Form.Group>
              <Form.Group className='mb-3' controlId='formBasicPassword'>
                <Form.Label>Ingest Endpoint</Form.Label>
                <Form.Control 
                  type='text' 
                  placeholder='Ingest Endpoint' 
                  value={this.state.ingestEndpoint} 
                  onChange={this.handleIngestEndpointChange} />
              </Form.Group>
              <Form.Group className='mb-3' controlId='formBasicEmail'>
                <Form.Label>Stream Key</Form.Label>
                <Form.Control 
                  type='password' 
                  placeholder='Enter Stream Key' 
                  value={this.state.streamKey} 
                  onChange={this.handleStreamKeyChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={this.handleModalClose}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
export default Broadcast;
