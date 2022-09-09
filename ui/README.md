<a href="https://docs.aws.amazon.com/ivs/"><img align="right" width="128px" src="./ivs-logo.svg"></a>
# amazon-ivs-eeg-demo

A React based demo of using Amazon IVS Web Broadcast, Timed Metadata, and the Web Player SDK to send brain waves along with a live stream and render them in a chart.

# About

Refer to the blog post [Live Streaming my Brain with Amazon IVS, React and a Muse Headband](https://dev.to/aws/live-streaming-my-brain-with-amazon-ivs-react-and-a-muse-headband-40gj).

## Prerequisites

* [NodeJS](https://nodejs.org/)
* Npm is installed with Node.js
* PutMetaData Dashboard Serverless app (Please refer to serverless/README.md for details on back-end configuration)

# Getting Started

Create a file named `.env` inside the `ui` project directory containing the `ApiURL` from the [serverless app](../serverless).

Replace `<ApiURL>` with your `ApiURL`. Replace `<playback-URL>` with the playback URL for your IVS channel.

```
REACT_APP_LAMBDA_URL = '<ApiURL>'
REACT_APP_STREAM_URL = '<playback-URL>'
```

## Running the demo

To run this app, follow these instructions:

1. [Install NodeJS](https://nodejs.org/). Download latest LTS version ("Recommended for Most Users")
2. Navigate to the ui project directory on your local computer.
3. Run: `npm install`
4. Run: `npm start`
5. Open your web browser and navigate to the following URL: http://localhost:3000/

And navigate to http://localhost:3000

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).