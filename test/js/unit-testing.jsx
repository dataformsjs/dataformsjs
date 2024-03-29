
// "use strict"; will automatically be added by both the jsxLoader or Babel
const isStrictMode = (function() { return !this; })();

// Make sure the compiler allows [//] comment characters with-in the 3 types of JavaScript Strings.
const links = [
    'https://www.dataformsjs.com/en/',
    "https://www.dataformsjs.com/pt-BR/",
    `https://www.dataformsjs.com/zh-CN/`,
];

// Comments with data that would cause parsing errors are included to make sure they
// are removed and that the overall rendering is not affected.

// Test Comment: <Data>{test}

/*
    Test <div>{test}
*/

{/*
    Test <Test>{test}
*/}

// This should not cause a parsing error or unexpected data.
const testHtmlString = `${`'<div>test</div>'`}`

// Build data and make sure `< ` is handled in `for` loops:
const columns = [];
const records = [];
for (let n = 0; n < 5; n++) {
    columns.push('Column ' + n);
}
for (let n = 0; n < 5; n++) {
    const record = [];
    for (let m = 0; m < 5; m++) {
        record.push('R-' + n + ' C-' + m);
    }
    records.push({ values: record });
}

class HelloMessage extends React.Component {
    render() {
      return (
        <div id={this.props.id}>
            Hello {this.props.name}
        </div>
      );
    }
}

function ShowTrue() {
    return <span>true</span>
}

function ShowFalse() {
    return <span>false</span>
}

const testNamespace = {
    Hello: function() {
        return <div className='test-namespace-1'>Hello from [testNamespace.Hello]</div>
    }
};
const TestNamespace = {
    Hello: function() {
        return <div className="test-namespace-2">Hello from [TestNamespace.Hello]</div>
    }
};

function Node(props) {
    if (props.child) {
        return <div id={props.id}><span>{String.fromCharCode(160).repeat(props.indent * 4)}{props.text}</span>{props.child}</div>;
    }
    return <div id={props.id}>
        <span>{String.fromCharCode(160).repeat(props.indent * 4)}{props.text}</span> {props.children}
    </div>;
}

function BlogPage(props) {
    return <section className="blog">{props.children}</section>;
}

function VideoPage(props) {
    return <section className="video">{props.children}</section>;
}

const pageTypes = {
    blog: BlogPage,
    video: VideoPage,
};

function Page(props) {
    const PageComponent = pageTypes[props.pageType];
    return <PageComponent>{props.children}</PageComponent>;
}

// Modified from: https://reactjs.org/docs/jsx-in-depth.html
function NumberDescriber(props) {
    let description;
    if (props.number % 2 == 0) {
        description = <strong>even</strong>;
    } else {
        description = <i>odd</i>;
    }
    return <div id={props.id}>{props.number} is an {description} number</div>;
}

function DisplayUsers({users}) {
    return (
        <ul className="users">
            {users.map(({id, name}) => {
                return <li id={'user-' + id}>{name}</li>
            })}
        </ul>
    );
}

function DisplayUsers2(props) {
    return (
        <ul className="users-2">
            {[
                <li id={'user2-' + props.users[0].id}>{props.users[0].name + ' Test'}</li>,
                <li id={'user2-' + props.users[1].id}>{props.users[1].name + ' Test'}</li>
            ]}
        </ul>
    );
}

// Make sure <React.Fragment> shorthand <> is supported.
// For Older Browsers that use Babel this requires Babel 7 instead of Babel 6.
function ShorthandFragment() {
    return (
        <>
            <div className="shorthand-fragment">Shorthand Fragment Check</div>
        </>
    );
}

// Included a 2nd time for a handled edge case error discovered when updating tests.
// Specifically a `state.elementCount > 0` check in `removeComments()`
function ShorthandFragment2() {
    return (
        <>
            <div className="shorthand-fragment2">Shorthand Fragment Check 2</div>
        </>
    );
}

function Greeting(props) {
    return <div className="greeting">{props.firstName} {props.lastName}</div>
}

function DisplayProps(props) {
    const { id, ...other } = props;
    other.message += ' test';
    return <React.Fragment>
            <div {...other} id="display-prop-test">{id + ' test'}</div>
            <div {...props} >{id}</div>
        </React.Fragment>;
}

function ShowLinks() {
    return <ul className="links2">
                <li>Test</li>
                {links.map(link => {
                    return <li key={link}>{link}</li>
                })}
            </ul>;
}

// https://github.com/dataformsjs/dataformsjs/issues/19
const Issue19_Ob = (props) => {
    return <div>{props.r()}</div>
}

const Issue19_App = () => {
    return <div id="issue-19">
        hello
        <Issue19_Ob r={() => {
            return <h1>zzzz</h1>
        }}/>
    </div>
}

function Issue20() {
    const n = 10;
    const m = 1<n;
    const text = (1<n ? 'true': 'false');
    const text2 = (1<n || 1 ? 'true2': 'false2');
    const text3 = (1<n && 1 ? 'true3': 'false3');
    const text4 = ((1<n) ? 'true4': 'false4');
    return (
        <div id="issue-20">{m ? 'yes': 'no'} {text} {text2} {text3} {text4}</div>
    );
}

function Issue21() {
    const items = ['Item1', 'Item2', 'Item3']
    return (
        <div id="issue-21">
            <select>
                <option value=""></option>
                {items.map(item => <option value={item}>{item}</option>)}
            </select>
        </div>
    );
}

class UnitTestPage extends React.Component {
    render() {
        const users = [
            { id:1, name:"User1" },
            { id:2, name:"User2" },
        ];

        const user = {firstName: 'First', lastName: 'Last'};
        const div10 = (123 <= 456 ? 'true' : 'false');

        return (
            <React.Fragment>
                <h1>Unit Testing Content</h1>

                <div className="is-strict-mode">use strict: {(isStrictMode ? 'true' : 'false')}</div>

                <HelloMessage name="World" id="hello-1" />
                <HelloMessage name="Test" id="hello-2"></HelloMessage>

                <div id="div-1">{' '}<span>div-1</span></div>
                <div id="div-2">{' '} <span>div-2</span></div>
                <div id="div-3">{( <span>div-3</span>) }</div>
                <div id="div-4"><span>Hello</span>{' '}<span>World</span></div>
                <div id="div-5">{123} &amp; {456} &#039;</div>
                <div id="div-6"> Hello World </div>
                <div id="div-7">&nbsp;&nbsp;Hello World&nbsp;&nbsp;</div>
                <div id="div-8">  Hello World  </div>
                <div id="div-9" data-selector="ul.link > li">https://www.dataformsjs.com/</div>
                <div id="div-10">{div10}</div>
                <div id="div-11">{(123 <= 456 ? 'true' : 'false')}</div>
                <ShowProps id="div-12"></ShowProps>
                <ShowProps id="div-13" test></ShowProps>

                <hr />
                <hr></hr>
                <hr/>

                <ul className="links">
                    {links.map(link => {
                        // This specific comment is related to a fix for release 4.0.1 where
                        // support for JavaScript comments nested with-in elements was removed.
                        // This specific line would cause an error release 4.0.0. <li>
                        return (
                            <li key={link}>
                                <a href={link} target="_blank">{link}</a>
                            </li>
                        )
                    })}
                </ul>

                <ShowLinks />

                {/*
                    Including [accept="image/*"] verifies that the [/*] inside of the string in [accept]
                    does not cause an issue when comments are removed.
                */}
                <input id="file-1" type="file" accept="image/*" multiple />

                <select>
                    <option value="">Empty</option>
                    <option value="item-1">Item 1</option>
                </select>

                <div id="test-html-string">{testHtmlString}</div>

                {/*
                    Typically in JSX [className] is used for classes, however in general [class] should not causes issues.
                    This test confirms it and that elements can be used in the ternary operator (cond ? true : false)
                */}
                <div className="expect-true">{1 === 1 ? <ShowTrue /> : <ShowFalse />}</div>
                <div className="expect-false">{1 === 2 ? <ShowTrue /> : <ShowFalse />}</div>

                <testNamespace.Hello />
                <TestNamespace.Hello />

                {links.length && <div className="link-count">
                        <span>{'Link Count: ' + links.length}</span>
                    </div>}

                {links.length && <div className="link-count-2">
                        <span>Link Count 2: {links.length}</span>
                    </div>}

                <table data-sort data-sort-class-odd="row-odd" data-sort-class-even="row-even">
                    <thead>
                        <tr>
                            {columns.map(column => {
                                return <th key={column}>{column}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody className="click-to-highlight">
                        {records.map((record, index) => {
                            return (<tr key={index}>
                                {record.values.map((value, valueIndex) => {
                                    return (<td key={valueIndex}>{value}</td>)
                                })}
                            </tr>)
                        })}
                    </tbody>
                </table>

                <section>
                    <Node
                        indent={0}
                        id="node-1"
                        text="node-1"
                        child={
                            <Node
                                indent={1}
                                id="node-2"
                                text="node-2"
                                child={<Node
                                    indent={2}
                                    id="node-3"
                                    text="node-3">
                                        <Node indent={3} id="node-4" text="node-4" />
                                        <Node indent={3} id="node-5" text="node-5"></Node>
                                        <Node indent={3} id="node-6" text="node-6">Test</Node>
                                        <Node indent={3} id="node-7" text="node-7">Test{' Test '}Test{' Test'}</Node>
                                    </Node>}
                                />
                        } />
                </section>

                <Page pageType="blog">Blog</Page>
                <Page pageType="video">{'Video'}</Page>
                <NumberDescriber id="odd-number" number={1}></NumberDescriber>
                <NumberDescriber id="even-number" number={2}></NumberDescriber>
                <DisplayUsers users={users} />
                <DisplayUsers2 users={users} />
                <ShorthandFragment />
                <ShorthandFragment2 />

                <Greeting {...user} />
                <DisplayProps id="display-prop-1" message="Hello World"></DisplayProps>

                <Issue19_App />
                <Issue20 />
                <Issue21 />
            </React.Fragment>
        );
    }
}

function ShowLoading() {
    return <div className="loading">Loading...</div>;
}

function ShowError(props) {
    return <div style={{backgroundColor:'red', color:'#fff'}}>{props.error}</div>;
}

function ShowMessage(props) {
    return <div>{props.serverMessage}</div>
}

function ShowProps(props) {
    return <div id={props.id}>{JSON.stringify(props)}</div>
}

function ShowData(props) {
    return <>
            <span>{props.data && props.data.serverMessage ? props.data.serverMessage : null}</span>
            {props.data && props.data.serverMessage ?
                <ShowMessage serverMessage={props.data.serverMessage} />
                : null}
        </>
}

function onViewUpdated() {
    window.testJsonDataHtml = window.testJsonDataHtml || [];
    window.testJsonDataHtml.push(document.querySelector('.test-content.json-data').innerHTML);
};

function onErrorViewUpdated() {
    window.testJsonDataErrorHtml = window.testJsonDataErrorHtml || [];
    window.testJsonDataErrorHtml.push(document.querySelector('.test-content.json-error').innerHTML);
    // This line is not tested but helps verify that `updateView()` uses `try { ... } catch (e) { ... }`
    throw new Error('This should not affect [JsonData]');
};

function TestJsonDataSuccess() {
    return (
        <JsonData
            url="/unit-testing/page-json-data"
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowData />}
            onViewUpdated={onViewUpdated} />
    )
}

function TestJsonDataError() {
    return (
        <JsonData
            url="/404"
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowData />}
            onViewUpdated={onErrorViewUpdated} />
    )
}
