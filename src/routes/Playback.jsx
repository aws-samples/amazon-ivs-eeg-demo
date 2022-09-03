import React, { Component } from 'react';
import { channelNames } from 'muse-js';

// eslint-disable-next-line no-unused-vars
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import './Broadcast.css';
import { Badge, Button, ButtonGroup, Card, Col, Row } from 'react-bootstrap';
import BrainSummary from '../components/BrainSummary';

const { IVSPlayer } = window;
const { create: createMediaPlayer, isPlayerSupported, PlayerEventType, PlayerState } = IVSPlayer;
const { ENDED, PLAYING, READY, BUFFERING } = PlayerState;
const { TEXT_METADATA_CUE, ERROR } = PlayerEventType;
const STREAM_URL = process.env.REACT_APP_STREAM_URL;

export class Playback extends Component {
  constructor() {
    super();
    this.chartReferenceCh0 = React.createRef();
    this.chartReferenceCh1 = React.createRef();
    this.chartReferenceCh2 = React.createRef();
    this.chartReferenceCh3 = React.createRef();
    this.videoRef = React.createRef();
    this.playerRef = React.createRef();

    this.state = {
      status: 'Disconnected',
      isPlaying: false,
      currentChannel: 0,
      ch0: {
        labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
        datasets: [
          {
            label: 'Channel 0',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [0, 0, 0, 0, 0]
          }
        ]
      },
      ch1: {
        labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
        datasets: [
          {
            label: 'Channel 1',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [0, 0, 0, 0, 0]
          }
        ]
      },
      ch2: {
        labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
        datasets: [
          {
            label: 'Channel 2',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [0, 0, 0, 0, 0]
          }
        ]
      },
      ch3: {
        labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
        datasets: [
          {
            label: 'Channel 3',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [0, 0, 0, 0, 0]
          }
        ]
      }
    };
  }

  showChannel = (channel) => {
    this.setState({
      currentChannel: channel
    });
  };

  componentWillUnmount() {
    if (!this.playerRef.current) return;
    this.playerRef.current.removeEventListener(READY, this.onPlayerStateChange);
    this.playerRef.current.removeEventListener(PLAYING, this.onPlayerStateChange);
    this.playerRef.current.removeEventListener(BUFFERING, this.onPlayerStateChange);
    this.playerRef.current.removeEventListener(ENDED, this.onPlayerStateChange);
    this.playerRef.current.removeEventListener(ERROR, this.onPlayerError);
    this.playerRef.current.removeEventListener(TEXT_METADATA_CUE, this.onPlayerMetadata);

    this.playerRef.current.pause();
    this.playerRef.current.delete();
    this.playerRef.current = null;
    this.videoRef.current?.removeAttribute('src'); // remove possible stale src
  }

  componentDidMount() {
    if (!isPlayerSupported) {
      console.warn('IVS Player is not supported!');
    }
    this.playerRef.current = createMediaPlayer();
    this.playerRef.current.attachHTMLVideoElement(this.videoRef.current);
    this.playerRef.current.load(STREAM_URL);
    this.playerRef.current.play();

    this.playerRef.current.addEventListener(READY, this.onPlayerStateChange);
    this.playerRef.current.addEventListener(PLAYING, this.onPlayerStateChange);
    this.playerRef.current.addEventListener(BUFFERING, this.onPlayerStateChange);
    this.playerRef.current.addEventListener(ENDED, this.onPlayerStateChange);
    this.playerRef.current.addEventListener(ERROR, this.onPlayerError);
    this.playerRef.current.addEventListener(TEXT_METADATA_CUE, this.onPlayerMetadata);
  }

  onPlayerMetadata = (e) => {
    const data = JSON.parse(e.text);
    this.setState(state => {
      state.ch0.datasets[0].data = data[0];
      state.ch1.datasets[0].data = data[1];
      state.ch2.datasets[0].data = data[2];
      state.ch3.datasets[0].data = data[3];

      this.chartReferenceCh0.current.data.datasets[0].data = state.ch0.datasets[0].data;
      this.chartReferenceCh1.current.data.datasets[0].data = state.ch1.datasets[0].data;
      this.chartReferenceCh2.current.data.datasets[0].data = state.ch2.datasets[0].data;
      this.chartReferenceCh3.current.data.datasets[0].data = state.ch3.datasets[0].data;
      
      return ({
        ch0: state.ch0,
        ch1: state.ch1,
        ch2: state.ch2,
        ch3: state.ch3
      });
    });
  };

  onPlayerError = (e) => {
    console.error(e);
  };

  onPlayerStateChange = () => {
    this.setState({
      isPlaying: this.playerRef.current.getState() === PLAYING,
    });
    if(this.playerRef.current.getState() === ENDED) {
      this.videoRef.current.setAttribute('src', null);
    }
  };

  render() {
    return (
      <div>
        <Row>
          <Col lg='8' xs='12' className='mb-lg-0 mb-3'>
            <Card className='h-100 border-dark'>
              <Card.Header className='d-flex justify-content-between bg-dark text-white'>
                <span className='fw-bold'>IVS Player</span>
                <div className='align-items-center'>
                  <Badge bg={this.state.isPlaying ? 'badge bg-success' : 'badge bg-danger'}>{this.state.isPlaying ? 'Online' : 'Offline'}</Badge>
                </div>
              </Card.Header>
              <Card.Body className='d-flex align-items-center'>
                <video ref={this.videoRef} id='video-player' className='w-100 rounded rounded-3 shadow' controls playsInline></video>
              </Card.Body>
            </Card>
          </Col>
          <Col lg='4' xs='12'>
            <Card className='h-100 border-dark'>
              <Card.Header className='d-flex justify-content-between bg-dark text-white'>
                <span className='fw-bold'>Brain Data</span>
              </Card.Header>
              <Card.Body>
                <div>
                  <ButtonGroup className='mb-2 text-center w-100'>
                    <Button onClick={() => { this.showChannel(0); }} className={this.state.currentChannel === 0 ? 'active' : ''}>Ch 0</Button>
                    <Button onClick={() => { this.showChannel(1); }} className={this.state.currentChannel === 1 ? 'active' : ''}>Ch 1</Button>
                    <Button onClick={() => { this.showChannel(2); }} className={this.state.currentChannel === 2 ? 'active' : ''}>Ch 2</Button>
                    <Button onClick={() => { this.showChannel(3); }} className={this.state.currentChannel === 3 ? 'active' : ''}>Ch 3</Button>
                  </ButtonGroup>
                  <div>
                    <div className={this.state.currentChannel !== 0 ? 'd-none' : ''}>
                      <BrainSummary dataset={this.state.ch0.datasets[0]} />
                      <Bar data={this.state.ch0} className='border border-secondary rounded' ref={this.chartReferenceCh0} height={null} width={null} options={{ aspectRatio: (this.state.isPlaying ? '.95' : '1.1'), title: { display: true, text: 'Channel: ' + channelNames[0] }, responsive: true, tooltips: { enabled: false }, legend: { display: false } }} />
                    </div>
                    <div className={this.state.currentChannel !== 1 ? 'd-none' : ''}>
                      <BrainSummary dataset={this.state.ch1.datasets[0]} />
                      <Bar data={this.state.ch1} className='border border-secondary rounded' ref={this.chartReferenceCh1} height={null} width={null} options={{ aspectRatio: (this.state.isPlaying ? '.95' : '1.1'), title: { display: true, text: 'Channel: ' + channelNames[1] }, responsive: true, tooltips: { enabled: false }, legend: { display: false } }} />
                    </div>
                    <div className={this.state.currentChannel !== 2 ? 'd-none' : ''}>
                      <BrainSummary dataset={this.state.ch2.datasets[0]} />
                      <Bar data={this.state.ch2} className='border border-secondary rounded' ref={this.chartReferenceCh2} height={null} width={null} options={{ aspectRatio: (this.state.isPlaying ? '.95' : '1.1'), title: { display: true, text: 'Channel: ' + channelNames[2] }, responsive: true, tooltips: { enabled: false }, legend: { display: false } }} />
                    </div>
                    <div className={this.state.currentChannel !== 3 ? 'd-none' : ''}>
                      <BrainSummary dataset={this.state.ch3.datasets[0]} />
                      <Bar data={this.state.ch3} className='border border-secondary rounded' ref={this.chartReferenceCh3} height={null} width={null} options={{ aspectRatio: (this.state.isPlaying ? '.95' : '1.1'), title: { display: true, text: 'Channel: ' + channelNames[3] }, responsive: true, tooltips: { enabled: false }, legend: { display: false } }} />
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Playback;
