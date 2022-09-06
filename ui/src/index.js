import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Broadcast from './routes/Broadcast';
import Playback from './routes/Playback';
import { Template } from './Template';
import { Container, Nav, Navbar } from 'react-bootstrap';
import ivs from './assets/ivs.png';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <Template>
    <BrowserRouter>
      <Navbar bg='dark' variant='dark' expand='lg' className='mb-3 border border-secondary rounded'>
        <Container fluid>
          <Navbar.Brand href='#home'><img src={ivs} alt='IVS Logo' /> BttC - IVS &amp; Muse</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <LinkContainer to='/broadcast'>
                <Nav.Link>Broadcast</Nav.Link>
              </LinkContainer>
              <LinkContainer to='/playback'>
                <Nav.Link>Player</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/broadcast' element={<Broadcast />} />
        <Route path='/playback' element={<Playback />} />
      </Routes>
    </BrowserRouter>
  </Template>
);
registerServiceWorker();
