<a href="https://docs.aws.amazon.com/ivs/"><img align="right" width="128px" src="./ivs-logo.svg"></a>
# amazon-ivs-eeg-demo

A React based demo of using Amazon IVS Web Broadcast, Timed Metadata, and the Web Player SDK to send brain waves along with a live stream and render them in a chart.

# About

Refer to the blog post [Live Streaming my Brain with Amazon IVS, React and a Muse Headband](https://dev.to/aws/live-streaming-my-brain-with-amazon-ivs-react-and-a-muse-headband-40gj).

# Getting Started

Create a file called `.env` in the root of this project and populate it with the paths to your preconfigured lambda function and your IVS stream URL.

```
REACT_APP_LAMBDA_URL = ''
REACT_APP_STREAM_URL = ''
```

Then start the application with:

```
npm start
```

And navigate to http://localhost:3000