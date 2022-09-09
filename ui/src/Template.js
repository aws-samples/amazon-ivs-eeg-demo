/* eslint-disable react/prop-types */
import React, { Component } from 'react';

export class Template extends Component {
  render() {
    return (
      <div className='container-fluid p-3'>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}