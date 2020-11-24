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

            {/*
                To display markdown from a web service or site only [url] needs to be included:
                    <Markdown url="..." />

                The example below shows additional options to show a loading screen while
                content is being fetched, define a root class, and to update links after
                the markdown has been rendered.

                These attributes make it easy to show content that links to other sites correctly
                and for the current page not to be changed when the user clicks a link.
            */}
            <Markdown
                url="https://raw.githubusercontent.com/dataformsjs/dataformsjs/master/README.md"
                className="markdown-content"
                loadOnlyOnce
                isLoading={<ShowLoading />}
                linkTarget="_blank"
                linkRel="noopener"
                linkRootUrl="https://github.com/dataformsjs/dataformsjs/blob/master/"
            />
        </>
    )
}

{/*
    To see the image error add the prop:
        useRootUrl={false}
    To <Markdown>
*/}
function LocalPage() {
    return (
        <>
            <section className="description">
                <p>By default unless [useRootUrl=false] is used content that points to relative URL's will automatically be handled based on the path of the Markdown Document.</p>
                <p><a href="https://github.com/mark-anders/relative-image-url" target="_blank" rel="noopener">https://github.com/mark-anders/relative-image-url</a></p>
            </section>
            <Markdown
                url="https://raw.githubusercontent.com/mark-anders/relative-image-url/master/README.md"
                className="markdown-content"
                loadOnlyOnce
                isLoading={<ShowLoading />} />
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
                        <NavLink exact to="/local">Local Content</NavLink>
                        <NavLink to="/data">Markdown using Content</NavLink>
                        <NavLink to="/404-content">Markdown Fetch Error</NavLink>
                    </nav>
                </header>
                <main id="view">
                    <Route exact path="/" component={HomePage} />
                    <Route exact path="/local" component={LocalPage} />
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
