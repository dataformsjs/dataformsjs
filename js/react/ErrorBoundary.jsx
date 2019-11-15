/**
 * React Component <ErrorBoundary>
 * 
 * This component is intended to be used as the root component when creating a
 * React App to help solve and display React Component Errors. Use of this
 * component is optional as other DataFormsJS React components do not depend
 * on it.
 * 
 * https://reactjs.org/docs/error-boundaries.html
 */

import React from 'react';

/* Validates with [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected and 'jsx' must be checked. */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null,
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <div>
                    <h2 style={{ textAlign:'left', color:'white', backgroundColor:'#bc0000', padding:'1em' }}>An error has occurred</h2>
                    <details style={{ whiteSpace:'pre-wrap', textAlign:'left', color:'white', backgroundColor:'red', padding:'1em' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}
