
const links = [
    'https://www.geonames.org',
    'https://semantic-ui.com/elements/flag.html',
    'https://jquery.com',
    'https://harvesthq.github.io/chosen/',
    'https://leafletjs.com',
    'https://www.openstreetmap.org',
    'https://developer.mozilla.org/en-US/docs/Web/Web_Components',    
];

function PageInfo({match}) {    
    return (
        <React.Fragment>
            <h1>{i18n.text('Places App Info')}</h1>

            <nav>
                <Link to={'/' + match.params.lang + '/'}>{i18n.text('Countries')}</Link>
            </nav>

            <section>
                <h2>{i18n.text('Overview')}</h2>
                <ul className="info">
                    <li>{i18n.text('info_1')}</li>
                    <li>{i18n.text('info_2')}</li>
                    <li>{i18n.text('info_3')}</li>
                    <li>{i18n.text('info_4')}</li>
                    <li>{i18n.text('info_5')}</li>
                    <li>{i18n.text('info_6')}</li>
                </ul>

                <h2 className="source-code">
                    <span>{i18n.text('source_code')}</span>
                    <img src="https://www.dataformsjs.com/img/logos/GitHub-Mark-32px.png" alt="GitHub" />
                </h2>
                <ul class="info">
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm" target="_blank">React</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-vue.htm" target="_blank">Vue</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-hbs.htm" target="_blank">Handlebars</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-graphql.htm" target="_blank">GraphQL</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-web.htm" target="_blank">{i18n.text('web_components')}</a></li>
                    <li><a href="https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-js.htm" target="_blank">{i18n.text('html_js_only')}</a></li>
                </ul>

                <h2 className="links">{i18n.text('Links')}</h2>
                <ul className="info">
                    {links.map(link => {
                        return <li key={link}><a href={link} target="_blank">{link}</a></li>
                    })}
                </ul>
            </section>
        </React.Fragment>
    );
}
