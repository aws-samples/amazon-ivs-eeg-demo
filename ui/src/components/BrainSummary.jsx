import React, { Component } from 'react';
import { Badge, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';

export default class BrainSummary extends Component {
  propTypes;
  render() {
    return(
      <Row className='mb-2'>
        {/* 
            Delta: 0
            Theta: 1
            Alpha: 2
            Beta: 3
            Gamma: 4
        */}
        <Col xs={12} xxl={4} className='align-items-center mb-2 mb-xxl-0'>
          <Badge className='fs-6 w-100' bg='info'>
            Relaxation: 
            <span className='fw-bold'>
              <NumberFormat value={this.props.dataset.data[0] ? (this.props.dataset.data[2] / this.props.dataset.data[0]) : 0} decimalScale={2} displayType={'text'} />
            </span>
          </Badge> 
        </Col>
        <Col xs={12} xxl={4} className='align-items-center mb-2 mb-xxl-0'>
          <Badge className='fs-6 w-100' bg='info'>
            Fatigue: 
            <span className='fw-bold'>
              <NumberFormat value={ this.props.dataset.data[3] ? ( (this.props.dataset.data[1] + this.props.dataset.data[2]) / this.props.dataset.data[3] ) : 0 } decimalScale={2} displayType={'text'} />
            </span>
          </Badge> 
        </Col>
        <Col xs={12} xxl={4} className='align-items-center mb-2 mb-xxl-0'>
          <Badge className='fs-6 w-100' bg='info'>
            Focus: 
            <span className='fw-bold'>
              <NumberFormat value={this.props.dataset.data[1] ? (this.props.dataset.data[3] / this.props.dataset.data[1]) : 0} decimalScale={2} displayType={'text'} />
            </span>
          </Badge>
        </Col>
      </Row>
    );
  }
}
BrainSummary.propTypes = {
    dataset: PropTypes.object,
};