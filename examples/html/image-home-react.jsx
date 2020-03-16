'use strict';

/**
 * This file is used by [examples/image-classification-react.htm]
 * and is similar to to JavaScript code [examples/image-classification.js].
 * [image-classification.js] is used by the Handlebars and Vue Demos.  
 */

function resultClass(probability) {
    if (probability >= 0.67) {
        return 'success-high';
    } else if (probability >= 0.33) {
        return 'success-medium';
    }
    return 'success-low';
}

function ImageItem(props) {
    return (
        <li>
            <img src={props.image.src} />
            <ImagePrediction image={props.image} />
        </li>
    )
}

function ImagePrediction(props) {
    if (props.image.isUploading) {
        return <div className="loading">{i18n.text('Uploading...')}</div>
    }

    if (props.image.hasError) {
        return <div className="error">{i18n.text('Error')}</div>
    }

    if (props.image.predictions && props.image.predictions.length) {
        return props.image.predictions.map(prediction => {            
            return (
                <div className={resultClass(prediction.probability)} key={prediction.wordnet}>
                    {prediction.label} = {format.percent(prediction.probability, 5)}
                </div>
            )
        })
    }
    return null
}

class ShowImages extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const fileInput = e.target;
        for (let n = 0, m = fileInput.files.length; n < m; n++) {
            this.showAndUploadFile(fileInput.files[n]);
        }
    }

    showAndUploadFile(file) {
        // Create Object URL for the selected image
        const imgUrl = window.URL.createObjectURL(file);

        // Resize the image in JS before submitting
        this.resizeImage(imgUrl).then(blob => {
            // Build Form Data for the POST
            const formData = new FormData();
            formData.append('file', blob);

            // Add selected image to the front of the images array
            const img = {
                name: file.name,
                src: imgUrl,
                prediction: null,
                hasError: false,
                isUploading: true,
            };
            this.props.data.images.unshift(img);

            // Notify the parent <JsonData> component of the change
            this.props.handleChange();

            // [handleChange()] can also accept a new object to replace the existing
            // [this.props.data], however because [this.props.data] is a reference
            // and updated directly no parameter is needed. If it were used for this 
            // app both [images] and [predictUrl] would need to be passed because
            // both values come initially from the web service. Example:
            /*
            this.props.handleChange({
                images: this.props.data.images,
                predictUrl: this.props.data.predictUrl,
            });
            */
        
            // Call web-service to make the AI/ML prediction. One loaded
            // update the related image and state of the parent
            // <JsonData> component by calling [handleChange()].
            fetch(this.props.data.predictUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => { return response.json(); })
            .then(response => {
                img.predictions = response.predictions;
            })
            .catch(error => {
                img.hasError = true;
                console.error(error);
            })
            .finally(() => {
                img.isUploading = false;
                this.props.handleChange();
            });
        });
    }

    // Resize an image for prediction before uploading.
    // See full comments in [DataFormsJS\examples\image-classification.js].
    // This code does not resize for quality but rather for classification based on the image model.
    resizeImage(src) {
        return new Promise(function(resolve) {
            const img = new Image();
            img.onload = function(){
                // Resize using a new <canvas> element
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                img.height = 224;
                img.width = 224;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // IE 11 needs a polyfill for [canvas.toBlob]; the polyfill is loaded only if needed.
                const lazy = new LazyLoad();
                const polyfillUrl = 'https://cdn.jsdelivr.net/npm/blueimp-canvas-to-blob@3.16.0/js/canvas-to-blob.min.js';
                lazy.loadPolyfill(canvas.toBlob, polyfillUrl).then(function() {
                    canvas.toBlob(resolve, 'image/jpeg', 0.90);
                });
                
                // Uncomment to view the resized image at the bottom of the page:
                // document.querySelector('body').appendChild(canvas);
            };
            img.src = src;
        });
    }
    
    render() {
        return (
            <React.Fragment>
                <section>
                    <div className="content">
                        <h1>{i18n.text('Image Prediction Demo')}</h1>
                        <input type="file" accept="image/*" onChange={this.onChange} multiple />
                    </div>
                </section>
                <div>
                    <ul className="results">
                    {this.props.data && this.props.data.images && this.props.data.images.map(image => {
                        return <ImageItem image={image} key={image.src}></ImageItem>
                    })}     
                    </ul>
                </div>
            </React.Fragment>
        )
    }
}

function PageImages() {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/ai-ml/sample-data/resnet50"
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowImages />}
            loadOnlyOnce={true} />
    );
}
