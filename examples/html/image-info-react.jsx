
const links = [
    'https://pytorch.org/',
    'https://www.kaggle.com/keras/resnet50',
    'http://image-net.org/',
    'https://en.wikipedia.org/wiki/Computer_vision',
];

function PageInfo() {
    return (
        <section>
            <div className="content">
                <h1>{i18n.text('Image Classification Info')}</h1>

                <h2>{i18n.text('Overview')}</h2>
                <ul className="results">
                    <li className="legend">
                        <div className="success-high">{i18n.text('prob_high')}</div>
                        <div className="success-medium">{i18n.text('prob_med')}</div>
                        <div className="success-low">{i18n.text('prob_low')}</div>
                    </li>
                </ul>                
                <ul className="info">
                    <li>{i18n.text('info_1')}</li>
                    <li>{i18n.text('info_2')}</li>
                    <li>{i18n.text('info_3')}</li>
                    <li>{i18n.text('info_4')}</li>
                    <li>{i18n.text('info_5')}</li>
                    <li>{i18n.text('info_6')}</li>
                    <li>{i18n.text('info_7')}</li>
                    <li>{i18n.text('info_8')}</li>
                    <li>{i18n.text('info_9')}</li>
                    <li>{i18n.text('info_10')}</li>
                    <li>{i18n.text('info_11')}</li>
                    <li><a href="https://unsplash.com/photos/s-fD5Tpew2k" target="_blank">{i18n.text('info_12')}</a></li>
                    <li><a href="https://unsplash.com/photos/FGEHnEMaZnE" target="_blank">{i18n.text('info_13')}</a></li>
                </ul>

                <h2 className="source-code">
                    <span>{i18n.text('source_code')}</span>
                    <img src="https://www.dataformsjs.com/img/logos/GitHub-Mark-32px.png" alt="GitHub" />
                </h2>
                <ul className="info">
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification-vue.htm" target="_blank">Vue</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification-react.htm" target="_blank">React</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification-hbs.htm" target="_blank">Handlebars</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification.js" target="_blank">{i18n.text('src_js_vue_hbs')}</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/image-home-react.jsx" target="_blank">JSX (React)</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification-web.htm" target="_blank">Web Components</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/image-classification-web.js" target="_blank">JavaScript (Web Components)</a></li>
                </ul>

                <h2>{i18n.text('Links')}</h2>
                <ul className="info">
                    {links.map(link => {
                        return <li key={link}><a href={link} target="_blank">{link}</a></li>
                    })}
                </ul>
            </div>
        </section>
    );
}
