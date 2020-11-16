
const Router = window.ReactRouterDOM.HashRouter;
const Route = window.ReactRouterDOM.Route;
const NavLink = window.ReactRouterDOM.NavLink;

function HomePage() {
    return (
        <React.Fragment>
            <h1>Hello World</h1>
        </React.Fragment>
    );
}

function DataPage() {
    return (
        <React.Fragment>
            <json-data url="https://www.dataformsjs.com/data/geonames/countries" load-only-once="true">
                <is-loading template-selector="#loading-screen"></is-loading>
                <has-error template-selector="#error-screen"></has-error>
                <is-loaded class="flex-col">
                    <h1>Countries</h1>

                    <input
                        is="input-filter"
                        filter-selector="table"
                        filter-results-selector="h1"
                        filter-results-text-all="{totalCount} Countries"
                        filter-results-text-filtered="Showing {displayCount} of {totalCount} Countries"
                        placeholder="Enter filter, example 'North America'" />

                    <div class="responsive-table">
                        <data-table
                            data-bind="countries"
                            highlight-class="highlight"
                            labels="Code, Name, Size (KM), Population, Continent"
                            table-attr="is=sortable-table,
                                        data-sort-class-odd=row-odd,
                                        data-sort-class-even=row-even">
                        </data-table>
                    </div>
                </is-loaded>
            </json-data>
        </React.Fragment>
    );
}

function ImagePage() {
    return (
        <React.Fragment>
            <json-data url="https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/index.json">
                <is-loading>
                    <span class="loading">Loading Photos...</span>
                </is-loading>
                <has-error>
                    <h2 class="error">Error loading photos - <span data-bind="errorMessage"></span></h2>
                </has-error>
                <is-loaded>
                    <h1>Image Gallery</h1>
                    <data-list
                        data-bind="images"
                        template-selector="#image-template"
                        root-element="div"
                        root-class="image-gallery">
                    </data-list>
                </is-loaded>
            </json-data>
        </React.Fragment>
    );
}

function MapPage() {
    return (
        <json-data url="https://www.dataformsjs.com/data/geonames/place/5368361">
            <is-loading>
                <span class="loading">Loading Photos...</span>
            </is-loading>
            <has-error>
                <h2 class="error">Error loading photos - <span data-bind="errorMessage"></span></h2>
            </has-error>
            <is-loaded>
                <section>
                    <data-view data-bind="" template-selector="#city-info"></data-view>
                    <div
                        is="leaflet-map"
                        latitude="[place.latitude]"
                        longitude="[place.longitude]"
                        zoom="11"
                        marker="[place.name]"
                        data-bind-attr="latitude, longitude, marker"
                        style={{height:'400px'}}>
                    </div>
                </section>
                <section data-template-url="html/web-component-html-import.htm"></section>
            </is-loaded>
        </json-data>
    )
}

class App extends React.Component {
    render() {
        return (
            <ErrorBoundary>
                <Router>
                    <header>
                        <nav>
                            <NavLink exact to="/" activeClassName="active">Home</NavLink>
                            <NavLink exact to="/data" activeClassName="active">Data Example</NavLink>
                            <NavLink exact to="/images" activeClassName="active">Image Gallery</NavLink>
                            <NavLink exact to="/map" activeClassName="active">Map and Services</NavLink>
                        </nav>
                    </header>

                    <html-import-service></html-import-service>

                    <main id="view" className="container">
                        <Route exact path="/" component={HomePage} />
                        <Route exact path="/data" component={DataPage} />
                        <Route exact path="/images" component={ImagePage} />
                        <Route exact path="/map" component={MapPage} />
                    </main>
                </Router>
            </ErrorBoundary>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

/**
 * If [polyfill.js] is being used then update the view on all hash changes.
 * React Router does not provide an `onChange` event so either 'hashchange'
 * or 'popstate' would have to be used depending on SPA routing to handle this.
 * 
 * In general if doing this un-styled content (is-loading, is-loaded, etc) will
 * quickly flash on screen while loading but it's not important because it still
 * works and browsers that actually use the polyfill (IE 11, etc) don't work on many
 * sites so having a site work is usually enough for user's of older browsers.
 */
window.addEventListener('hashchange', function() {
    if (window.app !== undefined) {
        app.updateView();
    }
});
