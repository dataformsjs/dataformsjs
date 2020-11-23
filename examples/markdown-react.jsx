const Router = window.ReactRouterDOM.HashRouter;
const Route = window.ReactRouterDOM.Route;
const NavLink = window.ReactRouterDOM.NavLink;

function ShowLoading() {
    return <div className="loading">Loading...</div>;
}

function ShowError(props) {
    return <div className="error">{props.error}</div>;
}

function HomePage() {
    let library = 'None';
    if (window.marked) {
        library = 'marked';
    } else if (window.markdownit) {
        library = 'markdown-it';
    } else if (window.remarkable) {
        library = 'Remarkable';
    }
    return (
        <>
            <h1>DataFormsJS React &lt;Markdown&gt; Component<br /> with [{library}] Markdown Library</h1>
            <Markdown
                url="https://raw.githubusercontent.com/dataformsjs/dataformsjs/master/README.md"
                className="markdown-content" />
        </>
    )
}

function DataPage() {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/random/markdown"
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowMarkdown />} />
    )
}

function ShowMarkdown(props) {
    return (
        <>
            <Markdown content={props.data.content} className="markdown-content" />
            {props.data.list.map(item => {
                return <Markdown content={item.content} className="markdown-content" />
            })}
        </>
    )
}

function ErrorPage() {
    return <Markdown url="/404" className="markdown-content" />
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <header>
                    <nav>
                        <NavLink exact to="/">Home</NavLink>
                        <NavLink to="/data">Markdown using Content</NavLink>
                        <NavLink to="/404-content">Markdown Fetch Error</NavLink>
                    </nav>
                </header>
                <main id="view">
                    <Route exact path="/" component={HomePage} />
                    <Route exact path="/data" component={DataPage} />
                    <Route exact path="/404-content" component={ErrorPage} />
                </main>
            </Router>
        </ErrorBoundary>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
