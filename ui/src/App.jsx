import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Broadcast from './routes/Broadcast';
import Playback from './routes/Playback';
import { Template } from './Template';

class App extends Component {
  render() {
    return (
      <Template>
        <BrowserRouter>
          <Navbar bg='dark' variant='dark' expand='lg' className='mb-3 border border-secondary rounded'>
            <Container fluid>
              <Navbar.Brand href='/'>BttC - IVS &amp; Muse</Navbar.Brand>
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
            <Route path='/broadcast' element={<Broadcast />} />
            <Route path='/playback' element={<Playback />} />
            <Route path="/" element={<Navigate to="/broadcast" />} />
          </Routes>
        </BrowserRouter>
      </Template>
    );
  }
}

export default App;
