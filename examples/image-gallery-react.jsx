
function ShowLoading() {
    return <p>Loading...</p>;
}

function ShowError(props) {
    return <p>{props.error}</p>;
}

// Example Image Template
function AppImage(props) {
    return <img
        src={props.thumbnail}
        alt={props.title}
        tabIndex={props.tabIndex}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        key={props.key}
        style={{
            cursor: 'pointer'
        }} />
}

// Alternative Example Image Template that uses attribute [data-image] to specify the thumbnail.
// This template doesn't include [tabIndex] and [onKeyDown] so opening the overlay from keyboard
// isn't supported.
function AppImage2(props) {
    return <span data-image={props.thumbnail} onClick={props.onClick} style={
            {
                margin: '20px',
                width: '300px',
                height: '200px',
                display: 'inline-block',
                backgroundImage: 'url(' + props.thumbnail + ')',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
            }
        } />
}

function ShowImages(props) {
    // This demo currently uses `props.data.images`for the image source which comes from <JsonData>
    // The commented code below shows the format used by <ImageGallery>; [thumbnail] and [image] are
    // required while [title] is optional.
    //
    /*
    const images = [
        {
            thumbnail: "https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/0202795_large_thumb_550.jpg",
            image: "https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/0202795_large.jpg",
            title: "Earth Science"
        },
        {
            thumbnail: "https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/as16-113-18339_large_thumb_550.jpg",
            image: "https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/as16-113-18339_large.jpg",
            title: "Astronaut John Young leaps from lunar surface to salute flag"
        },
    ];
    */

    return (
        <div className="image-gallery">
            <ImageGallery images={props.data.images} tabIndex={5} />

            {/*
                Example Usage:

                1) Using a basic image - no template specified
                   [tabIndex] is optional and when included allows for
                   tab/spacebar to open the overlay.
                    <ImageGallery images={props.data.images} tabIndex={1} />

                2) Specify custom template using [template] attribute
                    <ImageGallery images={props.data.images} template={<AppImage />} />

                3) Specify Template as a Child Element
                    <ImageGallery images={props.data.images}>
                        <AppImage2 />
                    </ImageGallery>

                4) Specify a Different Loading Message and Timeout.
                   Defaults to "Loading..." and 2000 millseconds.
                    <ImageGallery
                        images={props.data.images}
                        loadingText="Carregando..."
                        loadingTimeout={100} />
            */}
        </div>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <JsonData
                url="https://dataformsjs.s3-us-west-1.amazonaws.com/img/example-images/index.json"
                isLoading={<ShowLoading />}
                hasError={<ShowError />}
                isLoaded={<ShowImages />} />
        </ErrorBoundary>
    );
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

// Add CSS Variable Support to IE and older Browsers
const lazy = new LazyLoad();
const supportsCssVars = (window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)'));
const polyfillUrl = 'https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2.1.1/dist/css-vars-ponyfill.min.js';
lazy.loadPolyfill(supportsCssVars, polyfillUrl).then(function() {
    if (window.cssVars) {
        cssVars({ include:'link[rel="stylesheet"][href="css/image-gallery.css"]' });
    }
});
