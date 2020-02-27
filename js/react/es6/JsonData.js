/**
 * DataFormsJS React Component <JsonData>
 *
 * <JsonData> allows a page or elements on a page to use either JSON web services
 * or GraphQL Services to easily download and display data. Depending on the state
 * of the web service <JsonData> will show or hide components from
 * [isLoading, isLoaded, hasError].
 *
 * Examples:
 *     https://www.dataformsjs.com/examples/places-demo-react.htm
 *     https://www.dataformsjs.com/examples/image-classification-react.htm
 *
 * Example Usage (JSON Web Service):
 *     function ShowOrderPage({match}) {
 *         return (
 *             <JsonData
 *                 url="https://example.com/orders/:orderType/:orderId"
 *                 orderType={match.params.orderType}
 *                 orderId={match.params.orderId}
 *                 isLoading={<ShowLoading />}
 *                 hasError={<ShowError />}
 *                 isLoaded={<ShowOrder />}>
 *             </JsonData>
 *         )
 *     }
 *
 * The above example assumes <ShowLoading>, <ShowError>, and <ShowOrder>
 * are components defined by the app and <ShowOrderPage> with {match.params.*}
 * are passed from router such as React Router:
 *     <Route path="/orders/:orderType/:orderId" component={<ShowOrderPage />} />
 *
 * [orderType] and [orderId] are defined dynamically on <JsonData> and
 * will passed to <ShowOrder> as:
 *     {props.params.orderType}
 *     {props.params.orderId}
 *
 * The downloaded data will be available in <ShowOrder> as:
 *     {props.data}
 *
 * Example Usage (GraphQL Service):
 *     function ShowPage({match}) {
 *         return (
 *             <JsonData
 *                 url="https://www.dataformsjs.com/graphql"
 *                 graphQL={true}
 *                 querySrc="https://www.dataformsjs.com/examples/graphql/cities.graphql"
 *                 variables={{
 *                     country: match.params.country,
 *                     region: match.params.region,
 *                 }}
 *                 isLoading={<ShowLoading />}
 *                 hasError={<ShowError />}
 *                 isLoaded={<ShowCities />}>
 *             </JsonData>
 *         )
 *     }
 *
 * The above GraphQL example is from the places demo app which provides examples for both
 * GraphQL and JSON Web services. In addition to specifying a download URL for the GraphQL
 * query it can also be defined in the property [query]. See example code at:
 *     https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
 *     https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/regions-react.jsx
 *     https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/cities-react.jsx
 *
 * If a component needs to update the state of the downloaded data from <JsonData>
 * it can be done from the [isLoaded] component by calling:
 *      this.props.handleChange();
 * or to overwrite [state.data]:
 *      this.props.handleChange({prop1, prop2, etc});
 *
 * For example if the Web Service returned:
 *     { orderId:123, totalAmount:999.99, lineItems:[] }
 * Then you can use:
 *     {props.data.orderId}
 *     {props.data.totalAmount}
 *     {props.data.lineItems.map(...)}
 *
 * Minimal Setup:
 *     Only [url] and [isLoaded] are required to display data:
 *         <JsonData url="https://example.com/data" isLoaded={<ShowData />} />
 *     If a server needs to be pinged without display data then specify only the URL:
 *         <JsonData url="https://example.com/data" />
 *     For GraphQL [graphQL={true}] needs to be defined and either [query] or [querySrc] must be specified:
 *         <JsonData url="https://example.com/data" graphQL={true} query={`..`} />
 *
 * Additional Properties:
 *     <JsonData
 *         ...
 *         loadOnlyOnce={true}
 *         onViewUpdated={callback}
 *         fetchOptions={{}}
 *         fetchHeaders={{}}>
 *     </JsonData>
 *
 * [loadOnlyOnce] defaults to undefined/{false} so data and state are always reloaded
 * when the component is created. In a SPA this would happen each time the page
 * changes. For an SPA that needs to show many pages with real-time data this is
 * ideal, however if you data does not change often or if the state should be kept
 * between page changes then use [loadOnlyOnce={true}]. A good example of this is
 * the demo page [DataFormsJS\examples\image-classification-react.htm]; in the demo
 * if [loadOnlyOnce] is not {true} then images would reset during page changes but
 * because it is set to {true} the images are kept and the state remains valid even
 * if clicking to another page in the SPA while images are sitll being classified
 * from the web service.
 *
 * [onViewUpdated] is an optional callback that can be used to handle custom DOM
 * updates or Unit Testing during data state changes [isLoading, isLoaded, hasError].
 * It would not be common to use in most React Apps however if you want to execute
 * standard JS to manipulate or read DOM once data is ready then this property can be used.
 * An example of this is shown in [DataFormsJS\examples\log-table-react.htm]
 *
 * [fetchOptions] and [fetchHeaders] allow for the app to control the request options
 * and send request headers for the component. The default options used are:
 *     {
 *         mode: 'cors',
 *         cache: 'no-store',
 *         credentials: 'same-origin',
 *     }
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

/**
 * Data Caching for when [loadOnlyOnce={true}] is used
 *
 * Data is saved only once per URL path.
 *
 * Example Path:
 *     https://example.com/data/:list
 *
 * Page Views:
 *     https://example.com/data/records1 (Data Saved to Cache)
 *     https://example.com/data/records2 (Cache data is overwritten)
 *     https://example.com/docs
 *     https://example.com/data/records2 (Data read from Cache because last URL was matched)
 */
const jsonDataCache = [];
const graphQL_Cache = {};

function saveDataToCache(url, query, params, data) {
    // [for (,,,)] is used instead of [for (... of ...)] due to a
    // fatal error when using Babel Standalone with browser code.
    // If babel is fixed for IE then [for...of] can be used in the future.
    for (let n = 0, m = jsonDataCache.length; n < m; n++) {
        const cache = jsonDataCache[n];
        if (cache.url === url && cache.query === query) {
            cache.params = JSON.stringify(params);
            cache.data = data;
            return;
        }
    }
    jsonDataCache.push({
        url: url,
        query: query,
        params: JSON.stringify(params),
        data: data,
    });
}

function getDataFromCache(url, query, params) {
    for (let n = 0, m = jsonDataCache.length; n < m; n++) {
        const cache = jsonDataCache[n];
        if (cache.url === url && cache.query === query) {
            if (JSON.stringify(params) === cache.params) {
                return cache.data;
            }
            break;
        }
    }
    return null;
}

/* eslint-disable no-unused-vars */

/**
 * <IsLoading> Component - Used internally by <JsonData>
 * @param {object} props
 */
function IsLoading(props) {
    const show = (props.fetchState === 0);
    if (!show || !props.children) {
        return null;
    }
    return props.children;
}

/**
 * <HasError> Component - Used internally by <JsonData>
 * @param {object} props
 */
function HasError(props) {
    const show = (props.fetchState === -1);
    if (!show || !props.children) {
        return null;
    }
    let error = props.error;
    if (typeof error === 'string' && error.indexOf('Error') === -1) {
        error = 'Error - ' + error;
    }
    return React.cloneElement(props.children, { error: error });
}

/**
 * <IsLoaded> Component - Used internally by <JsonData>
 * @param {object} props
 */
function IsLoaded(props) {
    const show = (props.fetchState === 1);
    if (!show || !props.children) {
        return null;
    }
    return React.cloneElement(props.children, {
        data: props.data,
        params: props.params,
        handleChange: props.handleChange,
    });
}

/* eslint-enable no-unused-vars */

/**
 * <JsonData> Component
 * @param {object} props
 */
export default class JsonData extends React.Component {
        constructor(props) {
        super(props);
        this._isFetching = false;
        this._isMounted = false;
        this.fetchData = this.fetchData.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            fetchState: 0,
            error: null,
            params: this.getUrlParams(),
            data: null,
        };
    }

    getUrlParams() {
        const params = {};
        if (this.props && this.props.graphQL === true) {
            return (this.props.variables === undefined ? {} : this.props.variables);
        }
        for (const prop in this.props) {
            if (prop !== 'url' && typeof this.props[prop] === 'string') {
                params[prop] = this.props[prop];
            }
        }
        return params;
    }

    componentDidMount() {
        this._isMounted = true;

        // If using GraphQL with a downloaded query then first check cache if it has already been downloaded
        if (this.props.graphQL === true && this.props.query === undefined && this.props.querySrc !== undefined) {
            if (graphQL_Cache[this.props.querySrc] !== undefined) {
                this.props.query = graphQL_Cache[this.props.querySrc];
            }
        }

        // Load data from cache if it matches previous request
        if (this.props.loadOnlyOnce) {
            const data = getDataFromCache(this.props.url, this.props.query, this.getUrlParams());
            if (data !== null) {
                this.setState({
                    fetchState: 1,
                    data: data,
                });
                return;
            }
        }

        // Download GraphQL Query from the [querySrc] is specified before running `fetchData()`.
        if (this.props.graphQL === true && this.props.query === undefined && this.props.querySrc !== undefined) {
            const querySrc = this.props.querySrc;
            const jsonData = this;

            fetch(querySrc, null)
            .then(response => {
                const status = response.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    return Promise.resolve(response);
                } else {
                    const error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
                    return Promise.reject(error);
                }
            })
            .then(response => response.text())
            .then(function(text) {
                graphQL_Cache[querySrc] = text;
                jsonData.props.query = graphQL_Cache[querySrc];
                jsonData.fetchData();
            })
            .catch(function(error) {
                throw new Error('Error Downloading GraphQL Script: [' + querySrc + '], Error: ' + error.toString());
            });
            return;
        }

        // Start downloading data
        this.fetchData();
    }

    // Fetch new data when props change
    componentDidUpdate(prevProps, prevState) {
        let needsRefresh;
        if (this.props.graphQL === true) {
            needsRefresh = (JSON.stringify(prevProps.variables) !== JSON.stringify(this.props.variables));
        } else {
            const prevUrl = this.buildUrl(prevState.params);
            const newUrl = this.buildUrl(this.props);
            needsRefresh = (prevUrl !== newUrl);
        }
        if (needsRefresh) {
            this.setState({ params: this.getUrlParams() }, this.fetchData);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    buildUrl(params) {
        let url = this.props.url;
        if (this.props.graphQL !== true && Object.keys(params).length > 0) {
            for (var param in params) {
                if (url.indexOf(':' + param) > -1) {
                    url = url.replace(new RegExp(':' + param, 'g'), encodeURIComponent(params[param]));
                }
            }
        }
        return url;
    }

    fetchData() {
        let url = this.buildUrl(this.state.params);

        // Exit if this function was called while the data is still being fetched
        if (this._isFetching) {
            return;
        }
        this._isFetching = true;

        // Default Options for fetch
        let options = {
            mode: 'cors',
            cache: 'no-store',
            credentials: 'same-origin',
        };

        // Allow calling site to override the default options and specify request headers
        if (this.props.fetchOptions) {
            options = this.props.fetchOptions;
        }
        if (this.props.fetchHeaders) {
            options.headers = this.props.fetchHeaders;
        }

        // Update options if using GraphQL
        if (this.props.graphQL === true) {
            const variables = (this.props.variables === undefined ? {} : this.props.variables);
            // For GraphQL if the page is being viewed directly from the file system or in an
            // 'about:blank' page then use a GET request instead of a POST. This will only work
            // for GraphQL Services that send CORS '*' and do not use Authentication. This feature
            // is not needed by most apps but can be used by local development or for downloaded pages.
            if (window.location.origin === 'file://' || window.location.origin === 'null') {
                url += (url.indexOf('?') === -1 ? '?' : '&');
                url += 'query=' + encodeURIComponent(this.props.query.trim());
                url += '&variables=' + encodeURIComponent(JSON.stringify(variables));
            } else {
                options.method = 'POST';
                if (options.headers === undefined) {
                    options.headers = { 'Content-Type': 'application/json' };
                } else {
                    options.headers['Content-Type'] = 'application/json';
                }
                options.body = JSON.stringify({
                    query: this.props.query,
                    variables: variables,
                });
            }
        }

        // Set state to render <IsLoading> then fetch data
        this.setState({
            fetchState: 0,
        }, () => {
            // Allow Custom JavaScript events to run if defined
            this.updateView();

            // Fetch the data
            fetch(url, options)
            .then(response => {
                const status = response.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    return Promise.resolve(response);
                } else {
                    const error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
                    return Promise.reject(error);
                }
            })
            .then(response => response.json())
            .then(data => {
                const graphQL = (this.props.graphQL === true);
                if (graphQL) {
                    // GraphQL can return both valid data and errors at the same time.
                    // If there is an error then show the error instead of data.
                    if (data.errors && data.errors.length) {
                        let errorMessage;
                        if (data.errors.length === 1 && data.errors[0].message) {
                            errorMessage = '[GraphQL Error]: ' + data.errors[0].message;
                        } else {
                            const errorTextGraphQLErrors = (typeof this.props.errorTextGraphQLErrors === 'string' ? this.props.errorTextGraphQLErrors : '{count} GraphQL Errors occured. See console for full details.');
                            errorMessage = errorTextGraphQLErrors.replace('{count}', data.errors.length);
                        }
                        console.error(data.errors);
                        throw errorMessage;
                    }
                }
                if (this._isMounted) {
                    this.setState({
                        fetchState: 1,
                        data: (graphQL ? data.data : data),
                    });
                }
                if (this.props.loadOnlyOnce) {
                    saveDataToCache(this.props.url, this.props.query, this.getUrlParams(), (graphQL ? data.data : data));
                }
            })
            .catch(error => {
                if (this._isMounted) {
                    this.setState({
                        fetchState: -1,
                        error: error.toString(),
                    });
                }
            })
            .finally(() => {
                this._isFetching = false;
                this.updateView();
            });
        });
    }

    /**
     * Function passed to the component defined in [isLoaded] as
     * [this.props.handleChange()]. This allows child components
     * to update the state of the parent <JsonData> component.
     *
     * @param {null|object} data
     */
    handleChange(data=null) {
        // [setState()] is only called if the component is still mounted
        // otherwise React will log a development error. If not mounted
        // and [loadOnlyOnce={true}] then the cached property will still
        // be uploaded so if the same page/component is loaded again the
        // updated data will be displayed. This can happen on time-consuming
        // web services that run in the background while a user clicks
        // on different pages (demo example: 'image-classification-react.htm').
        if (this._isMounted) {
            this.setState({ data:(data === null ? this.state.data : data) });
        }
    }

    updateView() {
        if (typeof this.props.onViewUpdated === 'function') {
            try {
                this.props.onViewUpdated();
            } catch (e) {
                console.error(e);
            }
        }
    }

    render() {
        // JSX Version:
        //
        // return (
        //     <React.Fragment>
        //         <IsLoading
        //             fetchState={this.state.fetchState}>
        //             {this.props.isLoading}
        //         </IsLoading>
        //         <HasError
        //             fetchState={this.state.fetchState}
        //             error={this.state.error}>
        //             {this.props.hasError}
        //         </HasError>
        //         <IsLoaded
        //             fetchState={this.state.fetchState}
        //             data={this.state.data}
        //             params={this.state.params}
        //             handleChange={this.handleChange}>
        //             {this.props.isLoaded}
        //         </IsLoaded>
        //     </React.Fragment>
        // );
        return React.createElement(
            React.Fragment,
            null,
            React.createElement(
                IsLoading,
                { fetchState: this.state.fetchState },
                this.props.isLoading
            ),
            React.createElement(
                HasError,
                {
                    fetchState: this.state.fetchState,
                    error: this.state.error,
                },
                this.props.hasError
            ),
            React.createElement(
                IsLoaded,
                {
                    fetchState: this.state.fetchState,
                    data: this.state.data,
                    params: this.state.params,
                    handleChange: this.handleChange,
                },
                this.props.isLoaded
            )
        );
    }
}
