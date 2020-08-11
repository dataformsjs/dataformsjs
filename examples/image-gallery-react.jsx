
function ShowLoading() {
    return <p>Loading...</p>;
}

function ShowError(props) {
    return <p>{props.error}</p>;
}

// Example Image Template
function AppImage(props) {
    return <img src={props.thumbnail} alt={props.title} onClick={props.onClick} />
}

// Alternative Example Image Template that uses attribute [data-image] to specify the thumbnail
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
            <ImageGallery images={props.data.images} />

            {/*
                Example Usage:

                1) Using a basic image - no template specified
                    <ImageGallery images={props.data.images} />

                2) Specify custom template using [template] attributee
                    <ImageGallery images={props.data.images} template={<AppImage />} />

                3) Specifiy Template as a Child Element
                    <ImageGallery images={props.data.images}>
                        <AppImage2 />
                    </ImageGallery>
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
