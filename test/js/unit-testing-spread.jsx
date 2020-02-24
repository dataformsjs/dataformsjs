'use strict';

function Greeting(props) {
    return <div class="greeting">{props.firstName} {props.lastName}</div>
}

function DisplayProps(props) {
    const { id, ...other } = props;
    other.message += ' test';
    return <React.Fragment>
            <div {...other} id="display-prop-test">{id + ' test'}</div>
            <div {...props} >{id}</div>
        </React.Fragment>;
}

function App2() {
    const data = {firstName: 'First', lastName: 'Last'};
    
    return <React.Fragment>
        <Greeting {...data} />
        <DisplayProps id="display-prop-1" message="Hello World"></DisplayProps>
    </React.Fragment>
}


ReactDOM.render(
    <App2 />,
    document.querySelector('.test-content.spread-syntax')
);
